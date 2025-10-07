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
            },
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
        { error: 'Tentative non trouvée' },
        { status: 404 }
      );
    }

    console.log('Attempt found:', {
      id: attempt.id,
      quizId: attempt.quizId,
      answersCount: attempt.answers.length,
      generatedQuestionsCount: attempt.quiz.generatedQuestions.length,
      regularQuestionsCount: attempt.quiz.questions.length,
      quizType: attempt.quiz.type
    });

    // Group answers by question
    const answersByQuestion = attempt.answers.reduce((acc, answer) => {
      if (!acc[answer.questionId]) {
        acc[answer.questionId] = [];
      }
      acc[answer.questionId].push(answer);
      return acc;
    }, {} as Record<string, typeof attempt.answers>);

    // Calculate results - handle both revision quizzes (generatedQuestions) and regular quizzes (questions)
    let correctAnswers = 0;
    let questionResults: any[] = [];
    
    if (attempt.quiz.generatedQuestions && attempt.quiz.generatedQuestions.length > 0) {
      // Handle revision quiz with generated questions
      questionResults = attempt.quiz.generatedQuestions.map(generatedQuestion => {
      const question = generatedQuestion.questionBank;
      const userAnswers = answersByQuestion[question.id] || [];
      const selectedOptionIds = userAnswers.map(ans => ans.selectedOptionId).filter(Boolean);
      const correctOptions = question.options.filter((opt: any) => opt.isCorrect);
      
      // Check if answer is correct
      const isCorrect = correctOptions.length === selectedOptionIds.length &&
                       correctOptions.every((opt: any) => selectedOptionIds.includes(opt.id)) &&
                       selectedOptionIds.every(optId => 
                         question.options.find((opt: any) => opt.id === optId && opt.isCorrect)
                       );

      if (isCorrect) {
        correctAnswers++;
      }

      return {
        questionId: question.id,
        questionText: question.text,
        questionType: question.questionType,
        userAnswer: selectedOptionIds.map(id => 
          question.options.find((opt: any) => opt.id === id)?.text || ''
        ).filter(Boolean).join(', '),
        correctAnswer: correctOptions.map((opt: any) => opt.text).join(', '),
        isCorrect: isCorrect,
        explanation: question.explanation,
        explanationImg: question.explanationImg,
        options: question.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          selected: selectedOptionIds.includes(opt.id)
        }))
      };
      });
    } else if (attempt.quiz.questions && attempt.quiz.questions.length > 0) {
      // Handle regular quiz with direct questions
      questionResults = attempt.quiz.questions.map((question: any) => {
        const userAnswers = answersByQuestion[question.id] || [];
        const selectedOptionIds = userAnswers.map(ans => ans.selectedOptionId).filter(Boolean);
        const correctOptions = question.options.filter((opt: any) => opt.isCorrect);
        
        // Check if answer is correct
        const isCorrect = correctOptions.length === selectedOptionIds.length &&
                         correctOptions.every((opt: any) => selectedOptionIds.includes(opt.id)) &&
                         selectedOptionIds.every(optId => 
                           question.options.find((opt: any) => opt.id === optId && opt.isCorrect)
                         );

        if (isCorrect) {
          correctAnswers++;
        }

        return {
          questionId: question.id,
          questionText: question.text,
          questionType: question.questionType,
          userAnswer: selectedOptionIds.map(id => 
            question.options.find((opt: any) => opt.id === id)?.text || ''
          ).filter(Boolean).join(', '),
          correctAnswer: correctOptions.map((opt: any) => opt.text).join(', '),
          isCorrect: isCorrect,
          explanation: question.explanation,
          explanationImg: question.explanationImg,
          options: question.options.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
            selected: selectedOptionIds.includes(opt.id)
          }))
        };
      });
    }

    const maxScore = attempt.quiz.generatedQuestions?.length || attempt.quiz.questions?.length || 0;
    const percentage = maxScore > 0 ? (correctAnswers / maxScore) * 100 : 0;
    const timeSpentSeconds = attempt.finishedAt 
      ? Math.floor((attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / 1000)
      : 0;

    const results = {
      attemptId: attempt.id,
      quizId: attempt.quiz.id,
      quizTitle: attempt.quiz.title,
      score: correctAnswers,
      maxScore: maxScore,
      percentage: percentage,
      correctAnswers: correctAnswers,
      totalQuestions: attempt.quiz.generatedQuestions?.length || attempt.quiz.questions?.length || 0,
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.finishedAt?.toISOString(),
      timeSpent: timeSpentSeconds,
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