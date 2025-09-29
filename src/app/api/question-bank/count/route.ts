import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { QuestionType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR', 'STUDENT']);

    const { searchParams } = new URL(request.url);
    const lessonIds = searchParams.getAll('lessonIds');
    const moduleIds = searchParams.getAll('moduleIds');

    if (lessonIds.length === 0 && moduleIds.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un module ou une leçon doit être spécifié' },
        { status: 400 }
      );
    }

    // Build where clause for counting questions
    const where: any = {
      isActive: true,
      OR: []
    };

    if (lessonIds.length > 0) {
      where.OR.push({
        lessonId: {
          in: lessonIds
        }
      });
    }

    if (moduleIds.length > 0) {
      where.OR.push({
        moduleId: {
          in: moduleIds
        }
      });
      
      // Also include questions from lessons within these modules
      where.OR.push({
        lesson: {
          moduleId: {
            in: moduleIds
          }
        }
      });
    }

    // Get total count and group by difficulty and type
    const [totalCount, difficultyGroups, typeGroups] = await Promise.all([
      db.questionBank.count({ where }),
      db.questionBank.groupBy({
        by: ['difficulty'],
        where,
        _count: { id: true }
      }),
      db.questionBank.groupBy({
        by: ['questionType'],
        where,
        _count: { id: true }
      })
    ]);

    // Process the results
    const byDifficulty: Record<string, number> = {};
    difficultyGroups.forEach(group => {
      if (group.difficulty) {
        byDifficulty[group.difficulty] = group._count.id;
      }
    });

    const byType: Record<QuestionType, number> = {} as Record<QuestionType, number>;
    typeGroups.forEach(group => {
      byType[group.questionType] = group._count.id;
    });

    return NextResponse.json({
      totalQuestions: totalCount,
      byDifficulty,
      byType
    });
  } catch (error) {
    console.error('Erreur lors du comptage des questions:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération du nombre de questions disponibles' },
      { status: 500 }
    );
  }
}
