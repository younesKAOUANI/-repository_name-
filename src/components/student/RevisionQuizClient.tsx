'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Trophy, 
  Calendar, 
  Eye, 
  RefreshCw,
  BookOpen,
  ArrowLeft,
  BarChart3
} from 'lucide-react';

interface RevisionQuizAttempt {
  id: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  quiz: {
    title: string;
    questionsCount: number;
  };
}

interface APIRevisionQuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  quizDescription?: string;
  score: number;
  startedAt: string;
  finishedAt?: string;
  timeSpent: number;
  questionCount: number;
}

export default function RevisionQuizClient() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<RevisionQuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRevisionQuizAttempts();
  }, []);

  const loadRevisionQuizAttempts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/revision-quiz/history');
      
      if (!response.ok) {
        if (response.status === 404) {
          setAttempts([]);
          return;
        }
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Erreur lors du chargement des tentatives (${response.status})`);
      }
      
      const data: APIRevisionQuizAttempt[] = await response.json();
      console.log('Revision quiz history data:', data);
      // Transform the data to match the expected interface
      const transformedAttempts = (Array.isArray(data) ? data : []).map((attempt: APIRevisionQuizAttempt) => {
        const score = Number(attempt.score) || 0;
        const questionCount = Number(attempt.questionCount) || 0;
        const timeSpentMinutes = Number(attempt.timeSpent) || 0;
        
        return {
          id: attempt.id || '',
          score: score,
          maxScore: questionCount,
          percentage: questionCount > 0 ? (score / questionCount) * 100 : 0,
          timeSpent: timeSpentMinutes * 60, // Convert minutes to seconds
          completedAt: attempt.finishedAt || attempt.startedAt || new Date().toISOString(),
          quiz: {
            title: attempt.quizTitle || 'Quiz de révision',
            questionsCount: questionCount
          }
        };
      });
      setAttempts(transformedAttempts);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error loading revision quiz attempts:', err);
      if (err instanceof Error) {
        if (err.message.includes('quiz not found') || err.message.includes('404')) {
          setAttempts([]);
          setError('');
        } else if (err.message.includes('Failed to fetch')) {
          setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erreur inattendue lors du chargement des quiz de révision');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz de Révision
          </h1>
          <p className="text-gray-600">
            Créez et consultez vos quiz de révision personnalisés
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Button
            variant="primary"
            onClick={() => router.push('/student/revision-quiz/create')}
            className="flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Créer un nouveau quiz</span>
          </Button>

          <Button
            variant="secondary"
            onClick={loadRevisionQuizAttempts}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Statistics */}
        {attempts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 text-center">
              <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{attempts.length}</p>
              <p className="text-sm text-gray-600">Quiz réalisés</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)).toFixed(0) : 0}%
              </p>
              <p className="text-sm text-gray-600">Meilleur score</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {attempts.length > 0 ? 
                  formatDuration(Math.round(attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length)) : 
                  '0m'
                }
              </p>
              <p className="text-sm text-gray-600">Temps moyen</p>
            </div>
          </div>
        )}

        {/* Quiz Attempts List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Historique des quiz</h2>
          </div>

          <div className="p-6">
            {attempts.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune tentative de quiz
                </h3>
                <p className="text-gray-600 mb-6">
                  {error ? 
                    "Une erreur s'est produite lors du chargement de vos quiz de révision." :
                    "Vous n'avez pas encore réalisé de quiz de révision. Créez votre premier quiz personnalisé !"
                  }
                </p>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={() => router.push('/student/revision-quiz/create')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Créer mon premier quiz
                  </Button>
                  {error && (
                    <Button
                      variant="secondary"
                      onClick={loadRevisionQuizAttempts}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className={`p-4 border rounded-lg ${getScoreBgColor(attempt.percentage)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {attempt.quiz.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {attempt.quiz.questionsCount} questions
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(attempt.completedAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(attempt.timeSpent)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(attempt.percentage)}`}>
                          {attempt.percentage.toFixed(0)}%
                        </p>
                        <p className="text-sm text-gray-600">
                          {attempt.score} / {attempt.maxScore}
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-2"
                          onClick={() => router.push(`/student/revision-quiz/results/${attempt.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}