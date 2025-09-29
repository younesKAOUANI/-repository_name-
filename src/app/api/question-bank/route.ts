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
    const studyYearId = searchParams.get('studyYearId');
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

    // Study year filter
    if (studyYearId) {
      where.studyYearId = studyYearId;
    }

    // Module filter
    if (moduleId) {
      where.moduleId = moduleId;
    }

    // Lesson filter
    if (lessonId) {
      where.lessonId = lessonId;
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
    console.error('Erreur lors de la récupération de la banque de questions:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération des éléments de la banque de questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const body = await request.json();
    const { text, questionType, studyYearId, lessonId, moduleId, difficulty, explanation, options } = body;

    // Validation
    if (!text || !questionType || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Le texte de la question, le type et au moins 2 options sont requis' },
        { status: 400 }
      );
    }

    // Check if at least one option is correct
    const correctOptions = options.filter((opt: any) => opt.isCorrect);
    if (correctOptions.length === 0) {
      return NextResponse.json(
        { error: 'Au moins une option doit être marquée comme correcte' },
        { status: 400 }
      );
    }

    // Create question with options
    const question = await db.questionBank.create({
      data: {
        text,
        questionType,
        studyYearId: studyYearId || null,
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
    console.error('Erreur lors de la création de la question:', error);
    return NextResponse.json(
      { error: 'Échec de la création de la question' },
      { status: 500 }
    );
  }
}
