import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { QuestionType } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR', 'STUDENT']);

    const body = await request.json();
    const { 
      selectedModules = [], 
      selectedLessons = [], 
      questionCount = 10, 
      questionTypes,
      timeLimit,
      title = 'Quiz de révision'
    } = body;

    // Validation
    if ((!selectedModules || selectedModules.length === 0) && (!selectedLessons || selectedLessons.length === 0)) {
      return NextResponse.json(
        { error: 'Au moins un module ou une leçon doit être sélectionné' },
        { status: 400 }
      );
    }

    if (questionCount < 1 || questionCount > 50) {
      return NextResponse.json(
        { error: 'Le nombre de questions doit être entre 1 et 50' },
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

    if (where.OR.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un module ou une leçon doit être sélectionné' },
        { status: 400 }
      );
    }

    // Exclude QCS (questions à réponse spécifique) from generated revision quizzes.
    const filteredQuestionTypes = (questionTypes || []).filter((t: any) => t !== 'QCS');
    if (filteredQuestionTypes.length > 0) {
      where.questionType = { in: filteredQuestionTypes };
    } else {
      where.questionType = { not: 'QCS' };
    }

    // Get all matching questions
    const availableQuestions = await db.questionBank.findMany({
      where,
      include: {
        options: true,
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        module: {
          select: {
            id: true,
            name: true
          }
        }
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
      },
      include: {
        generatedQuestions: {
          include: {
            questionBank: {
              include: {
                options: true,
                lesson: {
                  select: {
                    id: true,
                    title: true,
                    module: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                },
                module: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    // Format the response
    const revisionQuiz = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || '',
      type: quiz.type as 'SESSION',
      questionCount: quiz.questionCount || selectedQuestions.length,
      timeLimit: quiz.timeLimit,
      questions: quiz.generatedQuestions.map(gq => gq.questionBank),
      selectedLessons,
      selectedModules,
      createdAt: quiz.createdAt.toISOString()
    };

    return NextResponse.json(revisionQuiz, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la génération du quiz de révision:', error);
    return NextResponse.json(
      { error: 'Échec de la génération du quiz de révision' },
      { status: 500 }
    );
  }
}
