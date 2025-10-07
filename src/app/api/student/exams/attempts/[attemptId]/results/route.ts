import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await requireRole(['STUDENT']);
    const { attemptId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'User ID not found in session' },
        { status: 400 }
      );
    }

    // Get the specific attempt with all related data
    const attempt = await db.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId: session.user.id, // Ensure user can only access their own attempts
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true
              }
            },
            module: {
              include: {
                semester: {
                  include: {
                    studyYear: true
                  }
                }
              }
            },
            lesson: {
              include: {
                module: {
                  include: {
                    semester: {
                      include: {
                        studyYear: true
                      }
                    }
                  }
                }
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
        { message: 'Attempt not found' },
        { status: 404 }
      );
    }

    // Calculate the score and prepare question results
    const { score, maxScore, questionResults } = calculateAttemptScore(
      attempt.quiz.questions,
      attempt.answers
    );

    // Calculate time spent
    const timeSpent = attempt.finishedAt && attempt.startedAt
      ? Math.round((attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / 60000)
      : 0;

    // Determine study year
    let studyYear = null;
    if (attempt.quiz.lesson?.module?.semester?.studyYear) {
      studyYear = attempt.quiz.lesson.module.semester.studyYear;
    } else if (attempt.quiz.module?.semester?.studyYear) {
      studyYear = attempt.quiz.module.semester.studyYear;
    }

    const result = {
      id: attempt.id,
      examId: attempt.quiz.id,
      title: attempt.quiz.title,
      description: attempt.quiz.description,
      score: Math.round(Number(attempt.score) || 0),
      maxScore,
      percentage: maxScore > 0 ? ((Number(attempt.score) || 0) / maxScore) * 100 : 0,
      completedAt: attempt.finishedAt?.toISOString() || '',
      startedAt: attempt.startedAt.toISOString(),
      timeSpent,
      questionResults,
      studyYear: studyYear ? {
        id: studyYear.id,
        name: studyYear.name
      } : undefined,
      module: attempt.quiz.module ? {
        id: attempt.quiz.module.id,
        name: attempt.quiz.module.name
      } : attempt.quiz.lesson?.module ? {
        id: attempt.quiz.lesson.module.id,
        name: attempt.quiz.lesson.module.name
      } : undefined,
      lesson: attempt.quiz.lesson ? {
        id: attempt.quiz.lesson.id,
        title: attempt.quiz.lesson.title
      } : undefined
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching attempt results:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch attempt results',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Calculate score and prepare question results for a specific attempt
function calculateAttemptScore(questions: any[], attemptAnswers: any[]) {
  let totalScore = 0;
  let maxScore = 0;
  const questionResults: any[] = [];

  questions.forEach(question => {
    const questionMaxScore = 1; // Assuming 1 point per question
    maxScore += questionMaxScore;

    // Find user's answers for this question
    const userAnswers = attemptAnswers.filter(answer => answer.questionId === question.id);
    
    // Calculate score for this question
    const result = calculateQuestionScore(question, userAnswers);
    totalScore += result.score;

    questionResults.push({
      questionId: question.id,
      questionText: question.text,
      questionType: question.questionType,
      userAnswer: formatUserAnswer(question, userAnswers),
      correctAnswer: formatCorrectAnswer(question),
      isCorrect: result.isCorrect,
      score: result.score,
      maxScore: questionMaxScore,
      explanation: question.explanation,
      explanationImg: question.explanationImg,
    });
  });

  return {
    score: totalScore,
    maxScore,
    questionResults,
  };
}

function calculateQuestionScore(question: any, userAnswers: any[]) {
  const correctOptions = question.options.filter((opt: any) => opt.isCorrect);
  const selectedOptions = userAnswers.map(answer => answer.selectedOption).filter(Boolean);

  if (question.questionType === 'QCMA') {
    // All-or-nothing: must select all correct options and no incorrect ones
    const userSelectedIds = selectedOptions.map((opt: any) => opt.id).sort();
    const correctIds = correctOptions.map((opt: any) => opt.id).sort();
    
    const isCorrect = JSON.stringify(userSelectedIds) === JSON.stringify(correctIds);
    return { score: isCorrect ? 1 : 0, isCorrect };
  } else if (question.questionType === 'QCMP') {
    // Partial credit: points for correct selections, penalties for incorrect
    const totalCorrect = correctOptions.length;
    const userSelectedIds = selectedOptions.map((opt: any) => opt.id);
    
    let correctCount = 0;
    let incorrectCount = 0;
    
    userSelectedIds.forEach(selectedId => {
      if (correctOptions.some((opt: any) => opt.id === selectedId)) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });
    
    // Score calculation: (correct - incorrect) / total_correct, minimum 0
    const score = Math.max(0, (correctCount - incorrectCount) / totalCorrect);
    
    return {
      score,
      isCorrect: score === 1
    };
  } else {
    // QCS, QROC - simple correct/incorrect
    const isCorrect = userAnswers.some(answer => answer.isCorrect);
    return { score: isCorrect ? 1 : 0, isCorrect };
  }
}

function formatUserAnswer(question: any, userAnswers: any[]): string[] {
  if (question.questionType === 'QROC') {
    return userAnswers.map(answer => answer.textAnswer || '').filter(Boolean);
  } else {
    return userAnswers.map(answer => answer.selectedOption?.text || '').filter(Boolean);
  }
}

function formatCorrectAnswer(question: any): string[] {
  const correctOptions = question.options.filter((opt: any) => opt.isCorrect);
  return correctOptions.map((opt: any) => opt.text);
}
