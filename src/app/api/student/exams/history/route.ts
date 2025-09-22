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

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'User ID not found in session' },
        { status: 400 }
      );
    }

    // Build where clause for filtering quiz attempts
    const where: any = {
      userId: session.user.id,
      score: { not: null }, // Only completed attempts
    };

    // Apply filters to the quiz
    const quizWhere: any = {
      type: { in: ['QUIZ', 'EXAM'] },
    };

    if (moduleId) {
      quizWhere.moduleId = parseInt(moduleId);
    }

    if (lessonId) {
      quizWhere.lessonId = parseInt(lessonId);
    }

    if (studyYearId) {
      quizWhere.OR = [
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

    // Add quiz filter to attempts where clause
    where.quiz = quizWhere;

    // Get quiz attempts with quiz data
    const attempts = await db.quizAttempt.findMany({
      where,
      include: {
        quiz: {
          include: {
            module: {
              include: {
                semester: {
                  include: {
                    studyYear: true
                  }
                }
              }
            },
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
            questions: true
          }
        }
      },
      orderBy: { finishedAt: 'desc' }
    });

    // Convert all attempts to exam history format
    const examHistory = attempts.map(attempt => {
      const earnedPoints = Number(attempt.score) || 0; // Points earned (e.g., 2.0)
      const maxScore = attempt.quiz.questions.length; // Total questions (e.g., 3)
      const percentage = maxScore > 0 ? (earnedPoints / maxScore) * 100 : 0; // (2.0/3) * 100 = 66.67%
      const currentScore = Math.round(earnedPoints); // Round to nearest whole number for display

      // Determine study year from module or lesson
      let studyYear = null;
      if (attempt.quiz.lesson?.module?.semester?.studyYear) {
        studyYear = attempt.quiz.lesson.module.semester.studyYear;
      } else if (attempt.quiz.module?.semester?.studyYear) {
        studyYear = attempt.quiz.module.semester.studyYear;
      }

      return {
        id: attempt.quiz.id,
        attemptId: attempt.id, // Include attempt ID to distinguish between multiple attempts
        title: attempt.quiz.title,
        description: attempt.quiz.description,
        timeLimit: attempt.quiz.timeLimit,
        questionsCount: attempt.quiz.questions.length,
        isCompleted: true,
        score: currentScore, // Rounded whole number for display
        maxScore,
        percentage,
        startedAt: attempt.startedAt?.toISOString(),
        completedAt: attempt.finishedAt?.toISOString(),
        createdAt: attempt.quiz.createdAt.toISOString(),
        studyYear: studyYear ? {
          id: studyYear.id,
          name: studyYear.name
        } : undefined,
        module: attempt.quiz.module ? {
          id: attempt.quiz.module.id,
          name: attempt.quiz.module.name
        } : attempt.quiz.lesson?.module ? {
          id: attempt.quiz.lesson.module.id,
          name: attempt.quiz.lesson.module.name
        } : undefined,
        lesson: attempt.quiz.lesson ? {
          id: attempt.quiz.lesson.id,
          title: attempt.quiz.lesson.title
        } : undefined
      };
    });

    return NextResponse.json(examHistory);
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
