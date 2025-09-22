import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['STUDENT']);
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    // Get all completed exam attempts for the student
    const attempts = await db.quizAttempt.findMany({
      where: { 
        userId: session.user.id,
        finishedAt: { not: null }
      },
      include: {
        quiz: {
          include: {
            questions: true,
            module: {
              include: {
                semester: {
                  include: {
                    studyYear: true
                  }
                }
              }
            },
            lesson: {
              include: {
                module: {
                  include: {
                    semester: {
                      include: {
                        studyYear: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { finishedAt: 'desc' }
    });

    // Transform for response
    const results = attempts.map(attempt => ({
      id: attempt.id,
      examId: attempt.quizId,
      examTitle: attempt.quiz.title,
      score: Number(attempt.score || 0),
      maxScore: attempt.quiz.questions?.length || 0,
      percentage: attempt.quiz.questions?.length 
        ? ((Number(attempt.score || 0) / attempt.quiz.questions.length) * 100)
        : 0,
      startedAt: attempt.startedAt,
      completedAt: attempt.finishedAt,
      studyYear: attempt.quiz.lesson?.module?.semester?.studyYear || 
                 attempt.quiz.module?.semester?.studyYear,
      module: attempt.quiz.module || attempt.quiz.lesson?.module,
      lesson: attempt.quiz.lesson
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json(
      { message: 'Failed to fetch exam results' },
      { status: 500 }
    );
  }
}
