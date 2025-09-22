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
    const questionId = parseInt(id);    if (isNaN(questionId)) {
      return NextResponse.json(
        { message: 'Invalid question ID' },
        { status: 400 }
      );
    }

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
        { message: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { message: 'Failed to fetch question' },
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

    const questionId = parseInt(id);
    
    if (isNaN(questionId)) {
      return NextResponse.json(
        { message: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { text, questionType, lessonId, moduleId, difficulty, explanation, options } = body;

    // Validation
    if (!text || !questionType || !options || options.length < 2) {
      return NextResponse.json(
        { message: 'Question text, type, and at least 2 options are required' },
        { status: 400 }
      );
    }

    // Check if at least one option is correct
    const correctOptions = options.filter((opt: any) => opt.isCorrect);
    if (correctOptions.length === 0) {
      return NextResponse.json(
        { message: 'At least one option must be marked as correct' },
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
    console.error('Error updating question:', error);
    return NextResponse.json(
      { message: 'Failed to update question' },
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

    const questionId = parseInt(id);
    
    if (isNaN(questionId)) {
      return NextResponse.json(
        { message: 'Invalid question ID' },
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

    // Delete question (options will be deleted due to cascade)
    await db.questionBank.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { message: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
