import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { Role } from '@prisma/client';

export interface Student {
  id: string;
  name: string | null;
  email: string | null;
  year: number | null;
  university: string | null;
  createdAt: Date;
  emailVerified: Date | null;
  image: string | null;
  _count?: {
    quizAttempts: number;
    licenses: number;
  };
}

export interface StudentFilters {
  search?: string;
  year?: number;
  university?: string;
  verified?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Student service for managing student operations
 */
export class StudentService {
  
  /**
   * Get all students with optional filters
   */
  async getAllStudents(filters: StudentFilters = {}) {
    try {
      const { 
        search, 
        year, 
        university, 
        verified, 
        page = 1, 
        pageSize = 10 
      } = filters;

      logger.info('Fetching students with filters', { filters });

      const where: any = {
        role: Role.STUDENT,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { university: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (year !== undefined) {
        where.year = year;
      }

      if (university) {
        where.university = { contains: university, mode: 'insensitive' };
      }

      if (verified !== undefined) {
        where.emailVerified = verified ? { not: null } : null;
      }

      const [students, totalCount] = await Promise.all([
        db.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            year: true,
            university: true,
            createdAt: true,
            emailVerified: true,
            image: true,
            _count: {
              select: {
                quizAttempts: true,
                licenses: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        db.user.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        students: students as Student[],
        pagination: {
          currentPage: page,
          totalPages,
          pageSize,
          totalItems: totalCount,
        },
      };
    } catch (error) {
      logger.error('Error fetching students', { error });
      throw new Error('Échec de la récupération des étudiants');
    }
  }

  /**
   * Get student by ID
   */
  async getStudentById(id: string) {
    try {
      logger.info('Fetching student by ID', { studentId: id });
      
      const student = await db.user.findFirst({
        where: {
          id,
          role: Role.STUDENT,
        },
        select: {
          id: true,
          name: true,
          email: true,
          year: true,
          university: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          image: true,
          _count: {
            select: {
              quizAttempts: true,
              licenses: true,
              quizProgresses: true,
            },
          },
        },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      return student;
    } catch (error) {
      logger.error('Error fetching student', { studentId: id, error });
      throw error;
    }
  }

  /**
   * Create new student
   */
  async createStudent(studentData: any) {
    try {
      logger.info('Creating new student', { studentData });
      // TODO: Implement with Prisma
      return studentData;
    } catch (error) {
      logger.error('Error creating student', { studentData, error });
      throw error;
    }
  }

  /**
   * Update student
   */
  async updateStudent(id: string, updateData: Partial<Student>) {
    try {
      logger.info('Updating student', { studentId: id, updateData });
      
      const updatedStudent = await db.user.update({
        where: { 
          id,
          role: Role.STUDENT,
        },
        data: {
          name: updateData.name,
          year: updateData.year,
          university: updateData.university,
        },
        select: {
          id: true,
          name: true,
          email: true,
          year: true,
          university: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          image: true,
        },
      });

      return updatedStudent;
    } catch (error) {
      logger.error('Error updating student', { studentId: id, error });
      throw new Error('Échec de la mise à jour de l\'étudiant');
    }
  }

  /**
   * Delete student
   */
  async deleteStudent(id: string) {
    try {
      logger.info('Deleting student', { studentId: id });
      
      await db.user.delete({
        where: { 
          id,
          role: Role.STUDENT,
        },
      });

      return true;
    } catch (error) {
      logger.error('Error deleting student', { studentId: id, error });
      throw new Error('Échec de la suppression de l\'étudiant');
    }
  }

  /**
   * Get student statistics
   */
  async getStudentStats() {
    try {
      logger.info('Fetching student statistics');
      
      const [
        totalStudents,
        verifiedStudents,
        studentsByYear,
        recentStudents,
      ] = await Promise.all([
        db.user.count({ where: { role: Role.STUDENT } }),
        db.user.count({ 
          where: { 
            role: Role.STUDENT,
            emailVerified: { not: null },
          },
        }),
        db.user.groupBy({
          by: ['year'],
          where: { role: Role.STUDENT },
          _count: { id: true },
          orderBy: { year: 'asc' },
        }),
        db.user.count({
          where: {
            role: Role.STUDENT,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

      return {
        totalStudents,
        verifiedStudents,
        unverifiedStudents: totalStudents - verifiedStudents,
        studentsByYear: studentsByYear.map(item => ({
          year: item.year || 0,
          count: item._count.id,
        })),
        recentStudents,
      };
    } catch (error) {
      logger.error('Error fetching student statistics', { error });
      throw new Error('Échec de la récupération des statistiques des étudiants');
    }
  }
}

export const studentService = new StudentService();
