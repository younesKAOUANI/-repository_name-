/**
 * Student Quiz Hook
 * Manages quiz state and functionality for students
 */

import { useState, useCallback } from 'react';
import { 
  studentQuizService, 
  ModuleWithQuizzes,
  QuizFilters 
} from '@/services/student-quiz.service';
import { studentExamService, ExamHistory } from '@/services/student-exam.service';

interface UseStudentQuizState {
  modules: ModuleWithQuizzes[];
  loading: boolean;
  error: string | null;
  filters: QuizFilters;
  history: ExamHistory[];
}

interface UseStudentQuizActions {
  loadQuizzes: () => Promise<void>;
  loadHistory: () => Promise<void>;
  updateFilters: (newFilters: Partial<QuizFilters>) => void;
  resetFilters: () => void;
  clearError: () => void;
  startQuiz: (quizId: string) => Promise<void>;
}

interface UseStudentQuizReturn extends UseStudentQuizState, UseStudentQuizActions {}

const initialFilters: QuizFilters = {
  studyYearId: undefined,
};

export function useStudentQuiz(): UseStudentQuizReturn {
  const [state, setState] = useState<UseStudentQuizState>({
    modules: [],
    loading: false,
    error: null,
    filters: initialFilters,
    history: [],
  });

  // Load quizzes organized by modules
  const loadQuizzes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const modules = await studentQuizService.getQuizzes(state.filters);
      setState(prev => ({
        ...prev,
        modules,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Échec du chargement des quiz'
      }));
    }
  }, [state.filters]);

  // Load quiz history (attempts of type QUIZ)
  const loadHistory = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const history = await studentExamService.getExamHistory({
        studyYearId: state.filters.studyYearId,
        type: 'QUIZ',
      });
      setState(prev => ({
        ...prev,
        history,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading quiz history:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Échec du chargement de l\'historique des quiz'
      }));
    }
  }, [state.filters.studyYearId]);

  // Start a quiz
  const startQuiz = useCallback(async (quizId: string) => {
    try {
      await studentQuizService.startQuiz(quizId);
      // Navigation will be handled by the component
    } catch (error) {
      console.error('Error starting quiz:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Échec du démarrage du quiz'
      }));
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<QuizFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: initialFilters,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadQuizzes,
    loadHistory,
    updateFilters,
    resetFilters,
    clearError,
    startQuiz,
  };
}
