/**
 * Student Exam Service
 * Handles exam-related API calls for students
 */

export interface StudentExam {
  id: number;
  title: string;
  description?: string;
  timeLimit?: number;
  questionsCount: number;
  isCompleted: boolean;
  score?: number;
  maxScore: number;
  percentage?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  studyYear?: {
    id: number;
    name: string;
  };
  module?: {
    id: number;
    name: string;
  };
  lesson?: {
    id: number;
    title: string;
  };
}

export interface ExamHistory {
  id: number;              // Quiz ID
  attemptId: number;       // Specific attempt ID (from QuizAttempt)
  title: string;
  description?: string;
  timeLimit?: number;
  questionsCount: number;
  isCompleted: boolean;    // Always true for history
  score: number;           // Student's score for this attempt
  maxScore: number;        // Maximum possible score
  percentage: number;      // Score percentage for this attempt
  startedAt: string;       // When this attempt was started
  completedAt: string;     // When this attempt was completed
  createdAt: string;       // When the quiz was created
  studyYear?: {
    id: number;
    name: string;
  };
  module?: {
    id: number;
    name: string;
  };
  lesson?: {
    id: number;
    title: string;
  };
}

export interface ExamQuestion {
  id: number;
  text: string;
  questionType: string;
  options: {
    id: number;
    text: string;
  }[];
}

export interface ExamSession {
  attemptId: number;
  startedAt: string;
  timeLimit?: number; // in minutes
  questions: ExamQuestion[];
}

export interface ExamAnswer {
  questionId: number;
  selectedOptionIds: number[];
  textAnswer?: string;
}

export interface QuestionResult {
  questionId: number;
  questionText: string;
  questionType: string;
  userAnswer: string[];
  correctAnswer: string[];
  isCorrect: boolean;
  partialScore: number;
  maxScore: number;
  explanation?: string;
}

export interface ExamResult {
  id: number;
  examId: number;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  timeSpent: number;
  questionResults: QuestionResult[];
}

export interface ExamFilters {
  moduleId?: number;
  lessonId?: number;
  studyYearId?: number;
  isCompleted?: boolean;
}

class StudentExamService {
  private baseUrl = '/api/student/exams';

  /**
   * Get available exams for the student
   */
  async getExams(filters: ExamFilters = {}): Promise<StudentExam[]> {
    const params = new URLSearchParams();
    
    if (filters.moduleId) params.append('moduleId', filters.moduleId.toString());
    if (filters.lessonId) params.append('lessonId', filters.lessonId.toString());
    if (filters.studyYearId) params.append('studyYearId', filters.studyYearId.toString());
    if (filters.isCompleted !== undefined) params.append('isCompleted', filters.isCompleted.toString());

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la récupération des examens');
    }
    return response.json();
  }

  /**
   * Start an exam session
   */
  async startExam(examId: number): Promise<ExamSession> {
    const response = await fetch(`${this.baseUrl}/${examId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec du démarrage de l\'examen');
    }
    return response.json();
  }

  /**
   * Submit exam answers
   */
  async submitExam(examId: number, attemptId: number, answers: ExamAnswer[]): Promise<ExamResult> {
    const response = await fetch(`${this.baseUrl}/${examId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attemptId,
        answers
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la soumission de l\'examen');
    }
    return response.json();
  }

  /**
   * Get exam history from quiz attempts
   */
  async getExamHistory(filters: ExamFilters = {}): Promise<ExamHistory[]> {
    const params = new URLSearchParams();
    
    if (filters.moduleId) params.append('moduleId', filters.moduleId.toString());
    if (filters.lessonId) params.append('lessonId', filters.lessonId.toString());
    if (filters.studyYearId) params.append('studyYearId', filters.studyYearId.toString());

    const response = await fetch(`${this.baseUrl}/history?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la récupération de l\'historique des examens');
    }
    return response.json();
  }

  /**
   * Get exam results/history
   */
  async getExamResults(attemptId?: number): Promise<any[]> {
    const url = attemptId ? `${this.baseUrl}/results/${attemptId}` : `${this.baseUrl}/results`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la récupération des résultats d\'examen');
    }
    return response.json();
  }

  /**
   * Get study years available to the student
   */
  async getAvailableStudyYears(): Promise<any[]> {
    const response = await fetch('/api/study-years');
    if (!response.ok) {
      throw new Error('Échec de la récupération des années d\'étude');
    }
    return response.json();
  }
}

export const studentExamService = new StudentExamService();
