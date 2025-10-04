import { NextRequest, NextResponse } from 'next/server';
import { requireRole, getStudentAccessibleModules } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['STUDENT']);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Session utilisateur non trouvée' },
        { status: 401 }
      );
    }

    console.log('Recherche de modules pour l\'utilisateur:', session.user.id);

    // Use the utility function to get student accessible modules
    const modules = await getStudentAccessibleModules(session.user.id);
    console.log('Modules trouvés:', modules.length);

    // Format the response to match the expected structure
    const formattedModules = modules.map(module => ({
      id: module.id,
      name: module.name,
      description: module.description,
      semester: {
        id: module.semester.id,
        name: module.semester.name,
        studyYear: {
          id: module.semester.studyYear.id,
          name: module.semester.studyYear.name
        }
      }
    }));

    return NextResponse.json(formattedModules);
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    
    
    return NextResponse.json(
      { error: 'Échec de la récupération des modules' },
      { status: 500 }
    );
  }
}
