import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { attemptId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Get quiz attempt with answers
    const attempt = await db.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId: session.user.id
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        answers: {
          include: {
            selectedOption: true,
            question: true
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Tentative non trouvée' },
        { status: 404 }
      );
    }

    // Group answers by question
    const answersByQuestion = attempt.answers.reduce((acc, answer) => {
      if (!acc[answer.questionId]) {
        acc[answer.questionId] = [];
      }
      acc[answer.questionId].push(answer);
      return acc;
    }, {} as Record<string, typeof attempt.answers>);

    // Calculate results
    let correctAnswers = 0;
    const questionResults = attempt.quiz.questions.map(question => {
      const userAnswers = answersByQuestion[question.id] || [];
      const selectedOptionIds = userAnswers.map(ans => ans.selectedOptionId).filter(Boolean);
      const correctOptions = question.options.filter(opt => opt.isCorrect);
      
      // Check if answer is correct
      const isCorrect = correctOptions.length === selectedOptionIds.length &&
                       correctOptions.every(opt => selectedOptionIds.includes(opt.id)) &&
                       selectedOptionIds.every(optId => 
                         question.options.find(opt => opt.id === optId && opt.isCorrect)
                       );

      if (isCorrect) {
        correctAnswers++;
      }

      return {
        id: question.id,
        text: question.text,
        questionType: question.questionType,
        userAnswers: selectedOptionIds,
        correctAnswers: correctOptions.map(opt => opt.id),
        isCorrect: isCorrect,
        options: question.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          selected: selectedOptionIds.includes(opt.id)
        }))
      };
    });

    const results = {
      attemptId: attempt.id,
      quizId: attempt.quiz.id,
      quizTitle: attempt.quiz.title,
      score: attempt.score || Math.round((correctAnswers / attempt.quiz.questions.length) * 100),
      correctAnswers: correctAnswers,
      totalQuestions: attempt.quiz.questions.length,
      startedAt: attempt.startedAt.toISOString(),
      finishedAt: attempt.finishedAt?.toISOString(),
      timeSpent: attempt.finishedAt 
        ? Math.floor((attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / 1000 / 60)
        : null,
      questions: questionResults
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    );
  }
}