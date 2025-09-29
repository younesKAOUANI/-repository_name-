import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { QuestionType } from '@prisma/client';

interface StudentAnswer {
  questionId: string;
  selectedOptionIds: string[];
  textAnswer?: string;
}

interface ExamSubmission {
  examSessionId: string;
  answers: StudentAnswer[];
  completedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(['STUDENT']);
    const submission: ExamSubmission = await request.json();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 401 }
      );
    }

    // Get the exam attempt
    const attempt = await db.quizAttempt.findUnique({
      where: { 
        id: submission.examSessionId,
        userId: session.user.id,
        finishedAt: null
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
        }
      }
    });

    if (!attempt) {
      return NextResponse.json(
        { message: 'Tentative d\'examen non trouvée ou déjà terminée' },
        { status: 404 }
      );
    }

    // Calculate score using the scoring logic
    const { score, maxScore, questionResults } = calculateExamScore(
      attempt.quiz.questions,
      submission.answers
    );

    const timeSpent = Math.round(
      (new Date().getTime() - attempt.startedAt.getTime()) / 60000
    ); // minutes

    // Update the attempt with results
    const completedAttempt = await db.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        finishedAt: new Date(submission.completedAt),
        score: score
      }
    });

    // Prepare answers for bulk insert
    const answersToInsert = submission.answers.flatMap((answer) => {
      const questionResult = questionResults.find(qr => qr.questionId === answer.questionId);

      if (answer.selectedOptionIds.length > 0) {
        return answer.selectedOptionIds.map((optionId) => ({
          attemptId: attempt.id,
          questionId: answer.questionId,
          selectedOptionId: optionId, // always string
          isCorrect: questionResult?.isCorrect ?? false,
        }));
      }

      // No options selected → use placeholder string instead of null
      return [{
        attemptId: attempt.id,
        questionId: answer.questionId,
        selectedOptionId: "NONE", // 👈 placeholder to satisfy schema
        isCorrect: questionResult?.isCorrect ?? false,
      }];
    });

    // Batch insert for efficiency
    await db.quizAttemptAnswer.createMany({
      data: answersToInsert,
    });

    // Calculate percentage
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    // Prepare detailed result
    const examResult = {
      id: completedAttempt.id,
      examId: attempt.quiz.id,
      title: attempt.quiz.title,
      score,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      completedAt: completedAttempt.finishedAt!.toISOString(),
      timeSpent,
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

    return NextResponse.json(examResult);
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { message: 'Échec de la soumission de l\'examen' },
      { status: 500 }
    );
  }
}

// Scoring logic
function calculateExamScore(questions: any[], answers: StudentAnswer[]) {
  let totalScore = 0;
  let maxScore = 0;
  const questionResults: any[] = [];

  questions.forEach(question => {
    const userAnswer = answers.find(a => a.questionId === question.id);
    const questionMaxScore = getQuestionMaxScore(question.questionType);
    maxScore += questionMaxScore;

    const result = calculateQuestionScore(question, userAnswer);
    totalScore += result.score;

    questionResults.push({
      questionId: question.id,
      questionText: question.text,
      questionType: question.questionType,
      userAnswer: formatUserAnswer(question, userAnswer),
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

function getQuestionMaxScore(questionType: QuestionType): number {
  switch (questionType) {
    case 'QCMA':
    case 'QCS':
    case 'QROC':
    case 'QCMP':
      return 1;
    default:
      return 1;
  }
}

function calculateQuestionScore(question: any, userAnswer?: StudentAnswer): {
  score: number;
  isCorrect: boolean;
} {
  if (!userAnswer) return { score: 0, isCorrect: false };

  const correctOptions = question.options.filter((opt: any) => opt.isCorrect);

  switch (question.questionType) {
    case 'QCMA': {
      const userSelected = new Set(userAnswer.selectedOptionIds);
      const correctSelected = new Set(correctOptions.map((opt: any) => opt.id));

      const isExactMatch =
        userSelected.size === correctSelected.size &&
        [...userSelected].every(id => correctSelected.has(id));

      return { score: isExactMatch ? 1 : 0, isCorrect: isExactMatch };
    }

    case 'QCMP': {
      const userSelected = new Set(userAnswer.selectedOptionIds);
      const correctSelected = new Set(correctOptions.map((opt: any) => opt.id));

      let correctCount = 0;
      let incorrectCount = 0;

      userSelected.forEach(id => {
        if (correctSelected.has(id)) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      });

      const totalCorrect = correctOptions.length;
      const rawScore = Math.max(0, (correctCount - incorrectCount) / totalCorrect);

      return { score: rawScore, isCorrect: rawScore === 1 };
    }

    case 'QCS': {
      const userSelected = userAnswer.selectedOptionIds[0];
      const correctOption = correctOptions[0];
      const isCorrect = userSelected === correctOption?.id;
      return { score: isCorrect ? 1 : 0, isCorrect };
    }

    case 'QROC': {
      const userText = userAnswer.textAnswer?.toLowerCase().trim() || '';
      const correctText = correctOptions[0]?.text?.toLowerCase().trim() || '';
      const isCorrect = userText === correctText;
      return { score: isCorrect ? 1 : 0, isCorrect };
    }

    default:
      return { score: 0, isCorrect: false };
  }
}

function formatUserAnswer(question: any, userAnswer?: StudentAnswer): string[] {
  if (!userAnswer) return ['Pas de réponse'];

  if (question.questionType === 'QROC') {
    return [userAnswer.textAnswer || 'Pas de réponse'];
  }

  return userAnswer.selectedOptionIds.map((optionId: string) => {
    const option = question.options.find((opt: any) => opt.id === optionId);
    return option?.text || 'Option inconnue';
  });
}

function formatCorrectAnswer(question: any): string[] {
  const correctOptions = question.options.filter((opt: any) => opt.isCorrect);
  return correctOptions.map((opt: any) => opt.text);
}
  