import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest
) {
  try {
    const session = await requireRole(['STUDENT']);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studyYearId = searchParams.get('studyYearId');

    console.log('🔍 Student Quizzes API - Params:', { studyYearId });

    // Build where clause for quizzes
    const quizWhere: any = {
      type: 'QUIZ'  // Only get quizzes, not exams
    };

    // Apply study year filter
    if (studyYearId) {
      quizWhere.OR = [
        { 
          lesson: {
            module: {
              semester: {
                studyYearId: studyYearId
              }
            }
          }
        },
        {
          module: {
            semester: {
              studyYearId: studyYearId
            }
          }
        }
      ];
    }

    console.log('📋 Quiz where clause:', JSON.stringify(quizWhere, null, 2));

    // Fetch all quizzes with their related data
    const quizzes = await db.quiz.findMany({
      where: quizWhere,
      include: {
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
        },
        module: {
          include: {
            semester: {
              include: {
                studyYear: true
              }
            }
          }
        },
        attempts: {
          where: {
            studentId: session.user.id
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Only get the latest attempt
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    console.log(`📊 Found ${quizzes.length} quizzes`);

    // Group quizzes by study year > semester > module > lesson
    const moduleMap = new Map();
    
    quizzes.forEach(quiz => {
      const module = quiz.lesson?.module || quiz.module;
      
      if (!module) {
        console.warn('⚠️ Quiz without module found:', quiz.id);
        return;
      }

      // Create module entry if it doesn't exist
      if (!moduleMap.has(module.id)) {
        moduleMap.set(module.id, {
          id: module.id,
          name: module.name,
          description: module.description,
          semester: module.semester,
          lessons: new Map()
        });
      }

      const moduleEntry = moduleMap.get(module.id);
      
      if (quiz.lesson) {
        // Quiz belongs to a lesson
        const lesson = quiz.lesson;
        
        if (!moduleEntry.lessons.has(lesson.id)) {
          moduleEntry.lessons.set(lesson.id, {
            id: lesson.id,
            title: lesson.title,
            order: lesson.order,
            quizzes: []
          });
        }
        
        const lessonEntry = moduleEntry.lessons.get(lesson.id);
        lessonEntry.quizzes.push({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          type: quiz.type,
          questionCount: quiz.questionCount,
          timeLimit: quiz.timeLimit,
          order: quiz.order,
          createdAt: quiz.createdAt,
          latestAttempt: quiz.attempts[0] || null
        });
      } else {
        // Quiz belongs directly to module (no lesson)
        if (!moduleEntry.lessons.has('module-direct')) {
          moduleEntry.lessons.set('module-direct', {
            id: 'module-direct',
            title: 'Quizzes du module',
            order: 0,
            quizzes: []
          });
        }
        
        const directEntry = moduleEntry.lessons.get('module-direct');
        directEntry.quizzes.push({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          type: quiz.type,
          questionCount: quiz.questionCount,
          timeLimit: quiz.timeLimit,
          order: quiz.order,
          createdAt: quiz.createdAt,
          latestAttempt: quiz.attempts[0] || null
        });
      }
    });

    // Convert maps to arrays and sort properly
    const organizedQuizzes = Array.from(moduleMap.values()).map(moduleEntry => {
      const lessons = Array.from(moduleEntry.lessons.values())
        .sort((a: any, b: any) => a.order - b.order)
        .map((lesson: any) => ({
          ...lesson,
          quizzes: lesson.quizzes.sort((a: any, b: any) => a.order - b.order)
        }));

      return {
        ...moduleEntry,
        lessons
      };
    });

    return NextResponse.json(organizedQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch quizzes',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
