import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

export async function POST(
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
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (existingUser.emailVerified) {
      return NextResponse.json(
        { message: "Cet utilisateur est déjà vérifié" },
        { status: 400 }
      );
    }

    // Verify the user's email
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
      },
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
      message: "Utilisateur vérifié avec succès",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error verifying user:", error);

    return NextResponse.json(
      { message: "Erreur lors de la vérification de l'utilisateur" },
      { status: 500 }
    );
  }
}

// Unverify user (optional - set emailVerified to null)
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

    // Unverify the user's email
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        emailVerified: null,
      },
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
      message: "Vérification de l'utilisateur annulée",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error unverifying user:", error);

    return NextResponse.json(
      { message: "Erreur lors de l'annulation de la vérification" },
      { status: 500 }
    );
  }
}
