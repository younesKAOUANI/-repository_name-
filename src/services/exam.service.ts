/**
 * Exam Service
 * Manages exam functionality for students
 */

import { QuestionType } from '@prisma/client';

// Types for Exam
export interface ExamQuestion {
  id: number;
  text: string;
  questionType: QuestionType;
  explanation?: string;
  options: ExamQuestionOption[];
}

export interface ExamQuestionOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface StudentExam {
  id: number;
  title: string;
  description?: string;
  timeLimit?: number; // in minutes
  questionsCount: number;
  isCompleted: boolean;
  score?: number;
  maxScore: number;
  percentage?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  module?: {
    id: number;
    name: string;
  };
  lesson?: {
    id: number;
    title: string;
  };
}

export interface ExamSession {
  id: number;
  examId: number;
  title: string;
  description?: string;
  timeLimit?: number;
  questions: ExamQuestion[];
  startedAt: string;
  expiresAt?: string;
}

export interface StudentAnswer {
  questionId: number;
  selectedOptions: number[]; // Array of option IDs
  textAnswer?: string; // For QROC questions
}

export interface ExamSubmission {
  examSessionId: number;
  answers: StudentAnswer[];
  completedAt: string;
}

export interface ExamResult {
  id: number;
  examId: number;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  timeSpent: number; // in minutes
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  userAnswer: string[];
  correctAnswer: string[];
  isCorrect: boolean;
  partialScore?: number;
  maxScore: number;
  explanation?: string;
}

export interface ExamFilters {
  moduleId?: number;
  lessonId?: number;
  isCompleted?: boolean;
  studyYearId?: number;
}

class ExamService {
  private baseUrl = '/api/student/exams';

  /**
   * Get available exams for the current student
   */
  async getAvailableExams(filters: ExamFilters = {}): Promise<StudentExam[]> {
    const params = new URLSearchParams({
      ...(filters.moduleId && { moduleId: filters.moduleId.toString() }),
      ...(filters.lessonId && { lessonId: filters.lessonId.toString() }),
      ...(filters.isCompleted !== undefined && { isCompleted: filters.isCompleted.toString() }),
      ...(filters.studyYearId && { studyYearId: filters.studyYearId.toString() }),
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch available exams');
    }
    return response.json();
  }

  /**
   * Start an exam session
   */
  async startExam(examId: number): Promise<ExamSession> {
    const response = await fetch(`${this.baseUrl}/${examId}/start`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start exam');
    }
    return response.json();
  }

  /**
   * Submit exam answers
   */
  async submitExam(submission: ExamSubmission): Promise<ExamResult> {
    const response = await fetch(`${this.baseUrl}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit exam');
    }
    return response.json();
  }

  /**
   * Get exam result by ID
   */
  async getExamResult(resultId: number): Promise<ExamResult> {
    const response = await fetch(`${this.baseUrl}/results/${resultId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch exam result');
    }
    return response.json();
  }

  /**
   * Get student's exam history
   */
  async getExamHistory(filters: ExamFilters = {}): Promise<StudentExam[]> {
    const params = new URLSearchParams({
      isCompleted: 'true',
      ...(filters.moduleId && { moduleId: filters.moduleId.toString() }),
      ...(filters.lessonId && { lessonId: filters.lessonId.toString() }),
      ...(filters.studyYearId && { studyYearId: filters.studyYearId.toString() }),
    });

    const response = await fetch(`${this.baseUrl}/history?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch exam history');
    }
    return response.json();
  }

  /**
   * Calculate exam score based on question types
   */
  calculateScore(questions: ExamQuestion[], answers: StudentAnswer[]): {
    score: number;
    maxScore: number;
    questionResults: QuestionResult[];
  } {
    let totalScore = 0;
    let maxScore = 0;
    const questionResults: QuestionResult[] = [];

    questions.forEach(question => {
      const userAnswer = answers.find(a => a.questionId === question.id);
      const questionMaxScore = this.getQuestionMaxScore(question.questionType);
      maxScore += questionMaxScore;

      const result = this.calculateQuestionScore(question, userAnswer);
      totalScore += result.score;

      questionResults.push({
        questionId: question.id,
        questionText: question.text,
        questionType: question.questionType,
        userAnswer: this.formatUserAnswer(question, userAnswer),
        correctAnswer: this.formatCorrectAnswer(question),
        isCorrect: result.isCorrect,
        partialScore: result.score,
        maxScore: questionMaxScore,
        explanation: question.explanation,
      });
    });

    return {
      score: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
      maxScore,
      questionResults,
    };
  }

  /**
   * Get maximum score for a question type
   */
  private getQuestionMaxScore(questionType: QuestionType): number {
    switch (questionType) {
      case 'QCMA': // All-or-nothing
      case 'QCS':  // Single choice
      case 'QROC': // Open response
        return 1;
      case 'QCMP': // Partial credit
        return 1;
      default:
        return 1;
    }
  }

  /**
   * Calculate score for a single question
   */
  private calculateQuestionScore(question: ExamQuestion, userAnswer?: StudentAnswer): {
    score: number;
    isCorrect: boolean;
  } {
    if (!userAnswer) {
      return { score: 0, isCorrect: false };
    }

    const correctOptions = question.options.filter(opt => opt.isCorrect);

    switch (question.questionType) {
      case 'QCMA': // All-or-nothing: must get all correct options
        const userSelectedQCMA = new Set(userAnswer.selectedOptions);
        const correctSelectedQCMA = new Set(correctOptions.map(opt => opt.id));
        
        const isExactMatch = userSelectedQCMA.size === correctSelectedQCMA.size &&
          [...userSelectedQCMA].every(id => correctSelectedQCMA.has(id));
        
        return {
          score: isExactMatch ? 1 : 0,
          isCorrect: isExactMatch
        };

      case 'QCMP': // Partial credit: proportional scoring
        const userSelectedQCMP = new Set(userAnswer.selectedOptions);
        const correctSelectedQCMP = new Set(correctOptions.map(opt => opt.id));
        const incorrectOptions = question.options.filter(opt => !opt.isCorrect);
        const incorrectSelectedQCMP = new Set(incorrectOptions.map(opt => opt.id));

        let correctCount = 0;
        let incorrectCount = 0;

        // Count correct selections
        userSelectedQCMP.forEach(id => {
          if (correctSelectedQCMP.has(id)) {
            correctCount++;
          } else if (incorrectSelectedQCMP.has(id)) {
            incorrectCount++;
          }
        });

        // Calculate partial score
        const totalCorrect = correctOptions.length;
        const score = Math.max(0, (correctCount - incorrectCount) / totalCorrect);
        
        return {
          score: Math.max(0, score),
          isCorrect: score === 1
        };

      case 'QCS': // Single choice: only one correct answer
        const userSelectedQCS = userAnswer.selectedOptions[0];
        const correctOptionQCS = correctOptions[0];
        const isCorrectQCS = userSelectedQCS === correctOptionQCS?.id;
        
        return {
          score: isCorrectQCS ? 1 : 0,
          isCorrect: isCorrectQCS
        };

      case 'QROC': // Open response: basic text matching (can be enhanced)
        const userText = userAnswer.textAnswer?.toLowerCase().trim() || '';
        const correctText = correctOptions[0]?.text?.toLowerCase().trim() || '';
        
        // Simple text comparison (can be enhanced with fuzzy matching)
        const isCorrectQROC = userText === correctText;
        
        return {
          score: isCorrectQROC ? 1 : 0,
          isCorrect: isCorrectQROC
        };

      default:
        return { score: 0, isCorrect: false };
    }
  }

  /**
   * Format user answer for display
   */
  private formatUserAnswer(question: ExamQuestion, userAnswer?: StudentAnswer): string[] {
    if (!userAnswer) return ['Pas de réponse'];

    if (question.questionType === 'QROC') {
      return [userAnswer.textAnswer || 'Pas de réponse'];
    }

    return userAnswer.selectedOptions.map(optionId => {
      const option = question.options.find(opt => opt.id === optionId);
      return option?.text || 'Option inconnue';
    });
  }

  /**
   * Format correct answer for display
   */
  private formatCorrectAnswer(question: ExamQuestion): string[] {
    const correctOptions = question.options.filter(opt => opt.isCorrect);
    return correctOptions.map(opt => opt.text);
  }
}

export const examService = new ExamService();
