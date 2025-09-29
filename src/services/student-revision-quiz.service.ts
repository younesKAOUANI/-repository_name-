import { QuestionType } from '@prisma/client';

export interface RevisionQuizOptions {
  selectedModules: string[];
  selectedLessons: string[];
  questionCount: number;
  questionTypes?: QuestionType[];
  difficulty?: string;
  timeLimit?: number;
  title?: string;
}

export interface RevisionQuizSession {
  sessionId: string;
  quiz: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    questionCount: number | null;
    timeLimit: number | null;
    questions: RevisionQuestion[];
  };
  startedAt: string;
}

export interface RevisionQuestion {
  id: string;
  text: string;
  questionType: QuestionType;
  order: number;
  options: RevisionQuestionOption[];
}

export interface RevisionQuestionOption {
  id: string;
  text: string;
}

export interface ModuleInfo {
  id: string;
  name: string;
  description?: string;
}

export interface LessonInfo {
  id: string;
  title: string;
  moduleId: string;
  moduleName: string;
}

export interface QuestionCountInfo {
  totalQuestions: number;
  byDifficulty: Record<string, number>;
  byType: Record<QuestionType, number>;
}

class StudentRevisionQuizService {
  private baseUrl = '/api/student/revision-quiz';
  private questionBankUrl = '/api/question-bank';

  /**
   * Create a new revision quiz session
   */
  async createRevisionSession(options: RevisionQuizOptions): Promise<RevisionQuizSession> {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la création de la session de révision');
    }

    return response.json();
  }

  /**
   * Get available modules for revision
   */
  async getAvailableModules(): Promise<ModuleInfo[]> {
    const response = await fetch('/api/student/modules');
    
    if (!response.ok) {
      throw new Error('Échec de la récupération des modules');
    }

    return response.json();
  }

  /**
   * Get available lessons for a module
   */
  async getLessonsForModule(moduleId: string): Promise<LessonInfo[]> {
    const response = await fetch(`/api/student/modules/${moduleId}/lessons`);
    
    if (!response.ok) {
      throw new Error('Échec de la récupération des leçons');
    }

    return response.json();
  }

  /**
   * Get available question count for selected criteria
   */
  async getAvailableQuestionCount(
    lessonIds: string[], 
    moduleIds: string[]
  ): Promise<QuestionCountInfo> {
    const params = new URLSearchParams();
    lessonIds.forEach(id => params.append('lessonIds', id));
    moduleIds.forEach(id => params.append('moduleIds', id));

    const response = await fetch(`${this.questionBankUrl}/count?${params}`);
    
    if (!response.ok) {
      throw new Error('Échec de la récupération du nombre de questions disponibles');
    }

    return response.json();
  }

  /**
   * Submit revision quiz answers
   */
  async submitRevisionQuiz(sessionId: string, answers: Record<string, string>): Promise<{
    score: number;
    totalQuestions: number;
    percentage: number;
    results: any[];
  }> {
    const response = await fetch('/api/student/quiz-attempts/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attemptId: sessionId,
        answers
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la soumission du quiz');
    }

    return response.json();
  }
}

export const studentRevisionQuizService = new StudentRevisionQuizService();
