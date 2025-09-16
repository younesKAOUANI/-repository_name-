import { QuizQuestion, QuizOption } from '../types';

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle quiz questions
 */
export function shuffleQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return shuffleArray(questions);
}

/**
 * Shuffle quiz options while maintaining correct answer tracking
 */
export function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  const shuffledOptions = shuffleArray(question.options);
  const correctOption = question.options[question.correctAnswerIndex];
  const newCorrectIndex = shuffledOptions.findIndex(opt => opt.id === correctOption.id);
  
  return {
    ...question,
    options: shuffledOptions,
    correctAnswerIndex: newCorrectIndex
  };
}

/**
 * Calculate quiz score
 */
export function calculateScore(totalQuestions: number, correctAnswers: number): number {
  return Math.round((correctAnswers / totalQuestions) * 100);
}

/**
 * Validate quiz answer
 */
export function validateAnswer(question: QuizQuestion, selectedOptionId: string): boolean {
  const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
  return selectedOption?.isCorrect || false;
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

/**
 * Check if quiz attempt is within time limit
 */
export function isWithinTimeLimit(startTime: Date, timeLimit: number): boolean {
  const now = new Date();
  const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
  return elapsedMinutes <= timeLimit;
}
