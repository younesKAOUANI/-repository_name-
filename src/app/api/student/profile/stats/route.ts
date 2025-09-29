import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['STUDENT']);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Session utilisateur non trouvée' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get quiz attempts stats
    const quizStats = await db.quizAttempt.aggregate({
      where: {
        userId: userId,
        finishedAt: { not: null }
      },
      _count: { id: true },
      _avg: { score: true },
      _max: { score: true }
    });

    // Get total quizzes completed
    const completedQuizzes = await db.quizAttempt.count({
      where: {
        userId: userId,
        finishedAt: { not: null }
      }
    });

    // Get recent activity (last 10 quiz attempts)
    const recentActivity = await db.quizAttempt.findMany({
      where: {
        userId: userId,
        finishedAt: { not: null }
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            type: true,
            lesson: {
              select: {
                title: true,
                module: {
                  select: {
                    name: true
                  }
                }
              }
            },
            module: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        finishedAt: 'desc'
      },
      take: 10
    });

    // Get study streak (consecutive days with quiz activity)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyActivity = await db.quizAttempt.findMany({
      where: {
        userId: userId,
        finishedAt: {
          gte: sevenDaysAgo,
          lte: today
        }
      },
      select: {
        finishedAt: true
      },
      orderBy: {
        finishedAt: 'desc'
      }
    });

    // Calculate study streak
    let studyStreak = 0;
    const activityDates = new Set();
    weeklyActivity.forEach(attempt => {
      if (attempt.finishedAt) {
        const dateStr = attempt.finishedAt.toISOString().split('T')[0];
        activityDates.add(dateStr);
      }
    });

    // Count consecutive days from today backwards
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityDates.has(dateStr)) {
        studyStreak++;
      } else {
        break;
      }
    }

    // Get performance by subject (module)
    const performanceByModule = await db.quizAttempt.findMany({
      where: {
        userId: userId,
        finishedAt: { not: null }
      },
      include: {
        quiz: {
          include: {
            lesson: {
              include: {
                module: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            module: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Aggregate performance by module
    const modulePerformance = new Map();
    performanceByModule.forEach(attempt => {
      const attemptModule = attempt.quiz.lesson?.module || attempt.quiz.module;
      if (attemptModule) {
        if (!modulePerformance.has(attemptModule.id)) {
          modulePerformance.set(attemptModule.id, {
            id: attemptModule.id,
            name: attemptModule.name,
            totalAttempts: 0,
            totalScore: 0,
            averageScore: 0
          });
        }
        const moduleData = modulePerformance.get(attemptModule.id);
        moduleData.totalAttempts++;
        moduleData.totalScore += Number(attempt.score || 0);
        moduleData.averageScore = Math.round(moduleData.totalScore / moduleData.totalAttempts);
      }
    });

    const stats = {
      totalQuizzes: completedQuizzes,
      averageScore: quizStats._avg.score ? Math.round(Number(quizStats._avg.score)) : 0,
      bestScore: quizStats._max.score ? Number(quizStats._max.score) : 0,
      studyStreak: studyStreak,
      recentActivity: recentActivity.map(attempt => ({
        id: attempt.id,
        score: Number(attempt.score || 0),
        finishedAt: attempt.finishedAt,
        quiz: {
          id: attempt.quiz.id,
          title: attempt.quiz.title,
          type: attempt.quiz.type,
          moduleName: attempt.quiz.lesson?.module?.name || attempt.quiz.module?.name || 'Module inconnu'
        }
      })),
      performanceByModule: Array.from(modulePerformance.values()).sort((a, b) => b.averageScore - a.averageScore)
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
