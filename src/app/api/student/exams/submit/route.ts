import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { QuestionType } from "@prisma/client";

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
    const session = await requireRole(["STUDENT"]);
    const submission: ExamSubmission = await request.json();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 401 }
      );
    }

    // Get the unfinished attempt
    const attempt = await db.quizAttempt.findUnique({
      where: { id: submission.examSessionId },
      include: {
        quiz: {
          include: { questions: { include: { options: true } } },
        },
      },
    });

    if (!attempt || attempt.userId !== session.user.id || attempt.finishedAt) {
      return NextResponse.json(
        { message: "Tentative d'examen non trouvée ou déjà terminée" },
        { status: 404 }
      );
    }

    // Calculate score
    const { score, maxScore, questionResults } = calculateExamScore(
      attempt.quiz.questions,
      submission.answers
    );

    const timeSpent = Math.round(
      (Date.now() - attempt.startedAt.getTime()) / 60000
    );

    // Mark attempt as completed
    const completedAttempt = await db.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        finishedAt: new Date(submission.completedAt),
        score,
      },
    });

    // Prepare answers for bulk insert
    const answersToInsert = submission.answers.flatMap((answer) => {
      const questionResult = questionResults.find(
        (qr) => qr.questionId === answer.questionId
      );

      if (answer.selectedOptionIds.length > 0) {
        return answer.selectedOptionIds.map((optionId) => ({
          attemptId: attempt.id,
          questionId: answer.questionId,
          selectedOptionId: optionId,
          isCorrect: questionResult?.isCorrect ?? false,
        }));
      }

      // No options selected → placeholder
      return [
        {
          attemptId: attempt.id,
          questionId: answer.questionId,
          selectedOptionId: "NONE",
          isCorrect: questionResult?.isCorrect ?? false,
        },
      ];
    });

    await db.quizAttemptAnswer.createMany({ data: answersToInsert });

    // Percentage score
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0;

    // Response payload
    const examResult = {
      id: completedAttempt.id,
      examId: attempt.quiz.id,
      title: attempt.quiz.title,
      score,
      maxScore,
      percentage,
      completedAt: completedAttempt.finishedAt!.toISOString(),
      timeSpent,
      questionResults: questionResults.map((qr) => ({
        questionId: qr.questionId,
        questionText: qr.questionText,
        questionType: qr.questionType,
        userAnswer: qr.userAnswer,
        correctAnswer: qr.correctAnswer,
        isCorrect: qr.isCorrect,
        partialScore: qr.score,
        maxScore: qr.maxScore,
        explanation: qr.explanation,
      })),
    };

    return NextResponse.json(examResult);
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      { message: "Échec de la soumission de l'examen" },
      { status: 500 }
    );
  }
}

// ---------- Scoring Helpers ----------

function calculateExamScore(questions: any[], answers: StudentAnswer[]) {
  let totalScore = 0;
  let maxScore = 0;
  const questionResults: any[] = [];

  for (const question of questions) {
    const userAnswer = answers.find((a) => a.questionId === question.id);
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
  }

  return {
    score: Math.round(totalScore * 100) / 100,
    maxScore,
    questionResults,
  };
}

function getQuestionMaxScore(_: QuestionType): number {
  return 1; // all types worth 1 point
}

function calculateQuestionScore(
  question: any,
  userAnswer?: StudentAnswer
): { score: number; isCorrect: boolean } {
  if (!userAnswer) return { score: 0, isCorrect: false };

  const correctOptions = question.options.filter((opt: any) => opt.isCorrect);

  switch (question.questionType) {
    case "QCMA": {
      const isExactMatch = isSetsEqual(
        new Set(userAnswer.selectedOptionIds),
        new Set(correctOptions.map((opt: any) => opt.id))
      );
      return { score: isExactMatch ? 1 : 0, isCorrect: isExactMatch };
    }

    case "QCMP": {
      const userSelected = new Set(userAnswer.selectedOptionIds);
      const correctSelected = new Set(correctOptions.map((opt: any) => opt.id));

      let correctCount = 0;
      let incorrectCount = 0;

      for (const id of userSelected) {
        if (correctSelected.has(id)) correctCount++;
        else incorrectCount++;
      }

      const totalCorrect = correctOptions.length || 1; // avoid div/0
      const rawScore = Math.max(0, (correctCount - incorrectCount) / totalCorrect);

      return { score: rawScore, isCorrect: rawScore === 1 };
    }

    case "QCS": {
      const userSelected = userAnswer.selectedOptionIds[0];
      const isCorrect = userSelected === correctOptions[0]?.id;
      return { score: isCorrect ? 1 : 0, isCorrect };
    }

    case "QROC": {
      const userText = (userAnswer.textAnswer || "").toLowerCase().trim();
      const correctText = (correctOptions[0]?.text || "").toLowerCase().trim();
      const isCorrect = userText === correctText;
      return { score: isCorrect ? 1 : 0, isCorrect };
    }

    default:
      return { score: 0, isCorrect: false };
  }
}

function isSetsEqual(a: Set<any>, b: Set<any>): boolean {
  return a.size === b.size && [...a].every((val) => b.has(val));
}

function formatUserAnswer(question: any, userAnswer?: StudentAnswer): string[] {
  if (!userAnswer) return ["Pas de réponse"];
  if (question.questionType === "QROC") {
    return [userAnswer.textAnswer || "Pas de réponse"];
  }
  return userAnswer.selectedOptionIds.map((id) => {
    const option = question.options.find((opt: any) => opt.id === id);
    return option?.text || "Option inconnue";
  });
}

function formatCorrectAnswer(question: any): string[] {
  return question.options
    .filter((opt: any) => opt.isCorrect)
    .map((opt: any) => opt.text);
}
