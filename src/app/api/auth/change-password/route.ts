import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { requireRole } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(['ADMIN', 'INSTRUCTOR', 'STUDENT']);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const result = await authService.changePassword(
      session.user.id,
      currentPassword,
      newPassword
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to change password' 
      },
      { status: 500 }
    );
  }
}
