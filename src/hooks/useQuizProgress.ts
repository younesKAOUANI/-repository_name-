'use client';

import { useState, useEffect } from 'react';

interface QuizProgress {
  quizId: string;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  timeSpent: number; // in seconds
  startTime: Date;
  isCompleted: boolean;
}

/**
 * Custom hook for managing quiz progress
 */
export function useQuizProgress(quizId: string) {
  const [progress, setProgress] = useState<QuizProgress>({
    quizId,
    currentQuestionIndex: 0,
    answers: {},
    timeSpent: 0,
    startTime: new Date(),
    isCompleted: false,
  });

  const [timer, setTimer] = useState(0);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
      setProgress((prev) => ({
        ...prev,
        timeSpent: Math.floor((new Date().getTime() - prev.startTime.getTime()) / 1000),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save to localStorage on progress change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`quiz-progress-${quizId}`, JSON.stringify(progress));
    }
  }, [progress, quizId]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`quiz-progress-${quizId}`);
      if (saved) {
        const savedProgress = JSON.parse(saved);
        setProgress({
          ...savedProgress,
          startTime: new Date(savedProgress.startTime),
        });
      }
    }
  }, [quizId]);

  const goToQuestion = (index: number) => {
    setProgress((prev) => ({
      ...prev,
      currentQuestionIndex: index,
    }));
  };

  const nextQuestion = () => {
    setProgress((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
  };

  const previousQuestion = () => {
    setProgress((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
    }));
  };

  const saveAnswer = (questionId: string, answer: string) => {
    setProgress((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer,
      },
    }));
  };

  const completeQuiz = () => {
    setProgress((prev) => ({
      ...prev,
      isCompleted: true,
    }));
  };

  const resetQuiz = () => {
    const newProgress = {
      quizId,
      currentQuestionIndex: 0,
      answers: {},
      timeSpent: 0,
      startTime: new Date(),
      isCompleted: false,
    };
    setProgress(newProgress);
    setTimer(0);
    
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`quiz-progress-${quizId}`);
    }
  };

  const getAnswerForQuestion = (questionId: string): string | undefined => {
    return progress.answers[questionId];
  };

  const getCompletionPercentage = (totalQuestions: number): number => {
    const answeredQuestions = Object.keys(progress.answers).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  return {
    progress,
    timer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    saveAnswer,
    completeQuiz,
    resetQuiz,
    getAnswerForQuestion,
    getCompletionPercentage,
  };
}
