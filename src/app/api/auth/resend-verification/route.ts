import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";

interface ResendVerificationRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResendVerificationRequest = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Adresse e-mail requise" },
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

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Aucun compte trouvé avec cette adresse e-mail" },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Cette adresse e-mail est déjà vérifiée" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new verification token
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      } as any, // Temporary fix for TypeScript cache issue
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(
      user.email!,
      user.name || 'Utilisateur',
      verificationToken
    );

    if (!emailSent) {
      return NextResponse.json(
        { message: "Erreur lors de l'envoi de l'e-mail de vérification" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "E-mail de vérification envoyé avec succès",
        success: true 
      }
    );

  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}