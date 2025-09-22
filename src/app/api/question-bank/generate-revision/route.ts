import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { questionBankService } from '@/services/question-bank.service';

export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR', 'STUDENT']);

    const body = await request.json();
    const { 
      selectedModules, 
      selectedLessons, 
      questionCount = 10, 
      questionTypes,
      difficulty,
      timeLimit,
      studentId 
    } = body;

    // Validation
    if ((!selectedModules || selectedModules.length === 0) && (!selectedLessons || selectedLessons.length === 0)) {
      return NextResponse.json(
        { message: 'At least one module or lesson must be selected' },
        { status: 400 }
      );
    }

    if (questionCount < 1 || questionCount > 50) {
      return NextResponse.json(
        { message: 'Question count must be between 1 and 50' },
        { status: 400 }
      );
    }

    try {
      const revisionQuiz = await questionBankService.generateRevisionQuiz({
        selectedModules: selectedModules || [],
        selectedLessons: selectedLessons || [],
        questionCount,
        questionTypes,
        difficulty,
        timeLimit,
      });

      return NextResponse.json(revisionQuiz, { status: 201 });
    } catch (serviceError: any) {
      console.error('Service error generating revision quiz:', serviceError);
      
      if (serviceError.message?.includes('not enough questions')) {
        return NextResponse.json(
          { message: serviceError.message },
          { status: 400 }
        );
      }
      
      throw serviceError;
    }
  } catch (error) {
    console.error('Error generating revision quiz:', error);
    return NextResponse.json(
      { message: 'Failed to generate revision quiz' },
      { status: 500 }
    );
  }
}
