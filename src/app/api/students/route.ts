import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, unauthorizedResponse } from '@/lib/auth-utils';
import { studentService } from '@/services/student.service';

// GET /api/students
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const filters = {
      search: searchParams.get('search') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      university: searchParams.get('university') || undefined,
      verified: searchParams.get('verified') ? searchParams.get('verified') === 'true' : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
    };

    const result = await studentService.getAllStudents(filters);
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' }, 
      { status: 500 }
    );
  }
}


