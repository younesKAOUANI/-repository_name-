import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// For now, we'll store preferences in memory or localStorage
// In a real app, you'd want to store these in the database
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { emailNotifications, darkMode, language } = body;

    // Validation
    const validLanguages = ['fr', 'en', 'ar'];
    if (language && !validLanguages.includes(language)) {
      return NextResponse.json(
        { success: false, message: 'Langue non valide' },
        { status: 400 }
      );
    }

    // In a real implementation, you would save these to the database
    // For now, we'll just simulate a successful save
    const preferences = {
      emailNotifications: Boolean(emailNotifications),
      darkMode: Boolean(darkMode),
      language: language || 'fr',
      updatedAt: new Date().toISOString()
    };

    // Here you would typically save to database:
    // await db.userPreferences.upsert({
    //   where: { userId: session.user.id },
    //   create: { userId: session.user.id, ...preferences },
    //   update: preferences
    // });

    return NextResponse.json({
      success: true,
      message: 'Préférences sauvegardées avec succès',
      data: preferences
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la sauvegarde des préférences' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    // In a real implementation, you would fetch from database
    // For now, return default preferences
    const preferences = {
      emailNotifications: true,
      darkMode: false,
      language: 'fr'
    };

    // Here you would typically fetch from database:
    // const preferences = await db.userPreferences.findUnique({
    //   where: { userId: session.user.id }
    // }) || defaultPreferences;

    return NextResponse.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement des préférences' },
      { status: 500 }
    );
  }
}