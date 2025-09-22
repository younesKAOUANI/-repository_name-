/**
 * Student Quiz Service
 * Handles quiz-related API calls for students
 */

export interface QuizItem {
  id: number;
  title: string;
  description?: string;
  timeLimit?: number;
  questionsCount: number;
  order: number;
  isCompleted: boolean;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt?: string;
  createdAt: string;
}

export interface LessonWithQuizzes {
  id: number;
  title: string;
  description?: string;
  order: number;
  quizzes: QuizItem[];
}

export interface ModuleWithQuizzes {
  id: number;
  name: string;
  studyYear?: {
    id: number;
    name: string;
  };
  lessons: LessonWithQuizzes[];
}

export interface QuizFilters {
  studyYearId?: number;
}

class StudentQuizService {
  private baseUrl = '/api/student/quizzes';

  /**
   * Get quizzes organized by modules and lessons
   */
  async getQuizzes(filters: QuizFilters = {}): Promise<ModuleWithQuizzes[]> {
    const params = new URLSearchParams();
    
    if (filters.studyYearId) params.append('studyYearId', filters.studyYearId.toString());

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }
    
    return response.json();
  }

  /**
   * Start a quiz session
   */
  async startQuiz(quizId: number) {
    const response = await fetch(`/api/student/exams/${quizId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start quiz');
    }

    return response.json();
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(quizId: number, attemptId: number, answers: any[]) {
    const response = await fetch(`/api/student/exams/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attemptId,
        answers,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit quiz');
    }

    return response.json();
  }
}

export const studentQuizService = new StudentQuizService();
