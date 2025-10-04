import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get comprehensive statistics in parallel
    const [
      totalQuizAttempts,
      completedQuizzes,
      averageScore,
      recentAttempts,
      quizProgress,
      topPerformingQuizzes,
      strugglingQuizzes,
      activityStats,
      universityStats
    ] = await Promise.all([
      // Total quiz attempts
      db.quizAttempt.count({
        where: { userId }
      }),

      // Completed quizzes (with scores)
      db.quizAttempt.count({
        where: { 
          userId,
          finishedAt: { not: null },
          score: { not: null }
        }
      }),

      // Average score
      db.quizAttempt.aggregate({
        where: { 
          userId,
          score: { not: null }
        },
        _avg: {
          score: true
        }
      }),

      // Recent attempts (last 5)
      db.quizAttempt.findMany({
        where: { userId },
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
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Quiz progress stats
      db.quizProgress.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          status: true
        }
      }),

      // Top performing quizzes (highest scores)
      db.quizAttempt.findMany({
        where: { 
          userId,
          score: { not: null }
        },
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
              }
            }
          }
        },
        orderBy: { score: 'desc' },
        take: 3
      }),

      // Struggling areas (lowest scores)
      db.quizAttempt.findMany({
        where: { 
          userId,
          score: { not: null }
        },
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
              }
            }
          }
        },
        orderBy: { score: 'asc' },
        take: 3
      }),

      // Activity stats (attempts by day for last 30 days)
      db.quizAttempt.groupBy({
        by: ['startedAt'],
        where: {
          userId,
          startedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        _count: {
          id: true
        }
      }),

      // Total quizzes available in the system
      db.quiz.count()
    ]);

    // Process activity data for chart
    const activityByDate = activityStats.reduce((acc, stat) => {
      const date = stat.startedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Use the universityStats we already fetched
    const totalQuizzesAvailable = universityStats;

    const completionRate = totalQuizzesAvailable > 0 
      ? (completedQuizzes / totalQuizzesAvailable * 100).toFixed(1)
      : '0';

    // Process progress status
    const progressStats = quizProgress.reduce((acc, progress) => {
      acc[progress.status] = progress._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      overview: {
        totalAttempts: totalQuizAttempts,
        completedQuizzes,
        averageScore: averageScore._avg.score ? Number(averageScore._avg.score).toFixed(1) : '0',
        completionRate,
        totalQuizzesAvailable
      },
      progress: {
        NOT_STARTED: progressStats.NOT_STARTED || 0,
        IN_PROGRESS: progressStats.IN_PROGRESS || 0,
        COMPLETED: progressStats.COMPLETED || 0
      },
      recentActivity: recentAttempts.map(attempt => ({
        id: attempt.id,
        quizTitle: attempt.quiz.title,
        score: attempt.score ? Number(attempt.score) : null,
        completedAt: attempt.finishedAt,
        module: attempt.quiz.module?.name,
        studyYear: attempt.quiz.module?.semester?.studyYear?.name
      })),
      topPerformance: topPerformingQuizzes.map(attempt => ({
        quizTitle: attempt.quiz.title,
        score: Number(attempt.score),
        module: attempt.quiz.module?.name,
        studyYear: attempt.quiz.module?.semester?.studyYear?.name
      })),
      strugglingAreas: strugglingQuizzes.map(attempt => ({
        quizTitle: attempt.quiz.title,
        score: Number(attempt.score),
        module: attempt.quiz.module?.name,
        studyYear: attempt.quiz.module?.semester?.studyYear?.name
      })),
      activityChart: activityByDate
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}