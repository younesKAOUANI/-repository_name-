import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // New behavior: no auth/license checks here.
    // Return modules for a specific study year. Use ?year=N to request a year.
    // If year is not provided, default to 3 (3rd year) to match common debugging needs.
    const url = new URL(request.url);
  const yearParam = url.searchParams.get('year');
  const debug = url.searchParams.get('debug') === 'true';
  const userIdParam = url.searchParams.get('userId');
  // Default to 3rd year unless overridden by ?year or derived from userId
  let year = yearParam ? parseInt(yearParam, 10) : 3;

    if (debug) console.log(`Fetching modules for study year: ${year}`);

    // If a userId was provided, prefer the student's `year` field to determine which modules to return
    let user = null;
    if (userIdParam) {
      user = await db.user.findUnique({
        where: { id: userIdParam },
        include: { licenses: true }
      });
      if (debug) console.log('User lookup via userId param:', userIdParam, user ? { id: user.id, email: user.email, year: user.year } : null);
      if (user && user.year) {
        year = user.year;
      }
    }

    // Find the StudyYear matching the requested year (names like "3ème année Pharmacie")
    const studyYear = await db.studyYear.findFirst({
      where: { name: { startsWith: `${year}ème année` } }
    });

    if (!studyYear) {
      if (debug) console.log(`StudyYear not found for year ${year}`);
      return NextResponse.json([], { status: 200 });
    }

    const modules = await db.module.findMany({
      where: {
        semester: {
          studyYearId: studyYear.id
        }
      },
      include: {
        semester: {
          include: {
            studyYear: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

  if (debug) console.log(`Modules found: ${modules.length} for studyYearId=${studyYear.id}`);

    const formattedModules = modules.map((module) => ({
      id: module.id,
      name: module.name,
      description: module.description,
      semester: {
        id: module.semester.id,
        name: module.semester.name,
        studyYear: {
          id: module.semester.studyYear.id,
          name: module.semester.studyYear.name,
        },
      },
    }));

    // If debug mode requested, include diagnostic info alongside modules
    if (debug) {
      return NextResponse.json({
        modules: formattedModules,
        debug: {
          requestedYear: yearParam || null,
          effectiveYear: year,
          studyYearId: studyYear.id,
          user: user ? { id: user.id, email: user.email, year: user.year, licenses: user.licenses || [] } : null,
          modulesCount: modules.length,
        }
      });
    }

    return NextResponse.json(formattedModules);
  } catch (error) {
    // Always log a structured error to make debugging from the server logs easy
    const url = new URL(request.url);
    const requestedYear = url.searchParams.get('year');
    const userIdParam = url.searchParams.get('userId');
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erreur lors de la récupération des modules:', {
      message: msg,
      requestedYear,
      userId: userIdParam,
      stack: (error && (error as any).stack) || null,
    });

    // Map common auth errors to 401/403 so the client can react appropriately
    const lower = msg.toLowerCase();

    // Authentication-related (no session / wrong role)
    if (lower.includes('authentication required') || lower.includes('session utilisateur non trouvée') || lower.includes('required role') || lower.includes('current role: undefined')) {
      return NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    // Authorization / license related
    if (lower.includes('student role required') || lower.includes('aucune licence') || lower.includes('licence utilisable') || lower.includes('aucune licence valide')) {
      return NextResponse.json(
        { error: 'Accès interdit: vous n\'avez pas les permissions nécessaires.' },
        { status: 403 }
      );
    }

    // If debug requested, return the raw error message and stack to help debugging from the UI
    const debug = url.searchParams.get('debug') === 'true';
    if (debug) {
      return NextResponse.json(
        { error: msg, stack: (error && (error as any).stack) || null },
        { status: 500 }
      );
    }

    // For normal (non-debug) responses, return a friendly message but include the error message
    // in a `details` field so the client console can display it without exposing the full stack.
    return NextResponse.json(
      { error: 'Échec de la récupération des modules', details: msg },
      { status: 500 }
    );
  }
}
