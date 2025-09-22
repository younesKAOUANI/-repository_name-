import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin, unauthorizedResponse } from '@/lib/auth-utils';

const prisma = new PrismaClient();

// GET /api/modules/[id] - Get a specific module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication (any role can view a specific module)
    await requireAuth();

    const { id } = await params;
    const moduleId = parseInt(id);

    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        semester: {
          include: {
            studyYear: true
          }
        },
        lessons: true
      }
    });

    if (!moduleData) {
      return NextResponse.json(
        { error: 'Module non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ module: moduleData });
  } catch (error) {
    console.error('Error fetching module:', error);
    
    // Handle auth errors
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return unauthorizedResponse('Vous devez être connecté pour voir ce module');
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du module' },
      { status: 500 }
    );
  }
}

// PUT /api/modules/[id] - Update a module
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin role for updating modules
    await requireAdmin();

    const { id } = await params;
    const moduleId = parseInt(id);
    const body = await request.json();
    const { name, semesterId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId }
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: 'Module non trouvé' },
        { status: 404 }
      );
    }

    // If semesterId is being changed, check if new semester exists
    if (semesterId && semesterId !== existingModule.semesterId) {
      const semester = await prisma.semester.findUnique({
        where: { id: parseInt(semesterId) }
      });

      if (!semester) {
        return NextResponse.json(
          { error: 'Semestre non trouvé' },
          { status: 404 }
        );
      }
    }

    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        name,
        ...(semesterId && { semesterId: parseInt(semesterId) }),
      },
      include: {
        semester: {
          include: {
            studyYear: true
          }
        },
        _count: {
          select: {
            lessons: true,
            quizzes: true
          }
        }
      }
    });

    return NextResponse.json({ module: updatedModule });
  } catch (error) {
    console.error('Error updating module:', error);
    
    // Handle auth errors
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return unauthorizedResponse('Vous devez être connecté pour modifier des modules');
      }
      if (error.message.includes('Admin role required')) {
        return unauthorizedResponse('Seuls les administrateurs peuvent modifier des modules');
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du module' },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id] - Delete a module
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin role for deleting modules
    await requireAdmin();

    const { id } = await params;
    const moduleId = parseInt(id);

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        _count: {
          select: {
            lessons: true,
            quizzes: true
          }
        }
      }
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: 'Module non trouvé' },
        { status: 404 }
      );
    }

    // Check if module has content (lessons or quizzes)
    if (existingModule._count.lessons > 0 || existingModule._count.quizzes > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un module contenant des leçons ou des quiz' },
        { status: 409 }
      );
    }

    await prisma.module.delete({
      where: { id: moduleId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    
    // Handle auth errors
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return unauthorizedResponse('Vous devez être connecté pour supprimer des modules');
      }
      if (error.message.includes('Admin role required')) {
        return unauthorizedResponse('Seuls les administrateurs peuvent supprimer des modules');
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du module' },
      { status: 500 }
    );
  }
}
