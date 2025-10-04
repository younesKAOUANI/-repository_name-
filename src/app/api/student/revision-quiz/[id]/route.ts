import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Get quiz session with questions from question bank
    const quizSession = await db.quiz.findFirst({
      where: {
        id,
        type: 'SESSION'
      },
      include: {
        generatedQuestions: {
          include: {
            questionBank: {
              include: {
                options: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!quizSession) {
      return NextResponse.json(
        { error: 'Quiz non trouvé' },
        { status: 404 }
      );
    }

    console.log('Quiz trouvé:', {
      id: quizSession.id,
      title: quizSession.title,
      type: quizSession.type,
      questionsCount: quizSession.generatedQuestions?.length || 0
    });

    // Check if quiz has questions
    if (!quizSession.generatedQuestions || quizSession.generatedQuestions.length === 0) {
      return NextResponse.json(
        { error: 'Ce quiz ne contient aucune question' },
        { status: 400 }
      );
    }

    // Check if user has an active attempt for this quiz
    let quizAttempt = await db.quizAttempt.findFirst({
      where: {
        quizId: id,
        userId: session.user.id,
        finishedAt: null
      }
    });

    // If no active attempt, create one
    if (!quizAttempt) {
      quizAttempt = await db.quizAttempt.create({
        data: {
          id: crypto.randomUUID(),
          quizId: id,
          userId: session.user.id,
          startedAt: new Date()
        }
      });
    }

    // Format response for frontend
    const response = {
      sessionId: quizAttempt.id,
      quiz: {
        id: quizSession.id,
        title: quizSession.title,
        description: quizSession.description,
        type: quizSession.type,
        questionCount: quizSession.questionCount,
        timeLimit: quizSession.timeLimit,
        questions: quizSession.generatedQuestions.map(gq => ({
          id: gq.questionBank.id,
          text: gq.questionBank.text,
          questionType: gq.questionBank.questionType,
          order: gq.order,
          options: gq.questionBank.options.map(opt => ({
            id: opt.id,
            text: opt.text
          }))
        }))
      },
      startedAt: quizAttempt.startedAt.toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching revision quiz:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du quiz' },
      { status: 500 }
    );
  }
}