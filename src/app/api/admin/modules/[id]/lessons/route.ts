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
    const moduleId = id;

    const lessons = await db.lesson.findMany({
      where: {
        moduleId: moduleId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Erreur lors de la récupération des leçons:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération des leçons' },
      { status: 500 }
    );
  }
}
