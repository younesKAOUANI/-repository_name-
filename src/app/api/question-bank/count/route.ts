import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

type QuestionType = 'QCMA' | 'QCMP' | 'QCS' | 'QROC';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR', 'STUDENT']);

    const { searchParams } = new URL(request.url);
    const lessonIds = searchParams.getAll('lessonIds');
    const moduleIds = searchParams.getAll('moduleIds');
  const questionTypes = searchParams.getAll('questionTypes') as QuestionType[];

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

    // Exclude QCS (questions à réponse spécifique) from counts by default.
    // If questionTypes provided, filter out QCS; otherwise exclude QCS.
    const filteredQuestionTypes = questionTypes.filter(t => t !== 'QCS');
    if (filteredQuestionTypes.length > 0) {
      where.questionType = { in: filteredQuestionTypes };
    } else {
      where.questionType = { not: 'QCS' };
    }

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

    // Get total count and group by type
    const [totalCount, typeGroups] = await Promise.all([
      db.questionBank.count({ where }),
      db.questionBank.groupBy({
        by: ['questionType'],
        where,
        _count: { id: true }
      })
    ]);

    // Process the results
    const byType: Record<QuestionType, number> = {} as Record<QuestionType, number>;
    typeGroups.forEach((group: { questionType: QuestionType; _count: { id: number } }) => {
      byType[group.questionType] = group._count.id;
    });

    return NextResponse.json({
      totalQuestions: totalCount,
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
