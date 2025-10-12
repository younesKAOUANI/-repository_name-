import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";

interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  year: string | number;
  universityId: string;
  sex: string;
  phoneNumber: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignUpRequest = await request.json();
        // Destructure the request body
    const { name, email, password, confirmPassword, year, universityId, sex, phoneNumber } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Le nom, email et mot de passe sont requis" },
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Parse year from string or number (extract the first number)
    let yearNumber = null;
    if (year) {
      if (typeof year === 'string') {
        yearNumber = parseInt(year.match(/\d+/)?.[0] || '1', 10);
      } else if (typeof year === 'number') {
        yearNumber = year;
      } else {
        yearNumber = parseInt(String(year), 10) || null;
      }
    }

    // Validate sex if provided
    if (sex && !['MALE', 'FEMALE'].includes(sex)) {
      return NextResponse.json(
        { message: "Sexe invalide" },
        { status: 400 }
      );
    }

    // Validate and get university if provided
    let universityName = null;
    if (universityId) {
      const university = await db.university.findUnique({
        where: { id: universityId },
        select: { name: true }
      });
      
      if (!university) {
        return NextResponse.json(
          { message: "Université invalide" },
          { status: 400 }
        );
      }
      
      universityName = university.name;
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with verification token
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: Role.STUDENT, // Default role for sign-up
        year: yearNumber,
        university: universityName,
        sex: sex || null,
        phoneNumber: phoneNumber?.trim() || null,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
        emailVerified: null, // Not verified yet
      } as any, // Temporary fix for TypeScript cache issue
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        year: true,
        university: true,
        sex: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(
      user.email!,
      user.name!,
      verificationToken
    );

    if (!emailSent) {
      // If email fails, we could either delete the user or log the error
      console.error(`Failed to send verification email to ${user.email}`);
      // For now, we'll continue but log the error
    }

    return NextResponse.json(
      {
        message: "Compte créé avec succès. Vérifiez votre adresse e-mail pour activer votre compte.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          year: user.year,
          university: user.university,
        },
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign up error:", error);
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: "Un compte avec cette adresse e-mail existe déjà" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}