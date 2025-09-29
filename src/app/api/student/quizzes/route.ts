import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest
) {
  try {
    const session = await requireRole(['STUDENT']);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studyYearId = searchParams.get('studyYearId');

    // Build where clause for quizzes
    const quizWhere: any = {
      type: 'QUIZ'  // Only get quizzes, not exams
    };

    // Apply study year filter
    if (studyYearId) {
      quizWhere.OR = [
        { 
          lesson: {
            module: {
              semester: {
                studyYearId: studyYearId
              }
            }
          }
        },
        {
          module: {
            semester: {
              studyYearId: studyYearId
            }
          }
        }
      ];
    }

    // Fetch all quizzes with their related data and user's latest attempt
    const quizzes = await db.quiz.findMany({
      where: quizWhere,
      include: {
        lesson: {
          include: {
            module: {
              include: {
                semester: {
                  include: {
                    studyYear: true
                  }
                }
              }
            }
          }
        },
        module: {
          include: {
            semester: {
              include: {
                studyYear: true
              }
            }
          }
        },
        attempts: {
          where: {
            userId: session.user.id
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        questions: true
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // Group quizzes by module -> lesson
    const moduleMap = new Map<string, any>();
    
    quizzes.forEach(quiz => {
      const mod = quiz.lesson?.module || quiz.module;
      if (!mod) return;

      // Ensure module entry
      if (!moduleMap.has(mod.id)) {
        moduleMap.set(mod.id, {
          id: mod.id,
          name: mod.name,
          description: (mod as any).description,
          semester: (mod as any).semester,
          lessons: new Map<string, any>()
        });
      }
      const moduleEntry = moduleMap.get(mod.id);

      if (quiz.lesson) {
        const lesson = quiz.lesson;
        if (!moduleEntry.lessons.has(lesson.id)) {
          moduleEntry.lessons.set(lesson.id, {
            id: lesson.id,
            title: lesson.title,
            order: lesson.order,
            quizzes: [] as any[]
          });
        }
        const lessonEntry = moduleEntry.lessons.get(lesson.id);

        // Decorate with completion info
        const latestAttempt = quiz.attempts[0] || null;
        const earnedPoints = latestAttempt?.score ? Number(latestAttempt.score) : 0;
        const maxScore = quiz.questions.length || 0;
        const percentage = maxScore > 0 ? (earnedPoints / maxScore) * 100 : 0;
        const isCompleted = latestAttempt?.finishedAt ? true : false;

        lessonEntry.quizzes.push({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          type: quiz.type,
          questionsCount: quiz.questionCount ?? quiz.questions.length,
          timeLimit: quiz.timeLimit,
          order: quiz.order,
          createdAt: quiz.createdAt,
          latestAttempt: latestAttempt ? {
            id: latestAttempt.id,
            score: earnedPoints,
            finishedAt: latestAttempt.finishedAt,
          } : null,
          isCompleted,
          score: Math.round(earnedPoints),
          maxScore,
          percentage,
          completedAt: latestAttempt?.finishedAt ?? null,
          canStart: true // temporary; will compute below per lesson
        });
      } else {
        // Quizzes directly under module; treat as a special lesson
        if (!moduleEntry.lessons.has('module-direct')) {
          moduleEntry.lessons.set('module-direct', {
            id: 'module-direct',
            title: 'Quizzes du module',
            order: 0,
            quizzes: [] as any[]
          });
        }
        const directEntry = moduleEntry.lessons.get('module-direct');

        const latestAttempt = quiz.attempts[0] || null;
        const earnedPoints = latestAttempt?.score ? Number(latestAttempt.score) : 0;
        const maxScore = quiz.questions.length || 0;
        const percentage = maxScore > 0 ? (earnedPoints / maxScore) * 100 : 0;
        const isCompleted = latestAttempt?.finishedAt ? true : false;

        directEntry.quizzes.push({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          type: quiz.type,
          questionsCount: quiz.questionCount ?? quiz.questions.length,
          timeLimit: quiz.timeLimit,
          order: quiz.order ?? 0,
          createdAt: quiz.createdAt,
          latestAttempt: latestAttempt ? {
            id: latestAttempt.id,
            score: earnedPoints,
            finishedAt: latestAttempt.finishedAt,
          } : null,
          isCompleted,
          score: Math.round(earnedPoints),
          maxScore,
          percentage,
          completedAt: latestAttempt?.finishedAt ?? null,
          canStart: true
        });
      }
    });

    // Compute gating per lesson: a quiz is unlocked if first in order, or previous quiz completed with >=80%
    const organizedQuizzes = Array.from(moduleMap.values()).map(moduleEntry => {
      const lessons = Array.from(moduleEntry.lessons.values())
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((lesson: any) => {
          // Sort quizzes by order
          lesson.quizzes.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
          // Apply gating
          for (let i = 0; i < lesson.quizzes.length; i++) {
            if (i === 0) {
              lesson.quizzes[i].canStart = true; // first quiz is always available
              continue;
            }
            const prev = lesson.quizzes[i - 1];
            const allow = prev.isCompleted && (prev.percentage ?? 0) >= 80;
            lesson.quizzes[i].canStart = allow;
          }
          return lesson;
        });

      return {
        ...moduleEntry,
        lessons
      };
    });

    return NextResponse.json(organizedQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch quizzes',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
