import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, unauthorizedResponse } from '@/lib/auth-utils';
import { licenseService } from '@/services/license.service';
import { PlanTypeName } from '@prisma/client';

// GET /api/licenses
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const filters = {
      userId: searchParams.get('userId') || undefined,
      planType: searchParams.get('planType') as PlanTypeName || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
    };

    const result = await licenseService.getAllLicenses(filters);
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch licenses' }, 
      { status: 500 }
    );
  }
}

// POST /api/licenses
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await requireAdmin();

    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.planType) {
      return NextResponse.json(
        { error: 'userId and planType are required' },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!Object.values(PlanTypeName).includes(body.planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Validate scope
    const scopeCount = [body.studyYearId, body.semesterId, body.moduleId].filter(Boolean).length;
    if (scopeCount !== 1) {
      return NextResponse.json(
        { error: 'Exactly one scope (studyYearId, semesterId, or moduleId) must be provided' },
        { status: 400 }
      );
    }

    const license = await licenseService.createLicense({
      userId: body.userId,
      planType: body.planType,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      studyYearId: body.studyYearId,
      semesterId: body.semesterId,
      moduleId: body.moduleId,
    });
    
    return NextResponse.json({ 
      message: 'License created successfully',
      license 
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error creating license:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create license' }, 
      { status: 500 }
    );
  }
}
