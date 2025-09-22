import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await requireRole(['STUDENT']);
    const examId = parseInt(id);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    // Get the exam with questions
    const exam = await db.quiz.findUnique({
      where: { 
        id: examId,
        type: 'EXAM'
      },
      include: {
        questions: {
          include: {
            options: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        { message: 'Exam not found' },
        { status: 404 }
      );
    }

    // Check if student already has an active attempt for this exam
    let attempt = await db.quizAttempt.findFirst({
      where: {
        userId: session.user.id,
        quizId: examId,
        finishedAt: null // Use finishedAt instead of isCompleted
      }
    });

    // If no active attempt exists, create a new one
    if (!attempt) {
      attempt = await db.quizAttempt.create({
        data: {
          userId: session.user.id,
          quizId: examId,
          startedAt: new Date()
        }
      });
    }

    // Calculate expiration time
    const expiresAt = exam.timeLimit ? 
      new Date(Date.now() + exam.timeLimit * 60 * 1000).toISOString() : 
      undefined;

    // Transform questions for exam session (hide correct answers)
    const sessionQuestions = exam.questions.map(question => ({
      id: question.id,
      text: question.text,
      questionType: question.questionType,
      explanation: undefined, // Hide explanation during exam
      options: question.options.map(option => ({
        id: option.id,
        text: option.text,
        isCorrect: false // Hide correct answers during exam
      }))
    }));

    const examSession = {
      id: attempt.id,
      examId: exam.id,
      title: exam.title,
      description: exam.description,
      timeLimit: exam.timeLimit,
      questions: sessionQuestions,
      startedAt: attempt.startedAt.toISOString(),
      expiresAt
    };

    return NextResponse.json(examSession);
  } catch (error) {
    console.error('Error starting exam:', error);
    return NextResponse.json(
      { message: 'Failed to start exam' },
      { status: 500 }
    );
  }
}
