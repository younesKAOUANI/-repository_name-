import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, unauthorizedResponse } from '@/lib/auth-utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/licenses/resources
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await requireAdmin();

    // Get students for license assignment
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        name: true,
      },
      orderBy: { name: 'asc' }
    });

    // Get all study years with their semesters and modules
    const studyYears = await prisma.studyYear.findMany({
      include: {
        semesters: {
          include: {
            modules: {
              include: {
                _count: {
                  select: {
                    lessons: true,
                    quizzes: true
                  }
                }
              },
              orderBy: { name: 'asc' }
            },
            _count: {
              select: {
                modules: true
              }
            }
          },
          orderBy: { id: 'asc' }
        },
        _count: {
          select: {
            semesters: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });
    
    return NextResponse.json({ students, studyYears });
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error fetching license resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' }, 
      { status: 500 }
    );
  }
}
