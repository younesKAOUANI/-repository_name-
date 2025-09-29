import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const studyYears = await db.studyYear.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(studyYears);
  } catch (error) {
    console.error('Erreur lors de la récupération des années d\'étude:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération des années d\'étude' },
      { status: 500 }
    );
  }
}
