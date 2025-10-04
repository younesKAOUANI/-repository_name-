import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');

    const whereClause = universityId ? { universityId } : {};

    const driveLinks = await db.driveLink.findMany({
      where: whereClause,
      include: {
        university: true
      },
      orderBy: [
        { university: { name: 'asc' } },
        { studyYear: 'asc' },
        { year: 'desc' }
      ]
    });

    return NextResponse.json(driveLinks);
  } catch (error) {
    console.error("Error fetching drive links:", error);
    return NextResponse.json(
      { error: "Failed to fetch drive links" },
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

    const { studyYear, year, link, universityId } = await request.json();

    if (!studyYear || !year || !link || !universityId) {
      return NextResponse.json(
        { error: "Study year, year, link, and university ID are required" },
        { status: 400 }
      );
    }

    // Validate year format (YYYY/YYYY)
    const yearPattern = /^\d{4}\/\d{4}$/;
    if (!yearPattern.test(year)) {
      return NextResponse.json(
        { error: "Year must be in format YYYY/YYYY (e.g., 2024/2025)" },
        { status: 400 }
      );
    }

    // Check if university exists
    const university = await db.university.findUnique({
      where: { id: universityId }
    });

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      );
    }

    // Check if drive link already exists for this university, study year and year
    const existingDriveLink = await db.driveLink.findFirst({
      where: {
        universityId,
        studyYear,
        year
      }
    });

    if (existingDriveLink) {
      return NextResponse.json(
        { error: "Drive link for this university, study year and academic year already exists" },
        { status: 400 }
      );
    }

    const driveLink = await db.driveLink.create({
      data: {
        studyYear,
        year,
        link,
        universityId
      },
      include: {
        university: true
      }
    });

    return NextResponse.json(driveLink, { status: 201 });
  } catch (error) {
    console.error("Error creating drive link:", error);
    return NextResponse.json(
      { error: "Failed to create drive link" },
      { status: 500 }
    );
  }
}