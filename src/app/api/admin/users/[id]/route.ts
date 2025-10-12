import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  year?: number;
  university?: string;
  universityId?: string;
  sex?: 'MALE' | 'FEMALE';
  phoneNumber?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN"]);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Session invalide" },
        { status: 401 }
      );
    }

    const body: UpdateUserRequest = await request.json();
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Prevent admin from changing their own role
    if (existingUser.id === session.user.id && body.role && body.role !== existingUser.role) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 403 }
      );
    }

    const updateData: any = {};

    // Update name
    if (body.name !== undefined) {
      if (!body.name?.trim()) {
        return NextResponse.json(
          { message: "Le nom ne peut pas être vide" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    // Update email
    if (body.email !== undefined) {
      if (!body.email?.trim()) {
        return NextResponse.json(
          { message: "L'adresse e-mail ne peut pas être vide" },
          { status: 400 }
        );
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { message: "Adresse e-mail invalide" },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      if (body.email.toLowerCase() !== existingUser.email) {
        const emailExists = await db.user.findUnique({
          where: { email: body.email.toLowerCase() },
        });

        if (emailExists) {
          return NextResponse.json(
            { message: "Un compte avec cette adresse e-mail existe déjà" },
            { status: 409 }
          );
        }
      }

      updateData.email = body.email.toLowerCase();
    }

    // Update password
    if (body.password !== undefined) {
      if (!body.password?.trim()) {
        return NextResponse.json(
          { message: "Le mot de passe ne peut pas être vide" },
          { status: 400 }
        );
      }

      if (body.password.length < 8) {
        return NextResponse.json(
          { message: "Le mot de passe doit contenir au moins 8 caractères" },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(body.password, 12);
    }

    // Update role
    if (body.role !== undefined) {
      updateData.role = body.role;

      // If changing from student role, clear student-specific fields
      if (body.role !== Role.STUDENT) {
        updateData.year = null;
        updateData.university = null;
        updateData.universityId = null;
      }
    }

    // Handle student-specific fields
    const finalRole = body.role !== undefined ? body.role : existingUser.role;
    
    if (finalRole === Role.STUDENT) {
      if (body.universityId !== undefined) {
        if (!body.universityId?.trim()) {
          return NextResponse.json(
            { message: "L'université est requise pour les étudiants" },
            { status: 400 }
          );
        }
        updateData.universityId = body.universityId.trim();
      }

      if (body.university !== undefined) {
        updateData.university = body.university?.trim() || null;
      }

      if (body.year !== undefined) {
        updateData.year = body.year;
      }
    } else {
      // If not a student, clear student fields
      updateData.year = null;
      updateData.university = null;
      updateData.universityId = null;
    }

    // Handle general fields (available for all roles)
    if (body.sex !== undefined) {
      updateData.sex = body.sex;
    }

    if (body.phoneNumber !== undefined) {
      if (body.phoneNumber && !/^\+\d{1,3}\d{8,14}$/.test(body.phoneNumber)) {
        return NextResponse.json(
          { message: "Format de téléphone invalide" },
          { status: 400 }
        );
      }
      updateData.phoneNumber = body.phoneNumber?.trim() || null;
    }

    // Update the user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        year: true,
        university: true,
        universityId: true,
        sex: true,
        phoneNumber: true,
        createdAt: true,
        emailVerified: true,
        image: true,
        universityRelation: {
          select: {
            id: true,
            name: true,
          }
        },
      },
    });

    return NextResponse.json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error updating user:", error);
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: "Un compte avec cette adresse e-mail existe déjà" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN"]);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Session invalide" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (existingUser.id === session.user.id) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 403 }
      );
    }

    // Delete the user
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: "Utilisateur supprimé avec succès",
    });

  } catch (error) {
    console.error("Error deleting user:", error);

    // Handle foreign key constraint errors
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { message: "Impossible de supprimer cet utilisateur car il est référencé dans d'autres données" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}