import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, unauthorizedResponse } from '@/lib/auth-utils';
import { licenseService } from '@/services/license.service';

// GET /api/licenses/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await requireAdmin();

    const { id } = await params;
    const licenseId = parseInt(id);
    if (isNaN(licenseId)) {
      return NextResponse.json(
        { error: 'Invalid license ID' },
        { status: 400 }
      );
    }

    const license = await licenseService.getLicenseById(licenseId);
    
    return NextResponse.json({ license });
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    console.error('Error fetching license:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license' }, 
      { status: 500 }
    );
  }
}

// PUT /api/licenses/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await requireAdmin();

    const { id } = await params;
    const licenseId = parseInt(id);
    if (isNaN(licenseId)) {
      return NextResponse.json(
        { error: 'Invalid license ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    let updatedLicense;

    if (body.action === 'updateStatus') {
      updatedLicense = await licenseService.updateLicenseStatus(licenseId, body.isActive);
    } else if (body.action === 'extend') {
      if (!body.additionalDays || body.additionalDays <= 0) {
        return NextResponse.json(
          { error: 'additionalDays must be a positive number' },
          { status: 400 }
        );
      }
      updatedLicense = await licenseService.extendLicense(licenseId, body.additionalDays);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "updateStatus" or "extend"' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      message: 'License updated successfully',
      license: updatedLicense 
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error updating license:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update license' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/licenses/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await requireAdmin();

    const { id } = await params;
    const licenseId = parseInt(id);
    if (isNaN(licenseId)) {
      return NextResponse.json(
        { error: 'Invalid license ID' },
        { status: 400 }
      );
    }

    await licenseService.deleteLicense(licenseId);
    
    return NextResponse.json({ 
      message: 'License deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return unauthorizedResponse(error.message);
    }
    console.error('Error deleting license:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete license' }, 
      { status: 500 }
    );
  }
}
