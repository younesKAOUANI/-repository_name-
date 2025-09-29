import { useState, useCallback } from 'react';
import { studentRevisionQuizService, RevisionQuizOptions, RevisionQuizSession } from '@/services/student-revision-quiz.service';

export interface UseRevisionQuizCreatorResult {
  createSession: (options: RevisionQuizOptions) => Promise<RevisionQuizSession>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useRevisionQuizCreator = (): UseRevisionQuizCreatorResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (options: RevisionQuizOptions): Promise<RevisionQuizSession> => {
    setLoading(true);
    setError(null);

    try {
      const session = await studentRevisionQuizService.createRevisionSession(options);
      return session;
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de la création de la session de révision';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createSession,
    loading,
    error,
    clearError
  };
};
