import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function PATCH(
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
        { error: 'Question non trouvée' },
        { status: 404 }
      );
    }

    // Toggle the active status
    const updatedQuestion = await db.questionBank.update({
      where: { id: questionId },
      data: {
        isActive: !existingQuestion.isActive
      },
      include: {
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
        },
        options: true
      }
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Erreur lors de la modification du statut de la question:', error);
    return NextResponse.json(
      { error: 'Échec de la modification du statut de la question' },
      { status: 500 }
    );
  }
}
