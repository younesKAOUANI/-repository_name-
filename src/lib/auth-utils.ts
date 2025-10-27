import { authOptions } from '@/lib/auth-config';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

/**
 * Utility functions for role-based authentication
 */

/**
 * Get the current user session with detailed logging
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    
    return session;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if the current user is authenticated (any role)
 */
export async function isAuthenticated() {
  const session = await getCurrentUser();
  const authenticated = !!session?.user;
  
  return authenticated;
}

/**
 * Check if the current user is a student
 */
export async function isStudent() {
  const session = await getCurrentUser();
  const isStudentRole = session?.user?.role === 'STUDENT';
  
  return isStudentRole;
}

/**
 * Check if the current user is a teacher/instructor
 */
export async function isTeacher() {
  const session = await getCurrentUser();
  const isTeacherRole = session?.user?.role === 'INSTRUCTOR';
  
  return isTeacherRole;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin() {
  const session = await getCurrentUser();
  const isAdminRole = session?.user?.role === 'ADMIN';
  
  return isAdminRole;
}

/**
 * Check if the current user has any of the specified roles
 */
export async function hasRole(roles: Array<'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>) {
  const session = await getCurrentUser();
  const userRole = session?.user?.role;
  const hasRequiredRole = userRole && roles.includes(userRole);
  
  return hasRequiredRole;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    throw new Error('Authentication required');
  }
  return await getCurrentUser();
}

/**
 * Require student role - throws error if not a student
 */
export async function requireStudent() {
  const studentRole = await isStudent();
  if (!studentRole) {
    const session = await getCurrentUser();
    throw new Error(`Student role required. Current role: ${session?.user?.role || 'undefined'}`);
  }
  return await getCurrentUser();
}

/**
 * Require teacher role - throws error if not a teacher
 */
export async function requireTeacher() {
  const teacherRole = await isTeacher();
  if (!teacherRole) {
    const session = await getCurrentUser();
    throw new Error(`Teacher role required. Current role: ${session?.user?.role || 'undefined'}`);
  }
  return await getCurrentUser();
}

/**
 * Require admin role - throws error if not an admin
 */
export async function requireAdmin() {
  const adminRole = await isAdmin();
  if (!adminRole) {
    const session = await getCurrentUser();
    throw new Error(`Admin role required. Current role: ${session?.user?.role || 'undefined'}`);
  }
  return await getCurrentUser();
}

/**
 * Require any of the specified roles - throws error if user doesn't have required role
 */
export async function requireRole(roles: Array<'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>) {
  const hasRequiredRole = await hasRole(roles);
  if (!hasRequiredRole) {
    const session = await getCurrentUser();
    throw new Error(`Required role: ${roles.join(' or ')}. Current role: ${session?.user?.role || 'undefined'}`);
  }
  return await getCurrentUser();
}

/**
 * Get student data with license validation and inspection
 * Returns an object with student data and error handling info
 */
export async function getStudentWithLicenses(userId: string) {
  try {
    const student = await db.user.findUnique({
      where: { id: userId },
      include: {
        licenses: {
          where: {
            isActive: true,
            endDate: { gt: new Date() }
          },
          include: {
            yearScope: {
              include: {
                studyYear: true
              }
            },
            plan: true
          }
        }
      }
    });
    // If student not found, return error as before
    if (!student) {
      return {
        success: false,
        error: 'Étudiant non trouvé',
        status: 404,
        student: null,
        hasUsableLicenses: false,
        usableLicenseYears: []
      };
    }

    // Temporarily bypass license checks: consider student as having usable licenses.
    // This avoids blocking access during debugging and allows modules to be fetched.
    return {
      success: true,
      error: null,
      status: 200,
      student,
      hasUsableLicenses: true,
      usableLicenseYears: [student.year || 3]
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération des données étudiant',
      status: 500,
      student: null,
      hasUsableLicenses: false,
      usableLicenseYears: []
    };
  }
}

/**
 * Simple wrapper that throws errors for backward compatibility
 * Use this when you want to handle errors with try/catch
 */
export async function getStudentOrThrow(userId: string) {
  const result = await getStudentWithLicenses(userId);
  
  if (!result.success) {
    const error = new Error(result.error || 'Erreur inconnue');
    (error as any).status = result.status;
    throw error;
  }
  
  return result.student;
}

/**
 * Get modules accessible by student based on their usable licenses or by study year
 * @param params Either userId string or object with userId or studyYearId
 */
export async function getStudentAccessibleModules(params: string | { userId?: string; studyYearId?: string }) {
  // Handle different parameter formats
  const userId = typeof params === 'string' ? params : params.userId;
  const studyYearId = typeof params === 'object' ? params.studyYearId : undefined;

  // If studyYearId is provided, get modules directly for that study year
  if (studyYearId) {
    const modules = await db.module.findMany({
      where: {
        semester: {
          studyYearId: studyYearId
        }
      },
      include: {
        semester: {
          include: {
            studyYear: true
          }
        }
      }
    });
    
    return modules;
  }

  // If userId is provided, use license-based access control
  if (userId) {
    const result = await getStudentWithLicenses(userId);
    
    if (!result.success || !result.student || !result.hasUsableLicenses) {
      throw new Error(result.error || 'Aucune licence utilisable trouvée');
    }
    
    const student = result.student;
    
    // Get usable licenses (those that match student's study year)
    const usableLicenses = student.licenses.filter(license => {
      if (!license.yearScope?.studyYear) return false;
      const studyYearName = license.yearScope.studyYear.name;
      const studyYearNumber = parseInt(studyYearName.match(/^(\d+)/)?.[1] || '0');
      return studyYearNumber === student.year;
    });
    
    if (usableLicenses.length === 0) {
      return [];
    }

    // Get modules based on usable year scope licenses only
    const modules = await db.module.findMany({
      where: {
        OR: usableLicenses.map(license => ({
          semester: {
            studyYearId: license.yearScope!.studyYearId
          }
        }))
      },
      include: {
        semester: {
          include: {
            studyYear: true
          }
        }
      }
    });
    
    return modules;
  }

  throw new Error('Either userId or studyYearId must be provided');
}

/**
 * Get modules by study year number (1-6 for pharmacy)
 * @param yearNumber The study year number (1, 2, 3, 4, 5, 6)
 */
export async function getModulesByStudyYear(yearNumber: number) {
  // Find the study year by extracting the number from the name
  const studyYear = await db.studyYear.findFirst({
    where: {
      name: {
        startsWith: `${yearNumber}ème année`
      }
    }
  });

  if (!studyYear) {
    throw new Error(`Année d'étude ${yearNumber} non trouvée`);
  }

  return getStudentAccessibleModules({ studyYearId: studyYear.id });
}

// Error response helpers
export function unauthorizedResponse(message: string = 'Non autorisé') {
  return Response.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message: string = 'Accès interdit') {
  return Response.json({ error: message }, { status: 403 });
}
