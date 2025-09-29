/**
 * Student Exam Hook
 * Manages exam state and functionality for students
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  studentExamService, 
  StudentExam, 
  ExamHistory,
  ExamSession, 
  ExamAnswer, 
  ExamResult, 
  ExamFilters 
} from '@/services/student-exam.service';

interface UseStudentExamState {
  // Available exams
  availableExams: StudentExam[];
  examHistory: ExamHistory[];
  
  // Current exam session
  currentSession: ExamSession | null;
  currentExam: StudentExam | null;
  currentExamId: string | null;
  currentAnswers: ExamAnswer[];
  timeRemaining: number; // in seconds
  
  // Results
  currentResult: ExamResult | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  isSubmitting: boolean;
  timerStarted: boolean;
  
  // Filters
  filters: ExamFilters;
}

interface UseStudentExamActions {
  // Data loading
  loadAvailableExams: () => Promise<void>;
  loadExamHistory: () => Promise<void>;
  
  // Exam session management
  startExam: (examId: string) => Promise<void>;
  startTimer: () => void;
  submitExam: () => Promise<void>;
  
  // Answer management
  updateAnswer: (questionId: string, selectedOptions: string[], textAnswer?: string) => void;
  clearAnswer: (questionId: string) => void;
  
  // Results
    loadExamResult: (examId: string) => Promise<void>;
  
  // Filters
  updateFilters: (newFilters: Partial<ExamFilters>) => void;
  resetFilters: () => void;
  
  // Utility
  clearError: () => void;
  resetSession: () => void;
}

interface UseStudentExamReturn extends UseStudentExamState, UseStudentExamActions {}

const initialFilters: ExamFilters = {
  moduleId: undefined,
  lessonId: undefined,
  isCompleted: undefined,
  studyYearId: undefined,
};

export function useStudentExam(): UseStudentExamReturn {
  const [state, setState] = useState<UseStudentExamState>({
    availableExams: [],
    examHistory: [],
    currentSession: null,
    currentExam: null,
    currentExamId: null,
    currentAnswers: [],
    timeRemaining: 0,
    currentResult: null,
    loading: false,
    error: null,
    isSubmitting: false,
    timerStarted: false,
    filters: initialFilters,
  });

  // Timer for exam countdown - only starts when manually triggered
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.currentSession && state.timeRemaining > 0 && state.timerStarted) {
      interval = setInterval(() => {
        setState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          // Auto-submit when time is up
          if (newTimeRemaining <= 0 && prev.currentSession && prev.currentExamId) {
            setTimeout(() => {
              submitExam();
            }, 100);
          }
          
          return {
            ...prev,
            timeRemaining: Math.max(0, newTimeRemaining)
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.currentSession, state.timeRemaining, state.timerStarted]);

  // Load available exams (all exams, including completed ones for retaking)
  const loadAvailableExams = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const exams = await studentExamService.getExams(state.filters);
      console.log('Fetched exams:', exams);
      setState(prev => ({
        ...prev,
        availableExams: exams,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading available exams:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Échec du chargement des examens'
      }));
    }
  }, [state.filters]);

  // Load exam history (from quiz attempts table)
  const loadExamHistory = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const examHistory = await studentExamService.getExamHistory(state.filters);
      setState(prev => ({
        ...prev,
        examHistory: examHistory,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading exam history:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Échec du chargement de l\'historique des examens'
      }));
    }
  }, [state.filters]);

  // Start an exam
  const startExam = useCallback(async (examId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Find the exam in available exams
      const exam = state.availableExams.find(e => e.id === examId);
      const session = await studentExamService.startExam(examId);
      
      // Calculate time remaining
      const timeLimit = session.timeLimit || 0; // in minutes
      const timeRemaining = timeLimit * 60; // convert to seconds
      
      setState(prev => ({
        ...prev,
        currentSession: session,
        currentExam: exam || null,
        currentExamId: examId,
        currentAnswers: [],
        timeRemaining,
        timerStarted: false, // Don't start timer automatically
        loading: false,
      }));
    } catch (error) {
      console.error('Error starting exam:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Échec du démarrage de l\'examen'
      }));
    }
  }, [state.availableExams]);

  // Start the exam timer manually
  const startTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      timerStarted: true,
    }));
  }, []);

  // Submit exam  
  const submitExam = useCallback(async () => {
    if (!state.currentSession || !state.currentExamId) return;

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const result = await studentExamService.submitExam(
        state.currentExamId,
        state.currentSession.attemptId,
        state.currentAnswers
      );
      
      setState(prev => ({
        ...prev,
        currentResult: result,
        currentSession: null,
        currentExam: null,
        currentExamId: null,
        currentAnswers: [],
        timeRemaining: 0,
        timerStarted: false,
        isSubmitting: false,
      }));
    } catch (error) {
      console.error('Error submitting exam:', error);
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Échec de la soumission de l\'examen'
      }));
    }
  }, [state.currentSession, state.currentExamId, state.currentAnswers]);

  // Update answer
  const updateAnswer = useCallback((questionId: string, selectedOptions: string[], textAnswer?: string) => {
    setState(prev => {
      const existingAnswerIndex = prev.currentAnswers.findIndex(a => a.questionId === questionId);
      const newAnswer: ExamAnswer = {
        questionId,
        selectedOptionIds: selectedOptions,
        textAnswer,
      };

      const newAnswers = [...prev.currentAnswers];
      if (existingAnswerIndex >= 0) {
        newAnswers[existingAnswerIndex] = newAnswer;
      } else {
        newAnswers.push(newAnswer);
      }

      return {
        ...prev,
        currentAnswers: newAnswers,
      };
    });
  }, []);

  // Clear answer
  const clearAnswer = useCallback((questionId: string) => {
    setState(prev => ({
      ...prev,
      currentAnswers: prev.currentAnswers.filter(a => a.questionId !== questionId),
    }));
  }, []);

  // Load exam result
  const loadExamResult = useCallback(async (examId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const results = await studentExamService.getExamResults(examId);
      // getExamResults returns an array, we take the first result (most recent)
      const result = results[0];
      setState(prev => ({
        ...prev,
        currentResult: result || null,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading exam result:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Échec du chargement du résultat de l\'examen'
      }));
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ExamFilters>) => {
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

  // Reset session
  const resetSession = useCallback(() => {
    setState(prev => ({
        ...prev,
        currentSession: null,
        currentExam: null,
        currentExamId: null,
        currentAnswers: [],
        timeRemaining: 0,
        timerStarted: false,
        currentResult: null,
      }));
  }, []);

  return {
    ...state,
    loadAvailableExams,
    loadExamHistory,
    startExam,
    startTimer,
    submitExam,
    updateAnswer,
    clearAnswer,
    loadExamResult,
    updateFilters,
    resetFilters,
    clearError,
    resetSession,
  };
}
