import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const universities = await db.university.findMany({
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
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(universities);
  } catch (error) {
    console.error("Error fetching universities:", error);
    return NextResponse.json(
      { error: "Failed to fetch universities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Check if university already exists
    const existingUniversity = await db.university.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingUniversity) {
      return NextResponse.json(
        { error: "University with this name already exists" },
        { status: 400 }
      );
    }

    const university = await db.university.create({
      data: {
        name
      },
      include: {
        driveLinks: true,
        _count: {
          select: {
            driveLinks: true
          }
        }
      }
    });

    return NextResponse.json(university, { status: 201 });
  } catch (error) {
    console.error("Error creating university:", error);
    return NextResponse.json(
      { error: "Failed to create university" },
      { status: 500 }
    );
  }
}