import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

/**
 * Utility functions for role-based authentication
 */

/**
 * Get the current user session with detailed logging
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    console.log('=== getCurrentUser Debug ===');
    console.log('Session exists:', !!session);
    console.log('User exists:', !!session?.user);
    console.log('User role:', session?.user?.role);
    console.log('Full session:', JSON.stringify(session, null, 2));
    
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
  
  console.log(`🔐 Authentication check: ${authenticated ? '✅ Authenticated' : '❌ Not authenticated'}`);
  return authenticated;
}

/**
 * Check if the current user is a student
 */
export async function isStudent() {
  const session = await getCurrentUser();
  const isStudentRole = session?.user?.role === 'STUDENT';
  
  console.log(`🎓 Student check: ${isStudentRole ? '✅ Is Student' : '❌ Not Student'} (Role: ${session?.user?.role || 'undefined'})`);
  return isStudentRole;
}

/**
 * Check if the current user is a teacher/instructor
 */
export async function isTeacher() {
  const session = await getCurrentUser();
  const isTeacherRole = session?.user?.role === 'INSTRUCTOR';
  
  console.log(`👨‍🏫 Teacher check: ${isTeacherRole ? '✅ Is Teacher' : '❌ Not Teacher'} (Role: ${session?.user?.role || 'undefined'})`);
  return isTeacherRole;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin() {
  const session = await getCurrentUser();
  const isAdminRole = session?.user?.role === 'ADMIN';
  
  console.log(`👑 Admin check: ${isAdminRole ? '✅ Is Admin' : '❌ Not Admin'} (Role: ${session?.user?.role || 'undefined'})`);
  return isAdminRole;
}

/**
 * Check if the current user has any of the specified roles
 */
export async function hasRole(roles: Array<'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>) {
  const session = await getCurrentUser();
  const userRole = session?.user?.role;
  const hasRequiredRole = userRole && roles.includes(userRole);
  
  console.log(`🎭 Role check: ${hasRequiredRole ? '✅ Has required role' : '❌ Missing required role'} (User: ${userRole || 'undefined'}, Required: ${roles.join(', ')})`);
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

// Error response helpers
export function unauthorizedResponse(message: string = 'Non autorisé') {
  return Response.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message: string = 'Accès interdit') {
  return Response.json({ error: message }, { status: 403 });
}
