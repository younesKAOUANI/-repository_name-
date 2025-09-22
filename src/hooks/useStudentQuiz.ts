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

interface UseStudentQuizState {
  modules: ModuleWithQuizzes[];
  loading: boolean;
  error: string | null;
  filters: QuizFilters;
}

interface UseStudentQuizActions {
  loadQuizzes: () => Promise<void>;
  updateFilters: (newFilters: Partial<QuizFilters>) => void;
  resetFilters: () => void;
  clearError: () => void;
  startQuiz: (quizId: number) => Promise<void>;
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

  // Start a quiz
  const startQuiz = useCallback(async (quizId: number) => {
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
    updateFilters,
    resetFilters,
    clearError,
    startQuiz,
  };
}
