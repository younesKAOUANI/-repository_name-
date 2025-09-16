import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/lessons - Get lessons (optionally filtered by moduleId)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    const where = moduleId ? { moduleId: parseInt(moduleId) } : {};

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        module: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des leçons' },
      { status: 500 }
    );
  }
}

// POST /api/lessons - Create a new lesson
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR')) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { title, description, content, moduleId } = await request.json();

    if (!title || !moduleId) {
      return NextResponse.json(
        { message: 'Le titre et l\'ID du module sont requis' },
        { status: 400 }
      );
    }

    // Get the next order number for this module
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
    });

    const order = (lastLesson?.order || 0) + 1;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        content,
        moduleId,
        order,
      },
      include: {
        module: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la leçon' },
      { status: 500 }
    );
  }
}
