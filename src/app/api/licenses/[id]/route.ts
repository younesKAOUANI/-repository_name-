import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN']);
    
    const { id } = await params;
    const licenseId = id;

    const license = await db.license.findUnique({
      where: { id: licenseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        plan: true,
        yearScope: {
          include: {
            studyYear: true
          }
        },
        semScope: {
          include: {
            semester: true
          }
        },
        modScope: {
          include: {
            module: true
          }
        }
      }
    });    if (!license) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(license);
  } catch (error) {
    console.error('Error fetching license:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN']);
    
    const { id } = await params;
    const licenseId = id;

    const body = await request.json();
    const { endDate, isActive } = body;

    // Validation
    if (!endDate) {
      return NextResponse.json(
        { error: 'End date is required' },
        { status: 400 }
      );
    }

    const license = await db.license.update({
      where: { id: licenseId },
      data: {
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        plan: true
      }
    });

    return NextResponse.json(license);
  } catch (error) {
    console.error('Error updating license:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN']);
    
    const { id } = await params;
    const licenseId = id;

    await db.license.delete({
      where: { id: licenseId },
    });

    return NextResponse.json({ message: 'License deleted successfully' });
  } catch (error) {
    console.error('Error deleting license:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
