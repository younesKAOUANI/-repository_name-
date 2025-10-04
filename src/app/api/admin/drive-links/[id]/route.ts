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
    const driveLink = await db.driveLink.findUnique({
      where: { id: params.id },
      include: {
        university: true
      }
    });

    if (!driveLink) {
      return NextResponse.json(
        { error: "Drive link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(driveLink);
  } catch (error) {
    console.error("Error fetching drive link:", error);
    return NextResponse.json(
      { error: "Failed to fetch drive link" },
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

    const params = await context.params;

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

    // Check if another drive link with this university, study year and year exists
    const existingDriveLink = await db.driveLink.findFirst({
      where: {
        universityId,
        studyYear,
        year,
        id: {
          not: params.id
        }
      }
    });

    if (existingDriveLink) {
      return NextResponse.json(
        { error: "Drive link for this university, study year and academic year already exists" },
        { status: 400 }
      );
    }

    const driveLink = await db.driveLink.update({
      where: { id: params.id },
      data: {
        year,
        studyYear,
        link,
        universityId
      },
      include: {
        university: true
      }
    });

    return NextResponse.json(driveLink);
  } catch (error) {
    console.error("Error updating drive link:", error);
    return NextResponse.json(
      { error: "Failed to update drive link" },
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

    // Check if drive link exists
    const driveLink = await db.driveLink.findUnique({
      where: { id: params.id }
    });

    if (!driveLink) {
      return NextResponse.json(
        { error: "Drive link not found" },
        { status: 404 }
      );
    }

    // Delete drive link
    await db.driveLink.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Drive link deleted successfully" });
  } catch (error) {
    console.error("Error deleting drive link:", error);
    return NextResponse.json(
      { error: "Failed to delete drive link" },
      { status: 500 }
    );
  }
}