import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { QuestionType } from '@prisma/client';

interface StudentAnswer {
  questionId: string;
  selectedOptions: string[];
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
        { message: 'User not found' },
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
        { message: 'Exam attempt not found or already completed' },
        { status: 404 }
      );
    }

    // Calculate score using the scoring logic
    const { score, maxScore, questionResults } = calculateExamScore(
      attempt.quiz.questions,
      submission.answers
    );

    const timeSpent = Math.round((new Date().getTime() - attempt.startedAt.getTime()) / 60000); // minutes

    // Update the attempt with results
    const completedAttempt = await db.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        finishedAt: new Date(submission.completedAt),
        score: score
      }
    });

    // Save individual answers
    await Promise.all(
      submission.answers.flatMap(answer => {
        const questionResult = questionResults.find(qr => qr.questionId === answer.questionId);
        // Handle multiple selected options by creating one record per selected option
        if (answer.selectedOptions.length > 0) {
          return answer.selectedOptions.map(optionId => 
            db.quizAttemptAnswer.create({
              data: {
                attemptId: attempt.id,
                questionId: answer.questionId,
                selectedOptionId: optionId,
                isCorrect: questionResult?.isCorrect || false
              }
            })
          );
        } else {
          // For questions with no selected options (like QROC without implementation)
          return db.quizAttemptAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: answer.questionId,
              selectedOptionId: null,
              isCorrect: questionResult?.isCorrect || false
            }
          });
        }
      })
    );

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
      { message: 'Failed to submit exam' },
      { status: 500 }
    );
  }
}

// Scoring logic (similar to the service but adapted for API)
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
      return 1;
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
  if (!userAnswer) {
    return { score: 0, isCorrect: false };
  }

  const correctOptions = question.options.filter((opt: any) => opt.isCorrect);

  switch (question.questionType) {
    case 'QCMA': // All-or-nothing
      const userSelectedQCMA = new Set(userAnswer.selectedOptions);
      const correctSelectedQCMA = new Set(correctOptions.map((opt: any) => opt.id));
      
      const isExactMatch = userSelectedQCMA.size === correctSelectedQCMA.size &&
        [...userSelectedQCMA].every(id => correctSelectedQCMA.has(id));
      
      return {
        score: isExactMatch ? 1 : 0,
        isCorrect: isExactMatch
      };

    case 'QCMP': // Partial credit
      const userSelectedQCMP = new Set(userAnswer.selectedOptions);
      const correctSelectedQCMP = new Set(correctOptions.map((opt: any) => opt.id));
      const incorrectOptions = question.options.filter((opt: any) => !opt.isCorrect);

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
      const userSelectedQCS = userAnswer.selectedOptions[0];
      const correctOptionQCS = correctOptions[0];
      const isCorrectQCS = userSelectedQCS === correctOptionQCS?.id;
      
      return {
        score: isCorrectQCS ? 1 : 0,
        isCorrect: isCorrectQCS
      };

    case 'QROC': // Open response
      const userText = userAnswer.textAnswer?.toLowerCase().trim() || '';
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

function formatUserAnswer(question: any, userAnswer?: StudentAnswer): string[] {
  if (!userAnswer) return ['Pas de réponse'];

  if (question.questionType === 'QROC') {
    return [userAnswer.textAnswer || 'Pas de réponse'];
  }

  return userAnswer.selectedOptions.map(optionId => {
    const option = question.options.find((opt: any) => opt.id === optionId);
    return option?.text || 'Option inconnue';
  });
}

function formatCorrectAnswer(question: any): string[] {
  const correctOptions = question.options.filter((opt: any) => opt.isCorrect);
  return correctOptions.map((opt: any) => opt.text);
}
