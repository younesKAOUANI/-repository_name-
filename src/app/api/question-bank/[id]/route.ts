import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);
    
    const { id } = await params;
    const questionId = id;

    const question = await db.questionBank.findUnique({
      where: { id: questionId },
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
        options: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Erreur lors de la récupération de la question:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération de la question' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const questionId = id;

    const body = await request.json();
    const { text, questionType, studyYearId, lessonId, moduleId, difficulty, explanation, options } = body;

    // Validation
    if (!text || !questionType || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Le texte de la question, le type et au moins 2 options sont requis' },
        { status: 400 }
      );
    }

    // Check if at least one option is correct
    const correctOptions = options.filter((opt: any) => opt.isCorrect);
    if (correctOptions.length === 0) {
      return NextResponse.json(
        { error: 'Au moins une option doit être marquée comme correcte' },
        { status: 400 }
      );
    }

    // Check if question exists
    const existingQuestion = await db.questionBank.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      );
    }

    // Update question with options (delete old options and create new ones)
    const updatedQuestion = await db.$transaction(async (tx) => {
      // Delete existing options
      await tx.questionBankOption.deleteMany({
        where: { questionBankId: questionId },
      });

      // Update question and create new options
      return await tx.questionBank.update({
        where: { id: questionId },
        data: {
          text,
          questionType,
          studyYearId: studyYearId || null,
          lessonId: lessonId || null,
          moduleId: moduleId || null,
          difficulty: difficulty || null,
          explanation: explanation || null,
          options: {
            create: options.map((option: any) => ({
              text: option.text,
              isCorrect: option.isCorrect,
            })),
          },
        },
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
          options: true,
        },
      });
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la question:', error);
    return NextResponse.json(
      { error: 'Échec de la mise à jour de la question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const questionId = id;

    // Check if question exists
    const existingQuestion = await db.questionBank.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      );
    }

    // Delete question (options will be deleted due to cascade)
    await db.questionBank.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ message: 'Question supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la question:', error);
    return NextResponse.json(
      { error: 'Échec de la suppression de la question' },
      { status: 500 }
    );
  }
}
