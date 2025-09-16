import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET /api/study-years - Get all study years with semesters and modules
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeModules = searchParams.get('includeModules') === 'true';

    const studyYears = await prisma.studyYear.findMany({
      include: {
        semesters: {
          include: {
            ...(includeModules && {
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
              }
            }),
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

    // Calculate total modules for each study year
    const studyYearsWithCounts = studyYears.map(year => ({
      ...year,
      _count: {
        ...year._count,
        modules: year.semesters.reduce((total, semester) => 
          total + semester._count.modules, 0
        )
      }
    }));

    return NextResponse.json({ studyYears: studyYearsWithCounts });
  } catch (error) {
    console.error('Error fetching study years:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des années d\'étude' },
      { status: 500 }
    );
  }
}

// POST /api/study-years - Create a new study year
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    // Check if study year with same name already exists
    const existingStudyYear = await prisma.studyYear.findFirst({
      where: { name }
    });

    if (existingStudyYear) {
      return NextResponse.json(
        { error: 'Une année d\'étude avec ce nom existe déjà' },
        { status: 409 }
      );
    }

    const studyYear = await prisma.studyYear.create({
      data: { name },
      include: {
        semesters: {
          include: {
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
      }
    });

    return NextResponse.json({ studyYear }, { status: 201 });
  } catch (error) {
    console.error('Error creating study year:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'année d\'étude' },
      { status: 500 }
    );
  }
}
