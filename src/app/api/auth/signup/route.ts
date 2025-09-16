import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { validateSignUpData } from '@/utils/validation.utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateSignUpData(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const user = await authService.signUp({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role || 'STUDENT',
      year: body.year,
      university: body.university,
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create account' 
      },
      { status: 500 }
    );
  }
}
