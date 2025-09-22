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
    const examId = id;

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 401 }
      );
    }

    if (!examId) {
      return NextResponse.json(
        { message: 'ID d\'examen invalide' },
        { status: 400 }
      );
    }

    // Get all attempts for this exam by the student
    const attempts = await db.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        quizId: examId,
        finishedAt: { not: null } // Only completed attempts
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
            selectedOption: true,
            question: {
              include: {
                options: true
              }
            }
          }
        }
      },
      orderBy: {
        finishedAt: 'desc'
      }
    });

    if (attempts.length === 0) {
      return NextResponse.json(
        { message: 'Aucune tentative terminée trouvée pour cet examen' },
        { status: 404 }
      );
    }

    // Transform attempts to results format
    const results = attempts.map(attempt => {
      const timeSpent = attempt.finishedAt && attempt.startedAt ? 
        Math.round((attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / 60000) : 0;

      // Calculate score and question results
      const { score, maxScore, questionResults } = calculateAttemptScore(
        attempt.quiz.questions,
        attempt.answers
      );

      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

      return {
        id: attempt.id,
        examId: attempt.quiz.id,
        title: attempt.quiz.title,
        score,
        maxScore,
        percentage: Math.round(percentage * 100) / 100,
        completedAt: attempt.finishedAt!.toISOString(),
        timeSpent,
        attemptNumber: attempts.length - attempts.indexOf(attempt), // Most recent = 1
        questionResults: questionResults.map(qr => ({
          questionId: qr.questionId,
          questionText: qr.questionText,
          questionType: qr.questionType,
          userAnswer: qr.userAnswer,
          correctAnswer: qr.correctAnswer,
          isCorrect: qr.isCorrect,
          partialScore: qr.score,
          maxScore: qr.maxScore,
          explanation: qr.explanation
        }))
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json(
      { message: 'Échec de la récupération des résultats' },
      { status: 500 }
    );
  }
}

// Helper function to calculate attempt score
function calculateAttemptScore(questions: any[], answers: any[]) {
  let totalScore = 0;
  let maxScore = 0;
  const questionResults: any[] = [];

  questions.forEach(question => {
    const questionMaxScore = 1; // Assuming 1 point per question
    maxScore += questionMaxScore;

    // Find user's answers for this question
    const userAnswers = answers.filter(a => a.questionId === question.id);
    const userSelectedOptions = userAnswers.map(a => a.selectedOption).filter(Boolean);
    const userTextAnswer = userAnswers.find(a => a.textAnswer)?.textAnswer;

    const result = calculateQuestionScore(question, userSelectedOptions, userTextAnswer);
    totalScore += result.score;

    questionResults.push({
      questionId: question.id,
      questionText: question.text,
      questionType: question.questionType,
      userAnswer: formatUserAnswer(question, userSelectedOptions, userTextAnswer),
      correctAnswer: formatCorrectAnswer(question),
      isCorrect: result.isCorrect,
      score: result.score,
      maxScore: questionMaxScore,
      explanation: question.explanation,
    });
  });

  return {
    score: Math.round(totalScore * 100) / 100,
    maxScore,
    questionResults,
  };
}

function calculateQuestionScore(question: any, userSelectedOptions: any[], userTextAnswer?: string): {
  score: number;
  isCorrect: boolean;
} {
  const correctOptions = question.options.filter((opt: any) => opt.isCorrect);

  switch (question.questionType) {
    case 'QCMA': // All-or-nothing
      const userSelectedQCMA = new Set(userSelectedOptions.map(opt => opt.id));
      const correctSelectedQCMA = new Set(correctOptions.map((opt: any) => opt.id));
      
      const isExactMatch = userSelectedQCMA.size === correctSelectedQCMA.size &&
        [...userSelectedQCMA].every(id => correctSelectedQCMA.has(id));
      
      return {
        score: isExactMatch ? 1 : 0,
        isCorrect: isExactMatch
      };

    case 'QCMP': // Partial credit
      const userSelectedQCMP = new Set(userSelectedOptions.map(opt => opt.id));
      const correctSelectedQCMP = new Set(correctOptions.map((opt: any) => opt.id));

      let correctCount = 0;
      let incorrectCount = 0;

      userSelectedQCMP.forEach(id => {
        if (correctSelectedQCMP.has(id)) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      });

      const totalCorrect = correctOptions.length;
      const score = Math.max(0, (correctCount - incorrectCount) / totalCorrect);
      
      return {
        score: Math.max(0, score),
        isCorrect: score === 1
      };

    case 'QCS': // Single choice
      const userSelectedQCS = userSelectedOptions[0]?.id;
      const correctOptionQCS = correctOptions[0];
      const isCorrectQCS = userSelectedQCS === correctOptionQCS?.id;
      
      return {
        score: isCorrectQCS ? 1 : 0,
        isCorrect: isCorrectQCS
      };

    case 'QROC': // Open response
      const userText = userTextAnswer?.toLowerCase().trim() || '';
      const correctText = correctOptions[0]?.text?.toLowerCase().trim() || '';
      
      const isCorrectQROC = userText === correctText;
      
      return {
        score: isCorrectQROC ? 1 : 0,
        isCorrect: isCorrectQROC
      };

    default:
      return { score: 0, isCorrect: false };
  }
}

function formatUserAnswer(question: any, userSelectedOptions: any[], userTextAnswer?: string): string[] {
  if (question.questionType === 'QROC') {
    return [userTextAnswer || 'Pas de réponse'];
  }

  if (userSelectedOptions.length === 0) {
    return ['Pas de réponse'];
  }

  return userSelectedOptions.map(option => option.text || 'Option inconnue');
}

function formatCorrectAnswer(question: any): string[] {
  const correctOptions = question.options.filter((opt: any) => opt.isCorrect);
  return correctOptions.map((opt: any) => opt.text);
}
