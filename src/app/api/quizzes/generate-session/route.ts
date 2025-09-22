import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const body = await request.json();
    const { questionCount, selectedLessons, selectedModules, selectedSemesters } = body;

    // Validate question count
    if (!questionCount || questionCount < 15 || questionCount > 50) {
      return NextResponse.json(
        { error: 'Question count must be between 15 and 50' },
        { status: 400 }
      );
    }

    // Build lesson IDs from selected items
    let lessonIds: string[] = [...(selectedLessons || [])];

    // Add lessons from selected modules
    if (selectedModules && selectedModules.length > 0) {
      const moduleLessons = await db.lesson.findMany({
        where: {
          moduleId: {
            in: selectedModules,
          },
        },
        select: {
          id: true,
        },
      });
      lessonIds.push(...moduleLessons.map(l => l.id));
    }

    // Add lessons from selected semesters
    if (selectedSemesters && selectedSemesters.length > 0) {
      const semesterLessons = await db.lesson.findMany({
        where: {
          module: {
            semesterId: {
              in: selectedSemesters,
            },
          },
        },
        select: {
          id: true,
        },
      });
      lessonIds.push(...semesterLessons.map(l => l.id));
    }

    // Remove duplicates
    lessonIds = [...new Set(lessonIds)];

    if (lessonIds.length === 0) {
      return NextResponse.json(
        { error: 'No lessons found for the selected criteria' },
        { status: 400 }
      );
    }

    // Get all questions from the selected lessons
    const allQuestions = await db.question.findMany({
      where: {
        quiz: {
          lessonId: {
            in: lessonIds,
          },
          type: 'QUIZ', // Only get questions from lesson quizzes
        },
      },
      include: {
        options: true,
      },
    });

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found in the selected lessons' },
        { status: 400 }
      );
    }

    // Shuffle and select the requested number of questions
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(questionCount, allQuestions.length));

    return NextResponse.json(selectedQuestions);
  } catch (error) {
    console.error('Error generating session quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate session quiz' },
      { status: 500 }
    );
  }
}
