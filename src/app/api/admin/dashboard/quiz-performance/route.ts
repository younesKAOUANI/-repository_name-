import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get quiz performance data
    const quizzesWithStats = await db.quiz.findMany({
      include: {
        attempts: {
          where: {
            finishedAt: { not: null },
            score: { not: null }
          },
          select: {
            score: true,
            finishedAt: true
          }
        },
        _count: {
          select: {
            attempts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    const quizPerformance = quizzesWithStats
      .map(quiz => {
        const completedAttempts = quiz.attempts.length;
        const totalAttempts = quiz._count.attempts;
        
        if (completedAttempts === 0) {
          return {
            quizTitle: quiz.title,
            attempts: totalAttempts,
            avgScore: 0,
            completionRate: 0,
            difficulty: 'Easy' as const
          };
        }

        // Calculate average score
        const scores = quiz.attempts.map(attempt => Number(attempt.score) || 0);
        const avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        
        // Calculate completion rate
        const completionRate = totalAttempts > 0 
          ? Math.round((completedAttempts / totalAttempts) * 100)
          : 0;

        // Determine difficulty based on average score and completion rate
        let difficulty: 'Easy' | 'Medium' | 'Hard';
        if (avgScore >= 80 && completionRate >= 80) {
          difficulty = 'Easy';
        } else if (avgScore >= 60 && completionRate >= 60) {
          difficulty = 'Medium';
        } else {
          difficulty = 'Hard';
        }

        return {
          quizTitle: quiz.title,
          attempts: totalAttempts,
          avgScore,
          completionRate,
          difficulty
        };
      })
      .filter(quiz => quiz.attempts > 0) // Only show quizzes with attempts
      .sort((a, b) => b.attempts - a.attempts); // Sort by number of attempts

    return NextResponse.json(quizPerformance);

  } catch (error) {
    console.error('Quiz performance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}