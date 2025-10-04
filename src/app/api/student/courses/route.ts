import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow access for authenticated students
    if (!session?.user) {
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
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}