/**
 * Lesson domain types and services
 */

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  moduleId: string;
  order: number;
  duration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  studentId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; // in minutes
}

export class LessonService {
  
  /**
   * Get lessons by module
   */
  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented');
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(id: string): Promise<Lesson | null> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented');
  }

  /**
   * Mark lesson as completed
   */
  async markLessonCompleted(lessonId: string, studentId: string): Promise<LessonProgress> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented');
  }

  /**
   * Get student lesson progress
   */
  async getStudentProgress(studentId: string): Promise<LessonProgress[]> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented');
  }
}

export const lessonService = new LessonService();
