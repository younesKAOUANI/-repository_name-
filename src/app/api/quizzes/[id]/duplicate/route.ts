import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);
    
    const { id } = await params;
    const quizId = parseInt(id);

    // Find the original quiz with all its data
    const originalQuiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        sessionLessons: true,
      },
    });

    if (!originalQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Create the duplicate quiz (without questions for now to avoid complexity)
    const duplicatedQuiz = await db.quiz.create({
      data: {
        title: `${originalQuiz.title} (Copie)`,
        ...(originalQuiz.description && { description: originalQuiz.description }),
        type: originalQuiz.type,
        ...(originalQuiz.lessonId && { lessonId: originalQuiz.lessonId }),
        ...(originalQuiz.moduleId && { moduleId: originalQuiz.moduleId }),
        ...(originalQuiz.timeLimit && { timeLimit: originalQuiz.timeLimit }),
        ...(originalQuiz.order && { order: originalQuiz.order }),
        ...(originalQuiz.questionCount && { questionCount: originalQuiz.questionCount }),
      },
    });

    // Copy questions if they exist
    if (originalQuiz.questions.length > 0) {
      for (const question of originalQuiz.questions) {
        const newQuestion = await db.question.create({
          data: {
            text: question.text,
            questionType: question.questionType,
            order: question.order,
            quizId: duplicatedQuiz.id,
            options: {
              create: question.options.map((option) => ({
                text: option.text,
                isCorrect: option.isCorrect,
              })),
            },
          },
        });
      }
    }

    // Copy session lessons if they exist
    if (originalQuiz.sessionLessons.length > 0) {
      await db.sessionQuizLesson.createMany({
        data: originalQuiz.sessionLessons.map((sessionLesson) => ({
          quizId: duplicatedQuiz.id,
          lessonId: sessionLesson.lessonId,
        })),
      });
    }

    // Fetch the complete duplicated quiz with all relations
    const completeDuplicatedQuiz = await db.quiz.findUnique({
      where: { id: duplicatedQuiz.id },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                semester: {
                  include: {
                    studyYear: true,
                  },
                },
              },
            },
          },
        },
        module: {
          include: {
            semester: {
              include: {
                studyYear: true,
              },
            },
          },
        },
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        sessionLessons: {
          include: {
            lesson: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    return NextResponse.json(completeDuplicatedQuiz);
  } catch (error) {
    console.error('Error duplicating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate quiz' },
      { status: 500 }
    );
  }
}
