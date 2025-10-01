import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Token de vérification manquant" 
        },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Token de vérification invalide ou expiré" 
        },
        { status: 400 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { 
          success: true, 
          message: "Adresse e-mail déjà vérifiée",
          alreadyVerified: true 
        }
      );
    }

    // Verify the email
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Adresse e-mail vérifiée avec succès !",
        verified: true 
      }
    );

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Erreur lors de la vérification de l'adresse e-mail" 
      },
      { status: 500 }
    );
  }
}