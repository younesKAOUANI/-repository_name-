import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);
    
    const { id } = await params;
    const quizId = id;

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
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

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);
    
    const { id } = await params;
    const quizId = id;
    const body = await request.json();

    const {
      title,
      description,
      questionCount,
      timeLimit,
      questions,
      sessionLessons,
    } = body;

    // Update quiz basic info
    const updateData: any = {
      title,
      description,
      questionCount: questionCount || null,
      timeLimit: timeLimit || null,
    };

    // Handle questions update if provided
    if (questions) {
      // Delete existing questions
      await db.question.deleteMany({
        where: { quizId },
      });

      // Create new questions
      updateData.questions = {
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
      };
    }

    // Handle session lessons update if provided
    if (sessionLessons) {
      // Delete existing session lessons
      await db.sessionQuizLesson.deleteMany({
        where: { quizId },
      });

      // Create new session lessons
      updateData.sessionLessons = {
        create: sessionLessons.map((lessonId: number) => ({
          lessonId,
        })),
      };
    }

    const updatedQuiz = await db.quiz.update({
      where: { id: quizId },
      data: updateData,
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

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);
    
    const { id } = await params;
    const quizId = id;

    await db.quiz.delete({
      where: { id: quizId },
    });

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
