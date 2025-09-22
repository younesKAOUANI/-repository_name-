import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const [totalQuizzes, quizzesByType, totalAttempts, averageScoreResult] = await Promise.all([
      // Total quizzes count
      db.quiz.count(),
      
      // Quizzes by type
      db.quiz.groupBy({
        by: ['type'],
        _count: {
          id: true,
        },
      }),
      
      // Total attempts
      db.quizAttempt.count(),
      
      // Average score
      db.quizAttempt.aggregate({
        _avg: {
          score: true,
        },
      }),
    ]);

    // Convert quizzes by type to the expected format
    const quizTypeCounts = {
      QUIZ: 0,
      EXAM: 0,
      SESSION: 0,
    };

    quizzesByType.forEach((item) => {
      quizTypeCounts[item.type] = item._count.id;
    });

    const stats = {
      totalQuizzes,
      quizzesByType: quizTypeCounts,
      totalAttempts,
      averageScore: averageScoreResult._avg.score ? Number(averageScoreResult._avg.score) : 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz statistics' },
      { status: 500 }
    );
  }
}
