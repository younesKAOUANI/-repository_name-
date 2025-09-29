/**
 * Student Quiz Service
 * Handles quiz-related API calls for students
 */

export interface QuizItem {
  id: string;
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
  // Whether the student is allowed to start this quiz (sequential gating)
  canStart?: boolean;
}

export interface LessonWithQuizzes {
  id: string;
  title: string;
  description?: string;
  order: number;
  quizzes: QuizItem[];
}

export interface ModuleWithQuizzes {
  id: string;
  name: string;
  studyYear?: {
    id: string;
    name: string;
  };
  lessons: LessonWithQuizzes[];
}

export interface QuizFilters {
  studyYearId?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionIds: string[];
  textAnswer?: string;
}

class StudentQuizService {
  private baseUrl = '/api/student/quizzes';

  /**
   * Get quizzes organized by modules and lessons
   */
  async getQuizzes(filters: QuizFilters = {}): Promise<ModuleWithQuizzes[]> {
    const params = new URLSearchParams();
    
    if (filters.studyYearId) params.append('studyYearId', filters.studyYearId);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }
    
    return response.json();
  }

  /**
   * Start a quiz session
   */
  async startQuiz(quizId: string) {
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
  async submitQuiz(quizId: string, attemptId: string, answers: QuizAnswer[]) {
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
