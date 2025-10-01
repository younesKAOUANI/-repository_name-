import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  year?: number;
  university?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN"]);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role as Role;
    }

    // Get users with pagination
    const [users, totalItems] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          year: true,
          university: true,
          createdAt: true,
          emailVerified: true,
          image: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      db.user.count({ where })
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        pageSize,
        totalItems,
      }
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Erreur lors du chargement des utilisateurs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body: CreateUserRequest = await request.json();
    
    const { name, email, password, role, year, university } = body;

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Tous les champs requis doivent être remplis" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Adresse e-mail invalide" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Un compte avec cette adresse e-mail existe déjà" },
        { status: 409 }
      );
    }

    // Validate role-specific fields
    if (role === Role.STUDENT) {
      if (!university?.trim()) {
        return NextResponse.json(
          { message: "L'université est requise pour les étudiants" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        year: role === Role.STUDENT ? year : null,
        university: role === Role.STUDENT ? university?.trim() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        year: true,
        university: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Utilisateur créé avec succès",
        user,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating user:", error);
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: "Un compte avec cette adresse e-mail existe déjà" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}