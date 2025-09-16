/**
 * Global type definitions for the Pharmapedia application
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'student' | 'instructor' | 'admin';

// Student types
export interface Student extends User {
  role: 'student';
  year: number;
  university?: string;
  subscription?: Subscription;
}

// Subscription types
export interface Subscription {
  id: string;
  studentId: string;
  planType: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionPlan = 'free' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'expired';

// Module and Lesson types
export interface Module {
  id: string;
  title: string;
  description: string;
  year: number;
  order: number;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  moduleId: string;
  order: number;
  duration: number; // in minutes
  videoUrl?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Progress tracking
export interface Progress {
  id: string;
  studentId: string;
  lessonId?: string;
  quizId?: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
  timeSpent: number; // in minutes
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  year: number;
  university?: string;
}
