import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { requireRole } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(['ADMIN', 'INSTRUCTOR', 'STUDENT']);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Le mot de passe actuel et le nouveau mot de passe sont requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
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
        message: error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe' 
      },
      { status: 500 }
    );
  }
}
