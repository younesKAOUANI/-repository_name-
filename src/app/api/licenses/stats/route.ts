import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, unauthorizedResponse } from '@/lib/auth-utils';
import { licenseService } from '@/services/license.service';

// GET /api/licenses/stats
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await requireAdmin();

    const stats = await licenseService.getLicenseStats();
    
    return NextResponse.json({ stats });
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error fetching license stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license statistics' }, 
      { status: 500 }
    );
  }
}

// POST /api/licenses/stats/update-expired
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await requireAdmin();

    const updatedCount = await licenseService.updateExpiredLicenses();
    
    return NextResponse.json({ 
      message: `Updated ${updatedCount} expired licenses`,
      updatedCount 
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error updating expired licenses:', error);
    return NextResponse.json(
      { error: 'Failed to update expired licenses' }, 
      { status: 500 }
    );
  }
}
