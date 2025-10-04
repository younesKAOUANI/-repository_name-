import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const { answers } = await request.json();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Find the active quiz attempt
    const quizAttempt = await db.quizAttempt.findFirst({
      where: {
        quizId: id,
        userId: session.user.id,
        finishedAt: null
      }
    });

    if (!quizAttempt) {
      return NextResponse.json(
        { error: 'Session de quiz non trouvée' },
        { status: 404 }
      );
    }

    // Get quiz with questions and correct answers
    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz non trouvé' },
        { status: 404 }
      );
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    // Save answers and calculate score
    for (const [questionId, selectedOptionIds] of Object.entries(answers)) {
      const question = quiz.questions.find(q => q.id === questionId);
      if (!question) continue;

      const correctOptions = question.options.filter(opt => opt.isCorrect);
      const selectedOptions = Array.isArray(selectedOptionIds) ? selectedOptionIds : [selectedOptionIds];
      
      // Check if answer is correct (all correct options selected, no incorrect ones)
      const correctSelected = correctOptions.every(opt => selectedOptions.includes(opt.id));
      const incorrectSelected = selectedOptions.some(optId => 
        question.options.find(opt => opt.id === optId && !opt.isCorrect)
      );
      
      const isCorrect = correctSelected && !incorrectSelected && selectedOptions.length === correctOptions.length;
      
      if (isCorrect) {
        correctAnswers++;
      }

      // Delete existing answers for this question
      await db.quizAttemptAnswer.deleteMany({
        where: {
          attemptId: quizAttempt.id,
          questionId: questionId
        }
      });

      // Save new answers (one record per selected option)
      for (const optionId of selectedOptions) {
        await db.quizAttemptAnswer.create({
          data: {
            id: crypto.randomUUID(),
            attemptId: quizAttempt.id,
            questionId: questionId,
            selectedOptionId: optionId,
            isCorrect: isCorrect
          }
        });
      }
    }

    // Calculate final score
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Update quiz attempt
    const updatedAttempt = await db.quizAttempt.update({
      where: { id: quizAttempt.id },
      data: {
        finishedAt: new Date(),
        score: score
      }
    });

    // Prepare detailed results
    const results = {
      attemptId: updatedAttempt.id,
      score: score,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      percentage: score,
      timeSpent: Math.floor((new Date().getTime() - quizAttempt.startedAt.getTime()) / 1000 / 60), // in minutes
      questions: quiz.questions.map(question => {
        const userAnswers = Object.keys(answers).includes(question.id) 
          ? (Array.isArray(answers[question.id]) ? answers[question.id] : [answers[question.id]])
          : [];
        
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        const isCorrect = correctOptions.every(opt => userAnswers.includes(opt.id)) && 
                         userAnswers.length === correctOptions.length &&
                         !userAnswers.some((optId: string) => 
                           question.options.find(opt => opt.id === optId && !opt.isCorrect)
                         );

        return {
          id: question.id,
          text: question.text,
          userAnswers: userAnswers,
          correctAnswers: correctOptions.map(opt => opt.id),
          isCorrect: isCorrect,
          options: question.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
            selected: userAnswers.includes(opt.id)
          }))
        };
      })
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error submitting revision quiz:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la soumission du quiz' },
      { status: 500 }
    );
  }
}