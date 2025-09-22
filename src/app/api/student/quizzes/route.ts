import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['STUDENT']);
    const { searchParams } = new URL(request.url);
    
    const studyYearId = searchParams.get('studyYearId');

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'User ID not found in session' },
        { status: 400 }
      );
    }

    // Build where clause for filtering
    const where: any = {
      type: 'QUIZ', // Only get regular quizzes, not exams or sessions
    };

    // Apply study year filter
    if (studyYearId) {
      where.OR = [
        { 
          lesson: {
            module: {
              semester: {
                studyYearId: parseInt(studyYearId)
              }
            }
          }
        },
        {
          module: {
            semester: {
              studyYearId: parseInt(studyYearId)
            }
          }
        }
      ];
    }

    // Get quizzes with all related data
    const quizzes = await db.quiz.findMany({
      where,
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
        questions: true,
        attempts: {
          where: {
            userId: session.user.id,
            score: { not: null } // Only completed attempts
          },
          orderBy: {
            finishedAt: 'desc'
          },
          take: 1 // Get the latest attempt
        }
      },
      orderBy: [
        { lesson: { order: 'asc' } }, // Order by lesson order first
        { order: 'asc' }, // Then by quiz order
        { createdAt: 'asc' } // Finally by creation date
      ]
    });

    // Group quizzes by module and organize by lessons
    const moduleMap = new Map<number, any>();

    quizzes.forEach(quiz => {
      // Determine the module (either direct or through lesson)
      const module = quiz.module || quiz.lesson?.module;
      if (!module) return;

      // Determine study year
      let studyYear = null;
      if (quiz.lesson?.module?.semester?.studyYear) {
        studyYear = quiz.lesson.module.semester.studyYear;
      } else if (quiz.module?.semester?.studyYear) {
        studyYear = quiz.module.semester.studyYear;
      }

      // Get or create module entry
      if (!moduleMap.has(module.id)) {
        moduleMap.set(module.id, {
          id: module.id,
          name: module.name,
          description: module.description,
          studyYear: studyYear ? {
            id: studyYear.id,
            name: studyYear.name
          } : undefined,
          lessons: new Map<number, any>()
        });
      }

      const moduleEntry = moduleMap.get(module.id);

      // If quiz is attached to a lesson, group by lesson
      if (quiz.lesson) {
        const lessonId = quiz.lesson.id;
        
        if (!moduleEntry.lessons.has(lessonId)) {
          moduleEntry.lessons.set(lessonId, {
            id: quiz.lesson.id,
            title: quiz.lesson.title,
            description: quiz.lesson.description,
            order: quiz.lesson.order,
            quizzes: []
          });
        }

        const lessonEntry = moduleEntry.lessons.get(lessonId);
        
        // Check if user has completed this quiz
        const latestAttempt = quiz.attempts[0];
        const isCompleted = !!latestAttempt;
        const score = latestAttempt ? Number(latestAttempt.score) || 0 : 0;
        const maxScore = quiz.questions.length;
        const percentage = maxScore > 0 && isCompleted ? (score / maxScore) * 100 : 0;

        lessonEntry.quizzes.push({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          questionsCount: quiz.questions.length,
          order: quiz.order || 0,
          isCompleted,
          score: Math.round(score),
          maxScore,
          percentage,
          completedAt: latestAttempt?.finishedAt?.toISOString(),
          createdAt: quiz.createdAt.toISOString()
        });
      } else {
        // Quiz is directly attached to module (no lesson)
        const directQuizLessonId = -1; // Use -1 for direct module quizzes
        
        if (!moduleEntry.lessons.has(directQuizLessonId)) {
          moduleEntry.lessons.set(directQuizLessonId, {
            id: -1,
            title: 'Quiz de module',
            description: 'Quiz généraux du module',
            order: -1,
            quizzes: []
          });
        }

        const directLessonEntry = moduleEntry.lessons.get(directQuizLessonId);
        
        // Check if user has completed this quiz
        const latestAttempt = quiz.attempts[0];
        const isCompleted = !!latestAttempt;
        const score = latestAttempt ? Number(latestAttempt.score) || 0 : 0;
        const maxScore = quiz.questions.length;
        const percentage = maxScore > 0 && isCompleted ? (score / maxScore) * 100 : 0;

        directLessonEntry.quizzes.push({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          questionsCount: quiz.questions.length,
          order: quiz.order || 0,
          isCompleted,
          score: Math.round(score),
          maxScore,
          percentage,
          completedAt: latestAttempt?.finishedAt?.toISOString(),
          createdAt: quiz.createdAt.toISOString()
        });
      }
    });

    // Convert maps to arrays and sort
    const organizedQuizzes = Array.from(moduleMap.values()).map(moduleEntry => {
      const lessons = Array.from(moduleEntry.lessons.values())
        .sort((a, b) => a.order - b.order)
        .map(lesson => ({
          ...lesson,
          quizzes: lesson.quizzes.sort((a: any, b: any) => a.order - b.order)
        }));

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
