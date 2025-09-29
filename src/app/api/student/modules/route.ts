import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
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

    // Get modules that the student has access to via their licenses
    const modules = await db.module.findMany({
      where: {
        OR: [
          // Module-level license
          {
            licenseLinks: {
              some: {
                license: {
                  userId: session.user.id,
                  isActive: true,
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() }
                }
              }
            }
          },
          // Semester-level license
          {
            semester: {
              licenseSemesters: {
                some: {
                  license: {
                    userId: session.user.id,
                    isActive: true,
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() }
                  }
                }
              }
            }
          },
          // Year-level license
          {
            semester: {
              studyYear: {
                licenseStudyYears: {
                  some: {
                    license: {
                      userId: session.user.id,
                      isActive: true,
                      startDate: { lte: new Date() },
                      endDate: { gte: new Date() }
                    }
                  }
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        semester: {
          select: {
            id: true,
            name: true,
            studyYear: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { semester: { studyYear: { name: 'asc' } } },
        { semester: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération des modules' },
      { status: 500 }
    );
  }
}
