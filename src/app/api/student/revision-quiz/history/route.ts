import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Get all completed revision quiz attempts by the user
    const attempts = await db.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        quiz: {
          type: 'SESSION'
        },
        finishedAt: {
          not: null
        }
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            questionCount: true,
            timeLimit: true
          }
        }
      },
      orderBy: {
        finishedAt: 'desc'
      }
    });

    const history = attempts.map(attempt => ({
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title || 'Quiz de révision',
      quizDescription: attempt.quiz.description || '',
      score: Number(attempt.score) || 0,
      startedAt: attempt.startedAt.toISOString(),
      finishedAt: attempt.finishedAt?.toISOString(),
      timeSpent: attempt.finishedAt 
        ? Math.floor((attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / 1000 / 60)
        : 0,
      questionCount: attempt.quiz.questionCount || 0
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching revision quiz history:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
}