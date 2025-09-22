import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { QuestionType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const questionType = searchParams.get('questionType') as QuestionType;
    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { text: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Question type filter
    if (questionType) {
      where.questionType = questionType;
    }

    // Module filter
    if (moduleId) {
      where.moduleId = parseInt(moduleId);
    }

    // Lesson filter
    if (lessonId) {
      where.lessonId = parseInt(lessonId);
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Active status filter
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [questions, totalCount] = await Promise.all([
      db.questionBank.findMany({
        where,
        include: {
          lesson: {
            include: {
              module: {
                include: {
                  semester: {
                    include: {
                      studyYear: true,
                    },
                  },
                },
              },
            },
          },
          module: {
            include: {
              semester: {
                include: {
                  studyYear: true,
                },
              },
            },
          },
          options: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.questionBank.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      questions,
      pagination: {
        currentPage: page,
        totalPages,
        pageSize,
        totalItems: totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching question bank:', error);
    return NextResponse.json(
      { message: 'Failed to fetch question bank items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const body = await request.json();
    const { text, questionType, lessonId, moduleId, difficulty, explanation, options } = body;

    // Validation
    if (!text || !questionType || !options || options.length < 2) {
      return NextResponse.json(
        { message: 'Question text, type, and at least 2 options are required' },
        { status: 400 }
      );
    }

    // Check if at least one option is correct
    const correctOptions = options.filter((opt: any) => opt.isCorrect);
    if (correctOptions.length === 0) {
      return NextResponse.json(
        { message: 'At least one option must be marked as correct' },
        { status: 400 }
      );
    }

    // Create question with options
    const question = await db.questionBank.create({
      data: {
        text,
        questionType,
        lessonId: lessonId || null,
        moduleId: moduleId || null,
        difficulty: difficulty || null,
        explanation: explanation || null,
        options: {
          create: options.map((option: any) => ({
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        },
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                semester: {
                  include: {
                    studyYear: true,
                  },
                },
              },
            },
          },
        },
        module: {
          include: {
            semester: {
              include: {
                studyYear: true,
              },
            },
          },
        },
        options: true,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question bank item:', error);
    return NextResponse.json(
      { message: 'Failed to create question bank item' },
      { status: 500 }
    );
  }
}
