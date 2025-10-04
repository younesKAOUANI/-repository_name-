import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const university = await db.university.findUnique({
      where: { id: params.id },
      include: {
        driveLinks: {
          orderBy: {
            year: 'desc'
          }
        },
        _count: {
          select: {
            driveLinks: true
          }
        }
      }
    });

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(university);
  } catch (error) {
    console.error("Error fetching university:", error);
    return NextResponse.json(
      { error: "Failed to fetch university" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "University name is required" },
        { status: 400 }
      );
    }

    const params = await context.params;

    // Check if another university with this name exists
    const existingUniversity = await db.university.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        id: {
          not: params.id
        }
      }
    });

    if (existingUniversity) {
      return NextResponse.json(
        { error: "University with this name already exists" },
        { status: 400 }
      );
    }

    const university = await db.university.update({
      where: { id: params.id },
      data: { name },
      include: {
        driveLinks: {
          orderBy: {
            year: 'desc'
          }
        },
        _count: {
          select: {
            driveLinks: true
          }
        }
      }
    });

    return NextResponse.json(university);
  } catch (error) {
    console.error("Error updating university:", error);
    return NextResponse.json(
      { error: "Failed to update university" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;

    // Check if university exists
    const university = await db.university.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            driveLinks: true
          }
        }
      }
    });

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      );
    }

    // Delete university (cascade will handle drive links)
    await db.university.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "University deleted successfully" });
  } catch (error) {
    console.error("Error deleting university:", error);
    return NextResponse.json(
      { error: "Failed to delete university" },
      { status: 500 }
    );
  }
}