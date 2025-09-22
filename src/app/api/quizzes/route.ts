import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { QuizType, QuestionType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') as QuizType;
    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Type filter
    if (type) {
      where.type = type;
    }

    // Module filter
    if (moduleId) {
      where.moduleId = moduleId;
    }

    // Lesson filter
    if (lessonId) {
      where.lessonId = lessonId;
    }

    const [quizzes, totalCount] = await Promise.all([
      db.quiz.findMany({
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
          sessionLessons: {
            include: {
              lesson: true,
            },
          },
          _count: {
            select: {
              questions: true,
              attempts: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [
          { createdAt: 'desc' },
        ],
      }),
      db.quiz.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);



    return NextResponse.json({
      quizzes,
      pagination: {
        currentPage: page,
        totalPages,
        pageSize,
        totalItems: totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const body = await request.json();
    const {
      title,
      description,
      type,
      lessonId,
      moduleId,
      questionCount,
      timeLimit,
      questions,
      sessionLessons,
    } = body;

    // Validate required fields based on quiz type
    if (type === 'QUIZ' && !lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required for lesson quizzes' },
        { status: 400 }
      );
    }

    if (type === 'EXAM' && !moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required for exam quizzes' },
        { status: 400 }
      );
    }

    if (type === 'SESSION') {
      if (!questionCount || questionCount < 15 || questionCount > 50) {
        return NextResponse.json(
          { error: 'Question count must be between 15 and 50 for session quizzes' },
          { status: 400 }
        );
      }
      if (!sessionLessons || sessionLessons.length === 0) {
        return NextResponse.json(
          { error: 'At least one lesson must be selected for session quizzes' },
          { status: 400 }
        );
      }
    }

    const createData: any = {
      title,
      type,
      lessonId: lessonId || null,
      moduleId: moduleId || null,
      questionCount: questionCount || null,
      timeLimit: timeLimit || null,
      questions: questions ? {
        create: questions.map((q: any, index: number) => ({
          text: q.text,
          questionType: q.questionType,
          order: q.order || index + 1,
          options: {
            create: q.options.map((opt: any) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          },
        })),
      } : undefined,
      sessionLessons: sessionLessons ? {
        create: sessionLessons.map((lessonId: number) => ({
          lessonId,
        })),
      } : undefined,
    };

    if (description) {
      createData.description = description;
    }

    const quiz = await db.quiz.create({
      data: createData,
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
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        sessionLessons: {
          include: {
            lesson: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
