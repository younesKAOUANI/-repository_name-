import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['STUDENT']);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Session utilisateur non trouvée' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        university: true,
        year: true,
        sex: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        licenses: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          },
          include: {
            plan: {
              include: {
                planType: true
              }
            },
            yearScope: {
              include: {
                studyYear: true
              }
            },
            semScope: {
              include: {
                semester: {
                  include: {
                    studyYear: true
                  }
                }
              }
            },
            modScope: {
              include: {
                module: {
                  include: {
                    semester: {
                      include: {
                        studyYear: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Get user stats
    const quizStats = await db.quizAttempt.aggregate({
      where: {
        userId: session.user.id,
        finishedAt: { not: null }
      },
      _count: { id: true },
      _avg: { score: true },
      _max: { score: true }
    });

    // Get recent quiz attempts
    const recentQuizAttempts = await db.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        finishedAt: { not: null }
      },
      include: {
        quiz: {
          select: {
            title: true,
            module: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        finishedAt: 'desc'
      },
      take: 10
    });

    // Calculate stats
    const stats = {
      totalQuizzes: quizStats._count.id || 0,
      averageScore: Number(quizStats._avg.score) || 0,
      bestScore: Number(quizStats._max.score) || 0,
      totalStudyTime: 0, // This would require tracking study sessions
      currentStreak: 0, // This would require more complex calculation
      totalModulesAccessed: 0 // This would require tracking module access
    };

    // Transform recent attempts for client
    const transformedAttempts = recentQuizAttempts.map(attempt => ({
      id: attempt.id,
      score: Number(attempt.score) || 0,
      maxScore: 100, // Assuming scores are percentages
      percentage: Number(attempt.score) || 0,
      completedAt: attempt.finishedAt?.toISOString(),
      quiz: {
        title: attempt.quiz.title,
        module: {
          name: attempt.quiz.module?.name || 'Module inconnu'
        }
      }
    }));

    // Get all universities for dropdown
    const universities = await db.university.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      user,
      licenses: user.licenses,
      recentQuizAttempts: transformedAttempts,
      stats,
      universities
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération du profil' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole(['STUDENT']);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Session utilisateur non trouvée' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, currentPassword, newPassword, year, universityId, sex, phoneNumber } = body;

    // Validate required fields
    if (!name && !email && !newPassword && year === undefined && !universityId && sex === undefined && phoneNumber === undefined) {
      return NextResponse.json(
        { error: 'Au moins un champ doit être fourni pour la mise à jour' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    // Update name if provided
    if (name) {
      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Le nom doit contenir au moins 2 caractères' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    // Update email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Format d\'email invalide' },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const existingUser = await db.user.findFirst({
        where: {
          email: email,
          id: { not: session.user.id }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà utilisée' },
          { status: 400 }
        );
      }

      updateData.email = email.toLowerCase();
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Le mot de passe actuel est requis pour changer le mot de passe' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
          { status: 400 }
        );
      }

      // Verify current password
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
      });

      if (!user?.password) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedPassword;
    }

    // Update year if provided
    if (year !== undefined) {
      if (year !== null && (year < 1 || year > 6)) {
        return NextResponse.json(
          { error: 'L\'année d\'étude doit être entre 1 et 6' },
          { status: 400 }
        );
      }
      updateData.year = year;
    }

    // Update university if provided
    if (universityId !== undefined) {
      if (universityId) {
        // Validate that the university exists
        const university = await db.university.findUnique({
          where: { id: universityId }
        });
        
        if (!university) {
          return NextResponse.json(
            { error: 'Université non trouvée' },
            { status: 400 }
          );
        }
        updateData.university = university.name;
      } else {
        updateData.university = null;
      }
    }

    // Update sex if provided
    if (sex !== undefined) {
      if (sex && !['MALE', 'FEMALE'].includes(sex)) {
        return NextResponse.json(
          { error: 'Sexe invalide' },
          { status: 400 }
        );
      }
      updateData.sex = sex || null;
    }

    // Update phone number if provided
    if (phoneNumber !== undefined) {
      if (phoneNumber && phoneNumber.trim().length > 0) {
        // Basic phone number validation
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
        if (!phoneRegex.test(phoneNumber.trim())) {
          return NextResponse.json(
            { error: 'Format de numéro de téléphone invalide' },
            { status: 400 }
          );
        }
        updateData.phoneNumber = phoneNumber.trim();
      } else {
        updateData.phoneNumber = null;
      }
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Échec de la mise à jour du profil' },
      { status: 500 }
    );
  }
}
