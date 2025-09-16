import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin, unauthorizedResponse, requireRole } from '@/lib/auth-utils';

const prisma = new PrismaClient();

// GET /api/modules - Get all modules with study years and semesters
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/modules ===');
    
    // Require authentication (any role can view modules)
    await requireAuth();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const studyYearId = searchParams.get('studyYearId');
    const semesterId = searchParams.get('semesterId');

    let whereClause: any = {};
    
    if (semesterId) {
      whereClause.semesterId = parseInt(semesterId);
    } else if (studyYearId) {
      whereClause.semester = {
        studyYearId: parseInt(studyYearId)
      };
    }

    const modules = await prisma.module.findMany({
      where: whereClause,
      include: {
        semester: {
          include: {
            studyYear: true
          }
        },
        _count: {
          select: {
            quizzes: true
          }
        }
      },
      orderBy: [
        { semester: { studyYear: { id: 'asc' } } },
        { semester: { id: 'asc' } },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    
    // Handle auth errors
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return unauthorizedResponse('Vous devez être connecté pour voir les modules');
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des modules' },
      { status: 500 }
    );
  }
}

// POST /api/modules - Create a new module
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/modules ===');
    
    // Require admin or teacher role for creating modules
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const body = await request.json();
    const { name, semesterId } = body;

    if (!name || !semesterId) {
      return NextResponse.json(
        { error: 'Le nom et l\'ID du semestre sont requis' },
        { status: 400 }
      );
    }

    // Check if semester exists
    const semester = await prisma.semester.findUnique({
      where: { id: parseInt(semesterId) }
    });

    if (!semester) {
      return NextResponse.json(
        { error: 'Semestre non trouvé' },
        { status: 404 }
      );
    }

    // Check if module with same name already exists in this semester
    const existingModule = await prisma.module.findFirst({
      where: {
        name,
        semesterId: parseInt(semesterId)
      }
    });

    if (existingModule) {
      return NextResponse.json(
        { error: 'Un module avec ce nom existe déjà dans ce semestre' },
        { status: 409 }
      );
    }

    const module = await prisma.module.create({
      data: {
        name,
        semesterId: parseInt(semesterId),
      },
      include: {
        semester: {
          include: {
            studyYear: true
          }
        },
        _count: {
          select: {
            quizzes: true
          }
        }
      }
    });

    return NextResponse.json({ module }, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    
    // Handle auth errors
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return unauthorizedResponse('Vous devez être connecté pour créer des modules');
      }
      if (error.message.includes('Admin role required')) {
        return unauthorizedResponse('Seuls les administrateurs peuvent créer des modules');
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du module' },
      { status: 500 }
    );
  }
}
