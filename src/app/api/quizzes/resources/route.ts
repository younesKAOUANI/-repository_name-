import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const studyYears = await db.studyYear.findMany({
      include: {
        semesters: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: {
                    id: true,
                    title: true,
                  },
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
              orderBy: {
                name: 'asc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ studyYears });
  } catch (error) {
    console.error('Error fetching quiz resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz resources' },
      { status: 500 }
    );
  }
}
