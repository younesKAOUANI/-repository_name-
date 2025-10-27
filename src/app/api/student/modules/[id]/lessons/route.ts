import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: moduleId } = await params;
  try {
  //   const session = await requireRole(['STUDENT']);
  //   if (!session?.user?.id) {
  //     return NextResponse.json(
  //       { error: 'Session utilisateur non trouvée' },
  //       { status: 401 }
  //     );
  //   }

    // First verify the student has access to this module
    // const hasAccess = await db.module.findFirst({
    //   where: {
    //     id: moduleId,
    //     OR: [
    //       // Module-level license
    //       {
    //         licenseLinks: {
    //           some: {
    //             license: {
    //               userId: session.user.id,
    //               isActive: true,
    //               startDate: { lte: new Date() },
    //               endDate: { gte: new Date() }
    //             }
    //           }
    //         }
    //       },
    //       // Semester-level license
    //       {
    //         semester: {
    //           licenseSemesters: {
    //             some: {
    //               license: {
    //                 userId: session.user.id,
    //                 isActive: true,
    //                 startDate: { lte: new Date() },
    //                 endDate: { gte: new Date() }
    //               }
    //             }
    //           }
    //         }
    //       },
    //       // Year-level license
    //       {
    //         semester: {
    //           studyYear: {
    //             licenseStudyYears: {
    //               some: {
    //                 license: {
    //                   userId: session.user.id,
    //                   isActive: true,
    //                   startDate: { lte: new Date() },
    //                   endDate: { gte: new Date() }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     ]
    //   }
    // });

    // if (!hasAccess && process.env.NODE_ENV !== 'development') {
    //   return NextResponse.json(
    //     { error: 'Accès non autorisé à ce module' },
    //     { status: 403 }
    //   );
    // }

    // Get lessons for this module
    const lessons = await db.lesson.findMany({
      where: {
        moduleId
      },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        module: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Format the response to include module name
    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order,
      moduleId: lesson.module.id,
      moduleName: lesson.module.name
    }));

    return NextResponse.json(formattedLessons);
  } catch (error) {
    console.error('Erreur lors de la récupération des leçons:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération des leçons' },
      { status: 500 }
    );
  }
}
