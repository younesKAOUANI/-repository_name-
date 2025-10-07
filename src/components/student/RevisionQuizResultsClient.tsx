'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Clock,
  Trophy,
  BookOpen,
  BarChart3
} from 'lucide-react';

interface QuizResults {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  questions: QuestionResult[];
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  explanationImg?: string;
}

export default function RevisionQuizResultsClient() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (attemptId) {
      loadQuizResults();
    }
  }, [attemptId]);

  const loadQuizResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/revision-quiz/results/${attemptId}`);
      
      if (!response.ok) {
        throw new Error('Résultats non trouvés');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
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
          <p className="text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-6">{error || 'Résultats non trouvés'}</p>
          <div className="space-x-4">
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button variant="secondary" onClick={loadQuizResults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
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
            onClick={() => router.push('/student/revision-quiz')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux quiz de révision
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Résultats du Quiz
          </h1>
          <p className="text-gray-600">{results.quizTitle}</p>
        </div>

        {/* Score Summary */}
        <div className={`bg-white rounded-lg border-2 p-6 mb-6 ${getScoreBgColor(results.percentage || 0)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Trophy className={`h-12 w-12 ${getScoreColor(results.percentage || 0)}`} />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {results.score} / {results.maxScore}
                </h2>
                <p className={`text-xl font-semibold ${getScoreColor(results.percentage || 0)}`}>
                  {(results.percentage || 0).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center text-gray-600 mb-2">
                <Clock className="h-4 w-4 mr-2" />
                <span>Temps: {formatDuration(results.timeSpent)}</span>
              </div>
              <p className="text-sm text-gray-500">
                Terminé le {new Date(results.completedAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {results.questions.filter(q => q.isCorrect).length}
            </p>
            <p className="text-sm text-gray-600">Bonnes réponses</p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {results.questions.filter(q => !q.isCorrect).length}
            </p>
            <p className="text-sm text-gray-600">Erreurs</p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center">
            <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {results.questions.length}
            </p>
            <p className="text-sm text-gray-600">Total questions</p>
          </div>
        </div>

        {/* Question Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Détail des questions ({results.questions.length})
            </h3>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {results.questions.map((question, index) => (
                <div
                  key={question.questionId}
                  className={`border rounded-lg p-4 ${
                    question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {question.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-1" />
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Question {index + 1}
                      </h4>
                      <p className="text-gray-700 mb-3">{question.questionText}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Votre réponse:</p>
                          <p className={`text-sm px-3 py-2 rounded bg-white border ${
                            question.isCorrect ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'
                          }`}>
                            {question.userAnswer || 'Aucune réponse'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Réponse correcte:</p>
                          <p className="text-sm text-green-700 px-3 py-2 rounded bg-white border border-green-200">
                            {question.correctAnswer}
                          </p>
                        </div>
                      </div>

                      {((question.explanation && question.explanation.trim()) || question.explanationImg) && (
                        <div className="border-t border-gray-200 pt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Explication:</p>
                          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                            {question.explanation && question.explanation.trim() && (
                              <div className="mb-3">
                                {question.explanation}
                              </div>
                            )}
                            {question.explanationImg && (
                              <div className="text-center">
                                <img
                                  src={question.explanationImg}
                                  alt="Explication visuelle"
                                  className="max-w-full h-auto rounded border shadow-sm mx-auto"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="primary"
            onClick={() => router.push('/student/revision-quiz/create')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Nouveau quiz
          </Button>

          <Button 
            variant="secondary"
            onClick={() => router.push('/student/revision-quiz')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Voir tous les quiz
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => router.push('/student/dashboard')}
          >
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}