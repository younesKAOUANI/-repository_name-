import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { requireRole } from '@/lib/auth-utils';

// GET profile
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['ADMIN', 'INSTRUCTOR', 'STUDENT']);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await authService.getUserProfile(session.user.id);

    return NextResponse.json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get profile' 
      },
      { status: 500 }
    );
  }
}

// PUT update profile
export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole(['ADMIN', 'INSTRUCTOR', 'STUDENT']);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, year, university } = body;

    const updatedProfile = await authService.updateProfile(session.user.id, {
      ...(name && { name }),
      ...(year && { year: parseInt(year) }),
      ...(university && { university }),
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      },
      { status: 500 }
    );
  }
}

// DELETE profile (deactivate account)
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireRole(['ADMIN', 'INSTRUCTOR', 'STUDENT']);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const result = await authService.deleteAccount(session.user.id, password);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete account' 
      },
      { status: 500 }
    );
  }
}
