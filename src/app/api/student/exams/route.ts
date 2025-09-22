import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Student exams API called');
    
    // For testing, let's make this more permissive
    const session = await requireRole(['STUDENT', 'INSTRUCTOR', 'ADMIN']);
    console.log('Session obtained:', session?.user?.id, session?.user?.role);
    
    const { searchParams } = new URL(request.url);
    
    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');
    const isCompleted = searchParams.get('isCompleted');
    const studyYearId = searchParams.get('studyYearId');

    if (!session?.user?.id) {
      console.log('No user ID in session');
      return NextResponse.json(
        { message: 'User ID not found in session' },
        { status: 400 }
      );
    }

    // Get student with licenses
    console.log('🔍 Fetching student data for user ID:', session.user.id);
    
    const student = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        licenses: {
          where: {
            isActive: true,
            endDate: { gt: new Date() }
          },
          include: {
            yearScope: {
              include: {
                studyYear: true
              }
            },
            plan: true
          }
        }
      }
    });

    console.log('📊 Student query result:', {
      found: !!student,
      studentId: student?.id,
      studentName: student?.name,
      studentRole: student?.role,
      studentYear: student?.year,
      studentUniversity: student?.university,
      licensesCount: student?.licenses?.length || 0
    });

    if (!student) {
      console.log('❌ Student not found in database');
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    // Detailed license inspection
    console.log('🔐 License inspection:');
    console.log('Current date:', new Date().toISOString());
    
    student.licenses.forEach((license, index) => {
      console.log(`📜 License ${index + 1}:`, {
        id: license.id,
        planId: license.planId,
        startDate: license.startDate,
        endDate: license.endDate,
        isActive: license.isActive,
        isExpired: license.endDate <= new Date(),
        plan: license.plan ? {
          id: license.plan.id,
          planTypeId: license.plan.planTypeId,
          createdAt: license.plan.createdAt
        } : null,
        yearScope: license.yearScope ? {
          id: license.yearScope.id,
          studyYearId: license.yearScope.studyYearId,
          studyYear: license.yearScope.studyYear ? {
            id: license.yearScope.studyYear.id,
            name: license.yearScope.studyYear.name
          } : null
        } : null
      });
    });

    // For now, let's be permissive with licenses for testing
    // In production, you'd want to enforce license validation
    console.log('📈 Total valid licenses found:', student.licenses.length);
    
    if (student.licenses.length === 0) {
      console.log('⚠️ No valid licenses found - returning 403');
      return NextResponse.json(
        { message: 'No valid license found. Please contact administration to activate your license.' },
        { status: 403 }
      );
    }

    // Build where clause for exams
    console.log('🎯 Building exam query with filters:', {
      moduleId,
      lessonId,
      isCompleted,
      studyYearId
    });

    const where: any = {
      type: { in: ['QUIZ', 'EXAM'] },
    };

    // Apply filters
    if (moduleId) {
      where.moduleId = parseInt(moduleId);
      console.log('📚 Filtering by moduleId:', parseInt(moduleId));
    }

    if (lessonId) {
      where.lessonId = parseInt(lessonId);
      console.log('📖 Filtering by lessonId:', parseInt(lessonId));
    }

    if (studyYearId) {
      // Filter by specific study year if provided
      where.OR = [
        { 
          lesson: {
            module: {
              semester: {
                studyYearId: parseInt(studyYearId)
              }
            }
          }
        },
        {
          module: {
            semester: {
              studyYearId: parseInt(studyYearId)
            }
          }
        }
      ];
      console.log('🎓 Filtering by studyYearId:', parseInt(studyYearId));
    }

    console.log('📋 Final where clause:', JSON.stringify(where, null, 2));

    // Get exams
    console.log('🔍 Executing exam query...');
    
    const exams = await db.quiz.findMany({
      where,
      include: {
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
        },
        questions: {
          include: {
            options: true
          }
        },
        // Get student's attempts for this exam
        attempts: {
          where: {
            userId: session.user.id
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Found ${exams.length} exams`);
    
    exams.forEach((exam, index) => {
      console.log(`📝 Exam ${index + 1}:`, {
        id: exam.id,
        title: exam.title,
        type: exam.type,
        questionsCount: exam.questions.length,
        attemptsCount: exam.attempts.length,
        module: exam.module ? {
          id: exam.module.id,
          name: exam.module.name,
          studyYear: exam.module.semester?.studyYear ? {
            id: exam.module.semester.studyYear.id,
            name: exam.module.semester.studyYear.name
          } : null
        } : null,
        lesson: exam.lesson ? {
          id: exam.lesson.id,
          title: exam.lesson.title,
          moduleStudyYear: exam.lesson.module?.semester?.studyYear ? {
            id: exam.lesson.module.semester.studyYear.id,
            name: exam.lesson.module.semester.studyYear.name
          } : null
        } : null,
        latestAttempt: exam.attempts[0] ? {
          id: exam.attempts[0].id,
          startedAt: exam.attempts[0].startedAt,
          finishedAt: exam.attempts[0].finishedAt,
          score: exam.attempts[0].score
        } : null
      });
    });

    // Transform exams for student view
    console.log('🔄 Transforming exams for student view...');
    
    const studentExams = exams.map((exam, index) => {
      const latestAttempt = exam.attempts[0];
      const hasCompleted = latestAttempt && latestAttempt.finishedAt !== null;
      
      console.log(`🔄 Processing exam ${index + 1} (ID: ${exam.id}):`, {
        title: exam.title,
        hasLatestAttempt: !!latestAttempt,
        attemptFinishedAt: latestAttempt?.finishedAt,
        hasCompleted,
        rawScore: latestAttempt?.score
      });
      
      // Calculate score if completed
      let score = 0;
      const maxScore = exam.questions.length;
      let percentage = 0;

      if (hasCompleted && latestAttempt?.score) {
        score = Number(latestAttempt.score);
        percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        console.log(`📊 Score calculation for exam ${exam.id}:`, {
          rawScore: latestAttempt.score,
          convertedScore: score,
          maxScore,
          percentage
        });
      }

      // Determine study year from module or lesson
      let studyYear = null;
      if (exam.lesson?.module?.semester?.studyYear) {
        studyYear = exam.lesson.module.semester.studyYear;
        console.log(`🎓 Study year from lesson->module for exam ${exam.id}:`, studyYear);
      } else if (exam.module?.semester?.studyYear) {
        studyYear = exam.module.semester.studyYear;
        console.log(`🎓 Study year from module for exam ${exam.id}:`, studyYear);
      } else {
        console.log(`⚠️ No study year found for exam ${exam.id}`);
      }

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        timeLimit: exam.timeLimit,
        questionsCount: exam.questions.length,
        isCompleted: hasCompleted,
        score: hasCompleted ? score : undefined,
        maxScore,
        percentage: hasCompleted ? percentage : undefined,
        startedAt: latestAttempt?.startedAt,
        completedAt: latestAttempt?.finishedAt,
        createdAt: exam.createdAt,
        studyYear: studyYear ? {
          id: studyYear.id,
          name: studyYear.name
        } : undefined,
        module: exam.module ? {
          id: exam.module.id,
          name: exam.module.name
        } : exam.lesson?.module ? {
          id: exam.lesson.module.id,
          name: exam.lesson.module.name
        } : undefined,
        lesson: exam.lesson ? {
          id: exam.lesson.id,
          title: exam.lesson.title
        } : undefined
      };
    });

    // Filter by completion status if requested
    console.log('🔍 Applying completion filter:', {
      isCompletedParam: isCompleted,
      shouldFilter: isCompleted !== null && isCompleted !== undefined,
      filterValue: isCompleted === 'true'
    });
    
    const filteredExams = (isCompleted !== null && isCompleted !== undefined)
      ? studentExams.filter(exam => {
          const matches = exam.isCompleted === (isCompleted === 'true');
          console.log(`📋 Exam ${exam.id} completion filter:`, {
            examCompleted: exam.isCompleted,
            filterValue: isCompleted === 'true',
            matches
          });
          return matches;
        })
      : studentExams;

    console.log(`✅ Returning ${filteredExams.length} exams after filtering`);
    console.log('📤 Final response summary:', filteredExams.map(exam => ({
      id: exam.id,
      title: exam.title,
      isCompleted: exam.isCompleted,
      studyYear: exam.studyYear?.name,
      module: exam.module?.name,
      lesson: exam.lesson?.title
    })));

    return NextResponse.json(filteredExams);
  } catch (error) {
    console.error('❌ Error fetching student exams:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? error.cause : undefined
    });
    
    return NextResponse.json(
      { 
        message: 'Failed to fetch exams',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
