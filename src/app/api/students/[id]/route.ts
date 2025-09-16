import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, unauthorizedResponse } from '@/lib/auth-utils';
import { studentService } from '@/services/student.service';

// GET /api/students/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await requireAdmin();

    const { id } = await params;
    const student = await studentService.getStudentById(id);
    
    return NextResponse.json({ student });
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' }, 
      { status: 500 }
    );
  }
}

// PUT /api/students/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const updatedStudent = await studentService.updateStudent(id, body);
    
    return NextResponse.json({ 
      message: 'Student updated successfully',
      student: updatedStudent 
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await requireAdmin();

    const { id } = await params;
    await studentService.deleteStudent(id);
    
    return NextResponse.json({ 
      message: 'Student deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' }, 
      { status: 500 }
    );
  }
}
