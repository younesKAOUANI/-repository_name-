import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// PUT /api/lessons/reorder - Reorder lessons within a module
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR')) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { moduleId, lessonIds } = await request.json();

    if (!moduleId || !Array.isArray(lessonIds)) {
      return NextResponse.json(
        { message: 'Module ID et liste des leçons requis' },
        { status: 400 }
      );
    }

    // Update the order of each lesson
    const updatePromises = lessonIds.map((lessonId, index) =>
      prisma.lesson.update({
        where: { id: lessonId },
        data: { order: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Ordre des leçons mis à jour avec succès' });
  } catch (error) {
    console.error('Error reordering lessons:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la réorganisation des leçons' },
      { status: 500 }
    );
  }
}
