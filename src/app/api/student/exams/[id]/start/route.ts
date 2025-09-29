import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  let session: any = null;
  let examId: string = '';
  
  try {
    session = await requireRole(["STUDENT"]);
    
    const params = await context.params;
    examId = params.id;

    if (!session?.user?.id) {
      console.error("❌ Start exam failed: No user ID found in session", {
        sessionExists: !!session,
        userExists: !!session?.user,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 401 }
      );
    }

    console.log("🚀 Starting exam", {
      examId,
      userId: session.user.id,
      timestamp: new Date().toISOString()
    });

    // First, find the quiz/exam
    const quiz = await db.quiz.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!quiz) {
      console.error("❌ Start exam failed: Quiz not found", {
        examId,
        userId: session.user.id
      });
      return NextResponse.json(
        { message: "Examen non trouvé" },
        { status: 404 }
      );
    }

    // Check for existing active attempt
    const existingAttempt = await db.quizAttempt.findFirst({
      where: {
        quizId: examId,
        userId: session.user.id,
        finishedAt: null
      }
    });

    if (existingAttempt) {
      console.log("📋 Returning existing active attempt", {
        attemptId: existingAttempt.id,
        startedAt: existingAttempt.startedAt
      });
      
      return NextResponse.json({
        sessionId: existingAttempt.id,
        attemptId: existingAttempt.id,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          questions: quiz.questions.map(q => ({
            id: q.id,
            text: q.text,
            questionType: q.questionType,
            order: q.order,
            options: q.options.map(opt => ({
              id: opt.id,
              text: opt.text
            }))
          }))
        },
        timeLimit: quiz.timeLimit,
        startedAt: existingAttempt.startedAt.toISOString()
      });
    }

    // Create new attempt
    const newAttempt = await db.quizAttempt.create({
      data: {
        quizId: examId,
        userId: session.user.id,
        startedAt: new Date()
      }
    });

    console.log("✅ New exam attempt created", {
      attemptId: newAttempt.id,
      examId,
      userId: session.user.id
    });

    // Return the exam session data
    const examSession = {
      sessionId: newAttempt.id,
      attemptId: newAttempt.id,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions.map(q => ({
          id: q.id,
          text: q.text,
          questionType: q.questionType,
          order: q.order,
          options: q.options.map(opt => ({
            id: opt.id,
            text: opt.text
          }))
        }))
      },
      timeLimit: quiz.timeLimit,
      startedAt: newAttempt.startedAt.toISOString()
    };

    return NextResponse.json(examSession);
  } catch (error) {
    console.error("❌ Error starting exam:", error);
    console.error("Error details:", {
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id || 'No session',
      examId: examId || 'No exam ID'
    });
    return NextResponse.json(
      { message: "Échec du démarrage de l'examen" },
      { status: 500 }
    );
  }
}
