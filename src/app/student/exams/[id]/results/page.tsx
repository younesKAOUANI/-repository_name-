'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Trophy
} from 'lucide-react';

interface QuestionResult {
  questionId: number;
  questionText: string;
  questionType: string;
  userAnswer: string[];
  correctAnswer: string[];
  isCorrect: boolean;
  partialScore: number;
  maxScore: number;
  explanation?: string;
}

interface ExamResult {
  id: number;
  examId: number;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  timeSpent: number;
  attemptNumber: number;
  questionResults: QuestionResult[];
}

interface Props {
  params: { id: string };
}

export default function ExamResultsPage({ params }: Props) {
  const router = useRouter();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student/exams/${params.id}/results`);
        
        if (!response.ok) {
          throw new Error('Échec de la récupération des résultats');
        }
        
        const data = await response.json();
        setResults(data);
        if (data.length > 0) {
          setSelectedResult(data[0]); // Show most recent attempt by default
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [params.id]);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="h-8 w-8 text-green-600" />;
    if (percentage >= 50) return <AlertCircle className="h-8 w-8 text-yellow-600" />;
    return <XCircle className="h-8 w-8 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Award className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement des résultats
          </h2>
          <p className="text-gray-600">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Retour</Button>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun résultat trouvé
          </h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas encore terminé cet examen.
          </p>
          <Button onClick={() => router.back()}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Résultats - {selectedResult?.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Attempts selector */}
        {results.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vos tentatives ({results.length})
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => setSelectedResult(result)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedResult?.id === result.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      Tentative #{result.attemptNumber}
                    </span>
                    <span className={`text-sm font-semibold ${getScoreColor(result.percentage)}`}>
                      {result.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(result.completedAt).toLocaleString('fr-FR')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedResult && (
          <>
            {/* Results overview */}
            <div className={`rounded-lg border p-8 mb-8 ${getScoreBg(selectedResult.percentage)}`}>
              <div className="text-center">
                <div className="mb-4">
                  {getStatusIcon(selectedResult.percentage)}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedResult.percentage >= 80 ? 'Excellent !' : 
                   selectedResult.percentage >= 50 ? 'Passable' : 'Échec'}
                </h2>
                
                {/* Main Score Display */}
                <div className="mb-6">
                  <div className={`text-5xl font-bold ${getScoreColor(selectedResult.percentage)} mb-2`}>
                    {selectedResult.percentage.toFixed(0)}%
                  </div>
                  <div className="text-xl font-semibold text-gray-700 mb-2">
                    {selectedResult.score} / {selectedResult.maxScore} points
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Terminé le: {new Date(selectedResult.completedAt).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Temps écoulé: {selectedResult.timeSpent} min</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>Tentative #{selectedResult.attemptNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Résultats détaillés par question
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {selectedResult.questionResults.map((result, index) => (
                    <div
                      key={result.questionId}
                      className={`p-4 rounded-lg border-2 ${
                        result.isCorrect 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {result.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-medium text-gray-900">
                            Question {index + 1}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded ${
                            result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result.partialScore}/{result.maxScore} point{result.maxScore > 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">
                          {result.questionType}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-900 font-medium mb-2">
                          {result.questionText}
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Votre réponse:
                          </p>
                          <div className="text-sm text-gray-600">
                            {result.userAnswer.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {result.userAnswer.map((answer, idx) => (
                                  <li key={idx}>{answer}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="italic">Pas de réponse</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Réponse(s) correcte(s):
                          </p>
                          <div className="text-sm text-green-600">
                            <ul className="list-disc list-inside">
                              {result.correctAnswer.map((answer, idx) => (
                                <li key={idx}>{answer}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      {result.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Explication:
                          </p>
                          <p className="text-sm text-blue-800">
                            {result.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
