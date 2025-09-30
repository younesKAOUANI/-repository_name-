import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['STUDENT']);
    const { searchParams } = new URL(request.url);

    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');
    const studyYearId = searchParams.get('studyYearId');
    const type = (searchParams.get('type') || 'ALL').toUpperCase(); // QUIZ | EXAM | ALL

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'User ID not found in session' }, { status: 400 });
    }

    // Build quiz filters
    const quizWhere: any = {};
    if (type === 'QUIZ') quizWhere.type = 'QUIZ';
    else if (type === 'EXAM') quizWhere.type = 'EXAM';
    else quizWhere.type = { in: ['QUIZ', 'EXAM'] };

    if (moduleId) quizWhere.moduleId = moduleId;
    if (lessonId) quizWhere.lessonId = lessonId;

    if (studyYearId) {
      quizWhere.OR = [
        {
          lesson: { module: { semester: { studyYearId } } }
        },
        {
          module: { semester: { studyYearId } }
        }
      ];
    }

    // Get all attempts with lightweight quiz info
    const attempts = await db.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        score: { not: null },
        quiz: quizWhere
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            createdAt: true,
            module: {
              select: {
                id: true,
                name: true,
                semester: {
                  select: {
                    studyYear: { select: { id: true, name: true } }
                  }
                }
              }
            },
            lesson: {
              select: {
                id: true,
                title: true,
                module: {
                  select: {
                    id: true,
                    name: true,
                    semester: {
                      select: {
                        studyYear: { select: { id: true, name: true } }
                      }
                    }
                  }
                }
              }
            },
            _count: { select: { questions: true } }
          }
        }
      },
      orderBy: [
        { quizId: 'asc' },
        { finishedAt: 'desc' }
      ]
    });

    // Map attempts into exam history objects
    const examHistory = attempts.map(attempt => {
      const quiz = attempt.quiz;
      if (!quiz) return null;

      const earnedPoints = Number(attempt.score) || 0;
      const maxScore = quiz._count.questions ?? 0;
      const percentage = maxScore > 0 ? (earnedPoints / maxScore) * 100 : 0;

      // Prefer lesson.module.studyYear, then module.studyYear
      const studyYear =
        quiz.lesson?.module?.semester?.studyYear ??
        quiz.module?.semester?.studyYear ??
        null;

      const module =
        quiz.module
          ? { id: quiz.module.id, name: quiz.module.name }
          : quiz.lesson?.module
          ? { id: quiz.lesson.module.id, name: quiz.lesson.module.name }
          : undefined;

      return {
        id: quiz.id,
        attemptId: attempt.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questionsCount: maxScore,
        isCompleted: true,
        score: earnedPoints, // keep fractional if any
        scoreRounded: Math.round(earnedPoints), // UI-friendly rounded
        maxScore,
        percentage,
        startedAt: attempt.startedAt?.toISOString(),
        completedAt: attempt.finishedAt?.toISOString(),
        createdAt: quiz.createdAt.toISOString(),
        studyYear: studyYear ? { id: studyYear.id, name: studyYear.name } : undefined,
        module,
        lesson: quiz.lesson ? { id: quiz.lesson.id, title: quiz.lesson.title } : undefined
      };
    }).filter(Boolean);

    return NextResponse.json(examHistory, {
      status: 200,
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }
    });
  } catch (error) {
    console.error('Error fetching exam history:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch exam history',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
