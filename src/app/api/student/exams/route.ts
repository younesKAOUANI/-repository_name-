// app/api/exams/route.ts (Next.js /app router) OR pages/api/exams.ts (adapt export if using pages)
// Lightweight exam list endpoint — optimized for high concurrent read traffic

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, getStudentAccessibleModules } from '@/lib/auth-utils';
import { db } from '@/lib/db';

// Simple in-memory cache for accessible modules per-user (TTL in ms)
const accessibleModulesCache = new Map<string, { ts: number; data: any[] }>();
const CACHE_TTL = 60_000; // 60s

async function cachedGetStudentAccessibleModules(userId: string) {
  const entry = accessibleModulesCache.get(userId);
  const now = Date.now();
  if (entry && now - entry.ts < CACHE_TTL) {
    return entry.data;
  }

  const modules = await getStudentAccessibleModules(userId);
  accessibleModulesCache.set(userId, { ts: now, data: modules });
  return modules;
}

export async function GET(request: NextRequest) {
  try {
    // authorize (will throw if role not allowed)
    const session = await requireRole(['STUDENT', 'INSTRUCTOR', 'ADMIN']);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'ID utilisateur non trouvé dans la session' }, { status: 400 });
    }

    const url = new URL(request.url);
    const moduleId = url.searchParams.get('moduleId') ?? undefined;
    const lessonId = url.searchParams.get('lessonId') ?? undefined;
    const isCompletedParam = url.searchParams.get('isCompleted') ?? undefined;
    const studyYearId = url.searchParams.get('studyYearId') ?? undefined;

    // Fetch accessible modules (cached)
    const accessibleModules = await cachedGetStudentAccessibleModules(session.user.id);
    const accessibleModuleIds = accessibleModules.map(m => m.id);

    if (accessibleModuleIds.length === 0) {
      // return early with no results
      return NextResponse.json(
        [],
        {
          status: 200,
          headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' }
        }
      );
    }

    // If studyYearId filter requested — restrict accessible modules to that study year
    let filteredModuleIds = accessibleModuleIds;
    if (studyYearId) {
      const allowedForYear = accessibleModules
        .filter(m => m.semester?.studyYearId === studyYearId)
        .map(m => m.id);
      if (allowedForYear.length === 0) {
        return NextResponse.json([], { status: 200 });
      }
      filteredModuleIds = allowedForYear;
    }

    // If moduleId filter was provided, ensure it's accessible
    if (moduleId) {
      if (!filteredModuleIds.includes(moduleId)) {
        return NextResponse.json([], { status: 200 });
      }
      // restrict to just that module
      filteredModuleIds = [moduleId];
    }

    // Build where clause for quizzes: type is QUIZ or EXAM, and either moduleId in filtered set OR lesson.moduleId in filtered set
    const where: any = {
      type: { in: ['QUIZ', 'EXAM'] },
      OR: [
        { moduleId: { in: filteredModuleIds } },
        { lesson: { moduleId: { in: filteredModuleIds } } }
      ]
    };

    // If lessonId provided — ensure it's inside an accessible module and filter
    if (lessonId) {
      // quick DB check to confirm lesson belongs to an allowed module (avoid exposing other lessons)
      const lesson = await db.lesson.findUnique({
        where: { id: lessonId },
        select: { id: true, moduleId: true }
      });

      if (!lesson || !filteredModuleIds.includes(lesson.moduleId)) {
        return NextResponse.json([], { status: 200 });
      }

      // require quizzes to be either attached to that lesson OR have lessonId equal
      where.OR = [
        { lessonId: lessonId },
        // still allow module-level quizzes for the module containing the lesson
        { moduleId: lesson.moduleId }
      ];
    }

    // Query: lightweight projection (no full question/options load)
    const exams = await db.quiz.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        questionCount: true,
        createdAt: true,
        moduleId: true,
        lessonId: true,
        // counts instead of loading questions rows
        _count: {
          select: { questions: true }
        },
        // minimal module & lesson info for display
        module: {
          select: {
            id: true,
            name: true,
            semester: { select: { studyYear: { select: { id: true, name: true } }, studyYearId: true } }
          }
        },
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                name: true,
                semester: { select: { studyYear: { select: { id: true, name: true } }, studyYearId: true } }
              }
            }
          }
        },
        // only the latest attempt for this user
        attempts: {
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, startedAt: true, finishedAt: true, score: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map exams to UI-friendly structure (compute question count from _count or questionCount if provided)
    const studentExams = exams.map(exam => {
      const latestAttempt = exam.attempts[0];
      const hasCompleted = !!(latestAttempt && latestAttempt.finishedAt);
      const maxScore = (exam._count?.questions ?? exam.questionCount ?? 0);
      let score: number | undefined = undefined;
      let percentage: number | undefined = undefined;

      if (hasCompleted && latestAttempt?.score != null) {
        // Prisma Decimal -> string | number
        const scoreNumber = typeof latestAttempt.score === 'string' ? parseFloat(latestAttempt.score) : Number(latestAttempt.score);
        score = Number.isFinite(scoreNumber) ? scoreNumber : undefined;
        percentage = maxScore > 0 && score != null ? (score / maxScore) * 100 : 0;
      }

      // derive studyYear from lesson.module OR module
      let studyYear: { id: string; name: string } | undefined = undefined;
      if (exam.lesson?.module?.semester?.studyYear) {
        studyYear = {
          id: exam.lesson.module.semester.studyYear.id,
          name: exam.lesson.module.semester.studyYear.name
        };
      } else if (exam.module?.semester?.studyYear) {
        studyYear = {
          id: exam.module.semester.studyYear.id,
          name: exam.module.semester.studyYear.name
        };
      }

      const module = exam.module ? { id: exam.module.id, name: exam.module.name } :
                     exam.lesson?.module ? { id: exam.lesson.module.id, name: exam.lesson.module.name } :
                     undefined;

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        timeLimit: exam.timeLimit,
        questionsCount: maxScore,
        isCompleted: hasCompleted,
        score: hasCompleted ? score : undefined,
        maxScore,
        percentage: hasCompleted ? percentage : undefined,
        startedAt: latestAttempt?.startedAt,
        completedAt: latestAttempt?.finishedAt,
        createdAt: exam.createdAt,
        studyYear,
        module,
        lesson: exam.lesson ? { id: exam.lesson.id, title: exam.lesson.title } : undefined
      };
    });

    // Optionally filter by completion status param
    const filteredExams = (isCompletedParam !== undefined && isCompletedParam !== null)
      ? studentExams.filter(e => e.isCompleted === (isCompletedParam === 'true'))
      : studentExams;


    return NextResponse.json(
      filteredExams,
      {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Échec du chargement des examens', error: message },
      { status: 500 }
    );
  }
}
