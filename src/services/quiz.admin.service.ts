/**
 * Quiz Administration Service
 * Handles all quiz operations for admin and teacher interfaces
 */

import { QuizType, QuestionType } from '@prisma/client';

export interface QuizCreate {
  title: string;
  description?: string;
  type: QuizType;
  lessonId?: number;
  moduleId?: number;
  questionCount?: number; // for SESSION quizzes
  timeLimit?: number; // in minutes
  questions?: QuestionCreate[];
  sessionLessons?: number[]; // for SESSION quizzes - lesson IDs to pull questions from
}

export interface QuestionCreate {
  text: string;
  questionType: QuestionType;
  order?: number;
  options: AnswerOptionCreate[];
}

export interface AnswerOptionCreate {
  text: string;
  isCorrect: boolean;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  type: QuizType;
  lessonId?: number;
  moduleId?: number;
  questionCount?: number;
  timeLimit?: number;
  order?: number;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    id: number;
    title: string;
    module: {
      id: number;
      name: string;
    };
  };
  module?: {
    id: number;
    name: string;
    semester: {
      id: number;
      name: string;
      studyYear: {
        id: number;
        name: string;
      };
    };
  };
  questions?: Question[];
  sessionLessons?: {
    lesson: {
      id: number;
      title: string;
    };
  }[];
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface Question {
  id: number;
  text: string;
  questionType: QuestionType;
  order?: number;
  options: AnswerOption[];
}

export interface AnswerOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface QuizFilters {
  search: string;
  type?: QuizType;
  moduleId?: number;
  lessonId?: number;
}

export interface QuizPagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface QuizListResponse {
  quizzes: Quiz[];
  pagination: QuizPagination;
}

export interface QuizStats {
  totalQuizzes: number;
  quizzesByType: {
    QUIZ: number;
    EXAM: number;
    SESSION: number;
  };
  totalAttempts: number;
  averageScore: number;
}

export interface SessionQuizOptions {
  questionCount: number; // 15-50
  selectedLessons: number[];
  selectedModules: number[];
  selectedSemesters: number[];
  timeLimit?: number;
}

class QuizAdminService {
  private baseUrl = '/api/quizzes';

  /**
   * Get all quizzes with pagination and filters
   */
  async getQuizzes(
    page: number = 1,
    pageSize: number = 10,
    filters: QuizFilters = { search: '' }
  ): Promise<QuizListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      search: filters.search,
      ...(filters.type && { type: filters.type }),
      ...(filters.moduleId && { moduleId: filters.moduleId.toString() }),
      ...(filters.lessonId && { lessonId: filters.lessonId.toString() }),
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error('Échec de la récupération des quiz');
    }
    return response.json();
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(id: number): Promise<Quiz> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Échec de la récupération du quiz');
    }
    return response.json();
  }

  /**
   * Create a new quiz
   */
  async createQuiz(quizData: QuizCreate): Promise<Quiz> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la création du quiz');
    }
    return response.json();
  }

  /**
   * Update a quiz
   */
  async updateQuiz(id: number, quizData: Partial<QuizCreate>): Promise<Quiz> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la mise à jour du quiz');
    }
    return response.json();
  }

  /**
   * Delete a quiz
   */
  async deleteQuiz(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la suppression du quiz');
    }
  }

  /**
   * Generate session quiz questions
   */
  async generateSessionQuiz(options: SessionQuizOptions): Promise<Question[]> {
    const response = await fetch(`${this.baseUrl}/generate-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la génération du quiz de session');
    }
    return response.json();
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats(): Promise<QuizStats> {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) {
      throw new Error('Échec de la récupération des statistiques des quiz');
    }
    return response.json();
  }

  /**
   * Get available resources for quiz creation
   */
  async getQuizResources(): Promise<{
    studyYears: Array<{
      id: number;
      name: string;
      semesters: Array<{
        id: number;
        name: string;
        modules: Array<{
          id: number;
          name: string;
          lessons: Array<{
            id: number;
            title: string;
          }>;
        }>;
      }>;
    }>;
  }> {
    const response = await fetch(`${this.baseUrl}/resources`);
    if (!response.ok) {
      throw new Error('Échec de la récupération des ressources des quiz');
    }
    return response.json();
  }

  /**
   * Duplicate a quiz
   */
  async duplicateQuiz(id: number, newTitle?: string): Promise<Quiz> {
    const response = await fetch(`${this.baseUrl}/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newTitle }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la duplication du quiz');
    }
    return response.json();
  }
}

// Export singleton instance
export const quizAdminService = new QuizAdminService();
export default quizAdminService;
