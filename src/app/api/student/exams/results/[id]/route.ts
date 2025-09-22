import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await requireRole(['STUDENT']);
    const resultId = parseInt(id);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    // Get the exam attempt with full details
    const attempt = await db.quizAttempt.findUnique({
      where: { 
        id: resultId,
        userId: session.user.id,
        finishedAt: { not: null }  // Only completed attempts
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        },
        answers: {
          include: {
            question: {
              include: {
                options: true
              }
            }
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json(
        { message: 'Exam result not found' },
        { status: 404 }
      );
    }

    // Calculate summary statistics
    const totalQuestions = attempt.quiz.questions.length;
    const correctAnswers = attempt.answers.filter(answer => answer.isCorrect).length;
    const maxScore = totalQuestions; // Assuming 1 point per question
    const actualScore = Number(attempt.score || 0);
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Calculate time spent (difference between startedAt and finishedAt in minutes)
    const timeSpentMinutes = attempt.finishedAt 
      ? Math.round((attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / (1000 * 60))
      : 0;

    const examResult = {
      id: attempt.id,
      examId: attempt.quiz.id,
      title: attempt.quiz.title,
      score: actualScore,
      maxScore: maxScore,
      questionsCorrect: correctAnswers,
      totalQuestions: totalQuestions,
      percentage: percentage,
      submittedAt: attempt.finishedAt!.toISOString(),
      timeSpent: timeSpentMinutes
    };

    return NextResponse.json(examResult);
  } catch (error) {
    console.error('Error fetching exam result:', error);
    return NextResponse.json(
      { message: 'Failed to fetch exam result' },
      { status: 500 }
    );
  }
}
