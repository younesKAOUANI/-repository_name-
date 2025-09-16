/**
 * Simple validation utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationResult {
  public errors: ValidationError[] = [];

  get isValid(): boolean {
    return this.errors.length === 0;
  }

  addError(field: string, message: string): void {
    this.errors.push({ field, message });
  }
}

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password validation
 */
export function isValidPassword(password: string): boolean {
  return Boolean(password && password.length >= 8);
}

/**
 * Name validation
 */
export function isValidName(name: string): boolean {
  return Boolean(name && name.trim().length >= 2);
}

/**
 * Year validation (for pharmacy students)
 */
export function isValidYear(year: number): boolean {
  return year >= 1 && year <= 6;
}

/**
 * Validate sign up data
 */
export function validateSignUpData(data: any): ValidationResult {
  const result = new ValidationResult();

  if (!data.name || !isValidName(data.name)) {
    result.addError('name', 'Name must be at least 2 characters');
  }

  if (!data.email || !isValidEmail(data.email)) {
    result.addError('email', 'Invalid email address');
  }

  if (!data.password || !isValidPassword(data.password)) {
    result.addError('password', 'Password must be at least 8 characters');
  }

  if (data.role && !['STUDENT', 'TEACHER', 'ADMIN'].includes(data.role)) {
    result.addError('role', 'Invalid role');
  }

  if (data.year && !isValidYear(data.year)) {
    result.addError('year', 'Year must be between 1 and 6');
  }

  return result;
}

/**
 * Validate profile update data
 */
export function validateProfileData(data: any): ValidationResult {
  const result = new ValidationResult();

  if (data.name !== undefined && !isValidName(data.name)) {
    result.addError('name', 'Name must be at least 2 characters');
  }

  if (data.year !== undefined && !isValidYear(data.year)) {
    result.addError('year', 'Year must be between 1 and 6');
  }

  return result;
}

/**
 * Validate password change data
 */
export function validatePasswordChange(data: any): ValidationResult {
  const result = new ValidationResult();

  if (!data.currentPassword) {
    result.addError('currentPassword', 'Current password is required');
  }

  if (!data.newPassword || !isValidPassword(data.newPassword)) {
    result.addError('newPassword', 'New password must be at least 8 characters');
  }

  if (data.confirmPassword && data.newPassword !== data.confirmPassword) {
    result.addError('confirmPassword', 'Passwords do not match');
  }

  return result;
}
