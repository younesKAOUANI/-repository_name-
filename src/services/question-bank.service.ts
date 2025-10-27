/**
 * Question Bank Service
 * Manages the question bank for revision quizzes
 */

import { QuestionType } from '@prisma/client';

// Types for Question Bank
export interface QuestionBankItem {
  id: string;
  text: string;
  questionType: QuestionType;
  studyYearId?: string;
  lessonId?: string;
  moduleId?: string;
  explanation?: string;
  explanationImg?: string | null;
  questionImage?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studyYear?: {
    id: string;
    name: string;
  };
  lesson?: {
    id: string;
    title: string;
    module: {
      id: string;
      name: string;
    };
  };
  module?: {
    id: string;
    name: string;
  };
  options: QuestionBankOption[];
}

export interface QuestionBankOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionBankCreate {
  text: string;
  questionType: QuestionType;
  studyYearId?: string;
  lessonId?: string;
  moduleId?: string;
  explanation?: string;
  explanationImg?: string | null;
  questionImage?: string | null;
  options: QuestionBankOptionCreate[];
}

export interface QuestionBankOptionCreate {
  text: string;
  isCorrect: boolean;
}

export interface QuestionBankFilters {
  search: string;
  questionType?: QuestionType;
  studyYearId?: string;
  moduleId?: string;
  lessonId?: string;
  difficulty?: string;
  isActive?: boolean;
}

export interface QuestionBankPagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface QuestionBankListResponse {
  questions: QuestionBankItem[];
  pagination: QuestionBankPagination;
}

export interface RevisionQuizRequest {
  selectedLessons: string[];
  selectedModules: string[];
  questionCount: number;
  timeLimit?: number;
  difficulty?: string;
  questionTypes?: QuestionType[];
}

export interface GeneratedRevisionQuiz {
  id: string;
  title: string;
  description: string;
  type: 'SESSION';
  questionCount: number;
  timeLimit?: number;
  questions: QuestionBankItem[];
  selectedLessons: string[];
  selectedModules: string[];
  createdAt: string;
}

class QuestionBankService {
  private baseUrl = '/api/question-bank';
  private revisionUrl = '/api/question-bank';

  /**
   * Get all question bank items with pagination and filters
   */
  async getQuestions(
    page: number = 1,
    pageSize: number = 10,
    filters: QuestionBankFilters = { search: '' }
  ): Promise<QuestionBankListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      search: filters.search,
      ...(filters.questionType && { questionType: filters.questionType }),
      ...(filters.moduleId && { moduleId: filters.moduleId }),
      ...(filters.lessonId && { lessonId: filters.lessonId }),
      ...(filters.difficulty && { difficulty: filters.difficulty }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive.toString() }),
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error('Échec de la récupération des éléments de la banque de questions');
    }
    return response.json();
  }

  /**
   * Get question bank item by ID
   */
  async getQuestionById(id: string): Promise<QuestionBankItem> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Échec de la récupération de la question');
    }
    return response.json();
  }

  /**
   * Create a new question bank item
   */
  async createQuestion(questionData: QuestionBankCreate): Promise<QuestionBankItem> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la création de la question');
    }
    return response.json();
  }

  /**
   * Update a question bank item
   */
  async updateQuestion(id: string, questionData: Partial<QuestionBankCreate>): Promise<QuestionBankItem> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la mise à jour de la question');
    }
    return response.json();
  }

  /**
   * Delete a question bank item
   */
  async deleteQuestion(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la suppression de la question');
    }
  }

  /**
   * Toggle question active status
   */
  async toggleQuestionStatus(id: string): Promise<QuestionBankItem> {
    const response = await fetch(`${this.baseUrl}/${id}/toggle`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la modification du statut de la question');
    }
    return response.json();
  }

  /**
   * Generate a revision quiz based on selected lessons/modules
   */
  async generateRevisionQuiz(request: RevisionQuizRequest): Promise<GeneratedRevisionQuiz> {
    const response = await fetch(`${this.revisionUrl}/generate-revision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la génération du quiz de révision');
    }
    return response.json();
  }

  /**
   * Get available questions count for given lessons/modules
   */
  async getAvailableQuestionsCount(lessonIds: string[], moduleIds: string[]): Promise<{
    totalQuestions: number;
    byType: Record<QuestionType, number>;
  }> {
    const params = new URLSearchParams();
    lessonIds.forEach(id => params.append('lessonIds', id));
    moduleIds.forEach(id => params.append('moduleIds', id));

    const response = await fetch(`${this.baseUrl}/count?${params}`);
    if (!response.ok) {
      throw new Error('Échec de la récupération du nombre de questions disponibles');
    }
    return response.json();
  }
}

export const questionBankService = new QuestionBankService();
