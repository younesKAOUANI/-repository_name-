import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Parallel queries for better performance
    const [
      totalUsers,
      usersByRole,
      newUsersThisMonth,
      activeUsersToday,
      universities,
      universitiesWithStudents,
      studyYears,
      semesters,
      modules,
      lessons,
      questionBankCount,
      quizStats,
      quizAttempts,
      completedAttempts,
      avgScoreResult,
      licenses,
      activeLicenses,
      expiredLicenses,
      recentAttempts,
      topPerformers,
      recentActivities
    ] = await Promise.all([
      // User statistics
      db.user.count(),
      db.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      db.user.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      db.user.count({
        where: { updatedAt: { gte: startOfToday } }
      }),

      // University statistics
      db.university.count(),
      db.university.count({
        where: {
          driveLinks: {
            some: {}
          }
        }
      }),

      // Content statistics
      db.studyYear.count(),
      db.semester.count(),
      db.module.count(),
      db.lesson.count(),
      db.questionBank.count({ where: { isActive: true } }),

      // Quiz statistics
      db.quiz.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      db.quizAttempt.count(),
      db.quizAttempt.count({
        where: { finishedAt: { not: null } }
      }),
      db.quizAttempt.aggregate({
        _avg: { score: true },
        where: { 
          finishedAt: { not: null },
          score: { not: null }
        }
      }),

      // License statistics
      db.license.count(),
      db.license.count({
        where: { 
          isActive: true,
          endDate: { gte: now }
        }
      }),
      db.license.count({
        where: { 
          OR: [
            { isActive: false },
            { endDate: { lt: now } }
          ]
        }
      }),

      // Activity data
      db.quizAttempt.groupBy({
        by: ['startedAt'],
        _count: { startedAt: true },
        where: {
          startedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),

      // Top performers
      db.user.findMany({
        where: {
          role: 'STUDENT',
          quizAttempts: {
            some: {
              finishedAt: { not: null },
              score: { not: null }
            }
          }
        },
        include: {
          quizAttempts: {
            where: {
              finishedAt: { not: null },
              score: { not: null }
            },
            select: { score: true }
          }
        },
        take: 10
      }),

      // Recent activities (quiz attempts, user registrations, etc.)
      db.quizAttempt.findMany({
        take: 10,
        orderBy: { startedAt: 'desc' },
        include: {
          user: { select: { name: true } },
          quiz: { select: { title: true, type: true } }
        }
      })
    ]);

    // Process user statistics
    const userRoleStats = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<string, number>);

    // Process quiz statistics
    const quizTypeStats = quizStats.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    // Process daily attempts for chart
    const dailyAttempts = recentAttempts.reduce((acc, attempt) => {
      const date = attempt.startedAt.toISOString().split('T')[0];
      const existingDay = acc.find(day => day.date === date);
      if (existingDay) {
        existingDay.count += attempt._count.startedAt;
      } else {
        acc.push({ date, count: attempt._count.startedAt });
      }
      return acc;
    }, [] as { date: string; count: number }[]);

    // Process top performers
    const processedTopPerformers = topPerformers
      .map(user => {
        const scores = user.quizAttempts.map(attempt => Number(attempt.score) || 0);
        const avgScore = scores.length > 0 
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          : 0;
        
        return {
          name: user.name || 'Utilisateur inconnu',
          university: user.university || 'Non spécifiée',
          avgScore
        };
      })
      .filter(performer => performer.avgScore > 0)
      .sort((a, b) => b.avgScore - a.avgScore);

    // Process recent activities
    const processedRecentActivities = recentActivities.map(attempt => ({
      type: 'quiz_attempt',
      description: `${attempt.user.name || 'Utilisateur'} a tenté le ${attempt.quiz.type.toLowerCase()} "${attempt.quiz.title}"`,
      timestamp: attempt.startedAt.toLocaleString('fr-FR'),
      user: attempt.user.name
    }));

    // Calculate revenue (simplified - you might want to add actual plan prices)
    const revenue = activeLicenses * 50; // Assuming 50€ per license

    const dashboardStats = {
      users: {
        total: totalUsers,
        students: userRoleStats.STUDENT || 0,
        instructors: userRoleStats.INSTRUCTOR || 0,
        admins: userRoleStats.ADMIN || 0,
        newThisMonth: newUsersThisMonth,
        activeToday: activeUsersToday
      },
      universities: {
        total: universities,
        withActiveStudents: universitiesWithStudents
      },
      content: {
        studyYears,
        semesters,
        modules,
        lessons,
        questionBank: questionBankCount
      },
      quizzes: {
        total: quizStats.reduce((sum, item) => sum + item._count.type, 0),
        exams: quizTypeStats.EXAM || 0,
        sessions: quizTypeStats.SESSION || 0,
        regular: quizTypeStats.QUIZ || 0,
        attempts: quizAttempts,
        completedAttempts,
        avgScore: Math.round(Number(avgScoreResult._avg.score) || 0)
      },
      licenses: {
        active: activeLicenses,
        expired: expiredLicenses,
        total: licenses,
        revenue
      },
      activity: {
        dailyAttempts,
        topPerformers: processedTopPerformers.slice(0, 6),
        recentActivity: processedRecentActivities.slice(0, 8)
      }
    };

    return NextResponse.json(dashboardStats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}