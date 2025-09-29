import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const modules = await db.module.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        semester: {
          select: {
            id: true,
            name: true,
            studyYear: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { semester: { studyYear: { name: 'asc' } } },
        { semester: { name: 'asc' } },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération des modules' },
      { status: 500 }
    );
  }
}
