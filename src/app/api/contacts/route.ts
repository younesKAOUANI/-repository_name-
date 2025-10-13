import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Simple validation function
function validateContactData(data: any) {
  const errors: string[] = [];
  
  if (!data.firstName?.trim()) errors.push('Le prénom est requis');
  if (!data.lastName?.trim()) errors.push('Le nom est requis');
  if (!data.email?.trim()) errors.push('L\'email est requis');
  if (data.email && !data.email.includes('@')) errors.push('Email invalide');
  if (!data.subject?.trim()) errors.push('Le sujet est requis');
  if (!data.message?.trim()) errors.push('Le message est requis');
  if (data.message && data.message.trim().length < 10) errors.push('Le message doit contenir au moins 10 caractères');
  
  const validTypes = ['SUPPORT', 'BILLING', 'FEATURE', 'PARTNERSHIP', 'OTHER'];
  if (data.type && !validTypes.includes(data.type)) {
    data.type = 'SUPPORT';
  }
  
  return { isValid: errors.length === 0, errors };
}

// POST - Create new contact message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validation = validateContactData(body);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Données invalides',
          errors: validation.errors 
        },
        { status: 400 }
      );
    }
    
    // Create the contact record (temporarily comment out until migration)
    // const contact = await db.contact.create({
    //   data: {
    //     firstName: body.firstName.trim(),
    //     lastName: body.lastName.trim(),
    //     email: body.email.trim(),
    //     subject: body.subject.trim(),
    //     message: body.message.trim(),
    //     type: body.type || 'SUPPORT',
    //     status: 'PENDING'
    //   }
    // });

    // Simulate success for now
    const contactId = 'temp-' + Date.now();

    return NextResponse.json({
      success: true,
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
      contactId: contactId
    });

  } catch (error) {
    console.error('Error creating contact:', error);

    return NextResponse.json(
      { 
        success: false,
        message: 'Une erreur est survenue lors de l\'envoi du message' 
      },
      { status: 500 }
    );
  }
}

// GET - Get contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Build filter conditions
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get contacts with pagination (temporarily using demo data until migration)
    // const contacts = await db.contact.findMany({
    //   where,
    //   orderBy: { createdAt: 'desc' },
    //   skip: (page - 1) * pageSize,
    //   take: pageSize
    // });
    
    // Demo data
    const allDemoContacts = [
      {
        id: 'contact-1',
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@example.com',
        subject: 'Problème de connexion',
        message: 'Je n\'arrive pas à me connecter à mon compte malgré plusieurs tentatives.',
        type: 'SUPPORT',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        adminNotes: null,
        respondedAt: null,
        respondedBy: null
      },
      {
        id: 'contact-2', 
        firstName: 'Pierre',
        lastName: 'Martin',
        email: 'pierre.martin@example.com',
        subject: 'Question sur les tarifs',
        message: 'Bonjour, j\'aimerais connaître les tarifs pour les étudiants de pharmacie.',
        type: 'BILLING',
        status: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        adminNotes: 'Envoyé la grille tarifaire par email',
        respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        respondedBy: 'admin-1'
      },
      {
        id: 'contact-3',
        firstName: 'Sophie',
        lastName: 'Bernard', 
        email: 'sophie.bernard@example.com',
        subject: 'Suggestion d\'amélioration',
        message: 'Il serait bien d\'avoir des exercices interactifs en plus des quiz.',
        type: 'FEATURE',
        status: 'RESOLVED',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        adminNotes: 'Ajouté à la roadmap pour la prochaine version',
        respondedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        respondedBy: 'admin-1'
      }
    ];

    // Apply filters to demo data
    let filteredContacts = allDemoContacts;
    
    if (status && status !== 'all') {
      filteredContacts = filteredContacts.filter(c => c.status === status);
    }
    
    if (type && type !== 'all') {
      filteredContacts = filteredContacts.filter(c => c.type === type);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredContacts = filteredContacts.filter(c =>
        c.firstName.toLowerCase().includes(searchLower) ||
        c.lastName.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.subject.toLowerCase().includes(searchLower)
      );
    }
    
    const totalCount = filteredContacts.length;
    const startIndex = (page - 1) * pageSize;
    const contacts = filteredContacts.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement des contacts' },
      { status: 500 }
    );
  }
}