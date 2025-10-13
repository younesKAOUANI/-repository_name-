import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    // Get contact by ID (temporarily comment out until migration)
    // const contact = await db.contact.findUnique({
    //   where: { id }
    // });

    // if (!contact) {
    //   return NextResponse.json(
    //     { success: false, message: 'Contact non trouvé' },
    //     { status: 404 }
    //   );
    // }

    // Simulate contact data
    const contact = {
      id,
      firstName: 'John',
      lastName: 'Doe', 
      email: 'john.doe@example.com',
      subject: 'Question sur la plateforme',
      message: 'Bonjour, j\'ai une question concernant l\'utilisation de la plateforme. J\'aimerais savoir comment accéder aux examens blancs et si il y a des prérequis particuliers.',
      type: 'SUPPORT' as const,
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNotes: null,
      respondedAt: null,
      respondedBy: null
    };

    return NextResponse.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement du contact' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    // Update contact (temporarily comment out until migration)
    // const updatedContact = await db.contact.update({
    //   where: { id: params.id },
    //   data: {
    //     status,
    //     adminNotes,
    //     respondedAt: status === 'RESOLVED' || status === 'IN_PROGRESS' ? new Date() : null,
    //     respondedBy: status === 'RESOLVED' || status === 'IN_PROGRESS' ? session.user.id : null,
    //     updatedAt: new Date()
    //   }
    // });

    // Simulate update
    const updatedContact = {
      id,
      status,
      adminNotes,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Contact mis à jour avec succès',
      data: updatedContact
    });

  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour du contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    // Delete contact (temporarily comment out until migration)
    // await db.contact.delete({
    //   where: { id: params.id }
    // });

    return NextResponse.json({
      success: true,
      message: 'Contact supprimé avec succès'
    });

  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression du contact' },
      { status: 500 }
    );
  }
}