import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { QuestionType } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(['STUDENT']);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Session utilisateur non trouvée' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      selectedModules = [], 
      selectedLessons = [], 
      questionCount = 10, 
      questionTypes,
      difficulty,
      timeLimit = 15,
      title = 'Quiz de révision'
    } = body;

    // Validation
    if ((!selectedModules || selectedModules.length === 0) && (!selectedLessons || selectedLessons.length === 0)) {
      return NextResponse.json(
        { error: 'Au moins un module ou une leçon doit être sélectionné' },
        { status: 400 }
      );
    }

    if (questionCount < 5 || questionCount > 50) {
      return NextResponse.json(
        { error: 'Le nombre de questions doit être entre 5 et 50' },
        { status: 400 }
      );
    }

    // Build where clause for finding questions
    const where: any = {
      isActive: true,
      OR: []
    };

    if (selectedLessons.length > 0) {
      where.OR.push({
        lessonId: {
          in: selectedLessons
        }
      });
    }

    if (selectedModules.length > 0) {
      where.OR.push({
        moduleId: {
          in: selectedModules
        }
      });
      
      // Also include questions from lessons within these modules
      where.OR.push({
        lesson: {
          moduleId: {
            in: selectedModules
          }
        }
      });
    }

    // Add additional filters
    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (questionTypes && questionTypes.length > 0) {
      where.questionType = {
        in: questionTypes
      };
    }

    // Get all matching questions
    const availableQuestions = await db.questionBank.findMany({
      where,
      include: {
        options: true
      }
    });

    if (availableQuestions.length === 0) {
      return NextResponse.json(
        { error: 'Aucune question trouvée pour les critères sélectionnés' },
        { status: 400 }
      );
    }

    if (availableQuestions.length < questionCount) {
      return NextResponse.json(
        { error: `Seulement ${availableQuestions.length} questions disponibles, mais ${questionCount} demandées` },
        { status: 400 }
      );
    }

    // Shuffle and select the requested number of questions
    const shuffledQuestions = availableQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, questionCount);

    // Create a session quiz
    const quiz = await db.quiz.create({
      data: {
        id: createId(),
        title,
        description: `Quiz de révision généré avec ${questionCount} questions`,
        type: 'SESSION',
        questionCount,
        timeLimit,
        generatedQuestions: {
          create: selectedQuestions.map((question, index) => ({
            questionBankId: question.id,
            order: index + 1
          }))
        }
      }
    });

    // Create an attempt for the student
    const attempt = await db.quizAttempt.create({
      data: {
        id: createId(),
        userId: session.user.id,
        quizId: quiz.id,
        startedAt: new Date()
      }
    });

    // Format questions for the session (without correct answers)
    const questions = selectedQuestions.map((question, index) => ({
      id: question.id,
      text: question.text,
      questionType: question.questionType,
      order: index + 1,
      options: question.options.map(option => ({
        id: option.id,
        text: option.text
        // Don't include isCorrect in the response
      }))
    }));

    return NextResponse.json({
      sessionId: attempt.id,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        type: quiz.type,
        questionCount: quiz.questionCount,
        timeLimit: quiz.timeLimit,
        questions
      },
      startedAt: attempt.startedAt.toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la session de révision:', error);
    return NextResponse.json(
      { error: 'Échec de la création de la session de révision' },
      { status: 500 }
    );
  }
}
