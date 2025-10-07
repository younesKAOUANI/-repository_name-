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

    // Get basic statistics first to avoid timeout
    const [
      totalQuizAttempts,
      completedQuizzes,
      averageScore
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
      })
    ]);

    // Get recent attempts with simplified includes
    const recentAttempts = await db.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get quiz progress stats if the table exists
    let quizProgress: any = [];
    try {
      quizProgress = await db.quizProgress.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          status: true
        }
      });
    } catch (error) {
      // QuizProgress table might not exist, continue without it
      console.log('QuizProgress table not found, skipping...');
    }

    // Get performance stats with simplified queries
    const [topPerformingQuizzes, strugglingQuizzes] = await Promise.all([
      // Top performing quizzes (simplified)
      db.quizAttempt.findMany({
        where: { 
          userId,
          score: { not: null }
        },
        include: {
          quiz: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { score: 'desc' },
        take: 3
      }),

      // Struggling areas (simplified)
      db.quizAttempt.findMany({
        where: { 
          userId,
          score: { not: null }
        },
        include: {
          quiz: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { score: 'asc' },
        take: 3
      })
    ]);

    // Get total quizzes count separately to avoid timeout
    const totalQuizzesAvailable = await db.quiz.count();

    const completionRate = totalQuizzesAvailable > 0 
      ? (completedQuizzes / totalQuizzesAvailable * 100).toFixed(1)
      : '0';

    // Process progress status
    const progressStats = quizProgress.reduce((acc: any, progress: any) => {
      acc[progress.status] = progress._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Get simple activity data for last 7 days instead of 30 to reduce complexity
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activityStats = await db.quizAttempt.groupBy({
      by: ['startedAt'],
      where: {
        userId,
        startedAt: {
          gte: last7Days
        }
      },
      _count: {
        id: true
      }
    });

    const activityByDate = activityStats.reduce((acc, stat) => {
      const date = stat.startedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + stat._count.id;
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
        module: attempt.quiz.module?.name || 'Unknown Module'
      })),
      topPerformance: topPerformingQuizzes.map(attempt => ({
        quizTitle: attempt.quiz.title,
        score: Number(attempt.score)
      })),
      strugglingAreas: strugglingQuizzes.map(attempt => ({
        quizTitle: attempt.quiz.title,
        score: Number(attempt.score)
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