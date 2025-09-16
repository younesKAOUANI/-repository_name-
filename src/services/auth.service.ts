import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';
// import { User } from '@/types'; // Not used, keeping for future reference
import { Role } from '@prisma/client';

/**
 * Authentication service for user management operations
 * Handles sign up, password management, profile updates, etc.
 */
export class AuthService {
  
  /**
   * Register a new user
   */
  async signUp(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
    year?: number;
    university?: string;
  }) {
    try {
      logger.info('Creating new user account', { email: userData.email });

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await db.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role as Role || Role.STUDENT,
          ...(userData.role === 'STUDENT' && {
            year: userData.year,
            university: userData.university,
          }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      });

      logger.info('User account created successfully', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Error creating user account', { email: userData.email, error });
      throw error;
    }
  }

  /**
   * Verify user credentials (used by NextAuth)
   */
  async verifyCredentials(email: string, password: string) {
    try {
      const user = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
        }
      });

      if (!user || !user.password) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error verifying credentials', { email, error });
      return null;
    }
  }

  /**
   * Initiate password reset
   */
  async forgotPassword(email: string) {
    try {
      logger.info('Initiating password reset', { email });

      const user = await db.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if user exists or not
        logger.info('Password reset requested for non-existent email', { email });
        return { message: 'If the email exists, a reset link will be sent.' };
      }

      // Generate reset token
      const resetToken = crypto.randomUUID();
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Save reset token
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        }
      });

      // TODO: Send email with reset link
      // await emailService.sendPasswordResetEmail(user.email, resetToken);

      logger.info('Password reset token generated', { userId: user.id });
      return { message: 'Password reset email sent successfully.' };
    } catch (error) {
      logger.error('Error initiating password reset', { email, error });
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      logger.info('Resetting password with token');

      const user = await db.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        }
      });

      logger.info('Password reset successfully', { userId: user.id });
      return { message: 'Password reset successfully.' };
    } catch (error) {
      logger.error('Error resetting password', { error });
      throw error;
    }
  }

  /**
   * Change user password (authenticated)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      logger.info('Changing password', { userId });

      const user = await db.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user || !user.password) {
        throw new Error('User not found');
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await db.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      logger.info('Password changed successfully', { userId });
      return { message: 'Password changed successfully.' };
    } catch (error) {
      logger.error('Error changing password', { userId, error });
      throw error;
    }
  }

  /**
   * Change user email
   */
  async changeEmail(userId: string, newEmail: string, password: string) {
    try {
      logger.info('Changing email', { userId, newEmail });

      // Verify password first
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, password: true }
      });

      if (!user || !user.password) {
        throw new Error('User not found');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Password is incorrect');
      }

      // Check if new email already exists
      const emailExists = await db.user.findUnique({
        where: { email: newEmail }
      });

      if (emailExists) {
        throw new Error('Email already in use');
      }

      // Generate email verification token
      const emailVerificationToken = crypto.randomUUID();

      await db.user.update({
        where: { id: userId },
        data: {
          pendingEmail: newEmail,
          emailVerificationToken,
        }
      });

      // TODO: Send verification email to new email address
      // await emailService.sendEmailVerification(newEmail, emailVerificationToken);

      logger.info('Email change initiated', { userId, oldEmail: user.email, newEmail });
      return { message: 'Verification email sent to new address.' };
    } catch (error) {
      logger.error('Error changing email', { userId, newEmail, error });
      throw error;
    }
  }

  /**
   * Verify new email
   */
  async verifyEmailChange(token: string) {
    try {
      logger.info('Verifying email change');

      const user = await db.user.findFirst({
        where: { emailVerificationToken: token }
      });

      if (!user || !user.pendingEmail) {
        throw new Error('Invalid verification token');
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          email: user.pendingEmail,
          pendingEmail: null,
          emailVerificationToken: null,
          emailVerified: new Date(),
        }
      });

      logger.info('Email changed successfully', { userId: user.id });
      return { message: 'Email updated successfully.' };
    } catch (error) {
      logger.error('Error verifying email change', { error });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: {
    name?: string;
    year?: number;
    university?: string;
  }) {
    try {
      logger.info('Updating user profile', { userId, profileData });

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: profileData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          year: true,
          university: true,
          updatedAt: true,
        }
      });

      logger.info('Profile updated successfully', { userId });
      return updatedUser;
    } catch (error) {
      logger.error('Error updating profile', { userId, error });
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string, password: string) {
    try {
      logger.info('Deleting user account', { userId });

      // Verify password
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user || !user.password) {
        throw new Error('User not found');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Password is incorrect');
      }

      // TODO: Handle cascading deletes (quiz attempts, progress, etc.)
      await db.user.delete({
        where: { id: userId }
      });

      logger.info('Account deleted successfully', { userId });
      return { message: 'Account deleted successfully.' };
    } catch (error) {
      logger.error('Error deleting account', { userId, error });
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          year: true,
          university: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Error fetching user profile', { userId, error });
      throw error;
    }
  }
}

export const authService = new AuthService();
