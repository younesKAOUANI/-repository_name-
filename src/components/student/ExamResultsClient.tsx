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
  userAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
  explanation?: string;
  points: number;
  maxPoints: number;
}

interface ExamResult {
  id: number;
  studentId: string;
  examId: number;
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken: number;
  timeLimit: number;
  completedAt: string;
  questions: QuestionResult[];
  exam: {
    title: string;
    description: string;
  };
}

export default function ExamResultsClient() {
  const router = useRouter();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Get examId from URL (this would need to be passed as props in real implementation)
  const examId = typeof window !== 'undefined' ? window.location.pathname.split('/')[3] : '';

  useEffect(() => {
    if (examId) {
      loadExamResult();
    }
  }, [examId]);

  const loadExamResult = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/exams/${examId}/results`);
      if (!response.ok) {
        throw new Error('Impossible de charger les résultats');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-100 border-green-200';
    if (percentage >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-6">{error || 'Résultats non trouvés'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux examens
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Résultats de l'examen
          </h1>
          <p className="text-gray-600">{result.exam.title}</p>
        </div>

        {/* Score Card */}
        <div className={`bg-white rounded-lg border-2 p-6 mb-6 ${getScoreBgColor(result.percentage)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Trophy className={`h-12 w-12 ${getScoreColor(result.percentage)}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {result.score} / {result.maxScore}
                </h2>
                <p className={`text-lg font-semibold ${getScoreColor(result.percentage)}`}>
                  {result.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center text-gray-600 mb-1">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">Temps utilisé: {formatTime(result.timeTaken)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {new Date(result.completedAt).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Message */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
          {result.percentage >= 80 ? (
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">Excellent travail !</p>
                <p className="text-green-700">
                  Vous avez obtenu un excellent score. Continuez sur cette lancée !
                </p>
              </div>
            </div>
          ) : result.percentage >= 60 ? (
            <div className="flex items-start space-x-3">
              <Award className="h-6 w-6 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Bon résultat</p>
                <p className="text-yellow-700">
                  Vous avez réussi l'examen. Quelques révisions pourraient vous aider à améliorer votre score.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3">
              <XCircle className="h-6 w-6 text-red-500 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">À améliorer</p>
                <p className="text-red-700">
                  Ce score indique qu'il serait bénéfique de revoir les concepts abordés dans cet examen.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {result.questions.filter(q => q.isCorrect).length}
            </p>
            <p className="text-sm text-gray-600">Bonnes réponses</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {result.questions.filter(q => !q.isCorrect).length}
            </p>
            <p className="text-sm text-gray-600">Erreurs</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {Math.round((result.timeTaken / result.questions.length) / 60 * 10) / 10}
            </p>
            <p className="text-sm text-gray-600">Minutes par question</p>
          </div>
        </div>

        {/* Detailed Results Toggle */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Détail des questions ({result.questions.length})
            </h3>
            <Button
              variant="secondary"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDetails ? 'Masquer' : 'Voir'} les détails
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-4">
              {result.questions.map((question, index) => (
                <div
                  key={question.questionId}
                  className={`border rounded-lg p-4 ${
                    question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {question.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Question {index + 1}
                        </h4>
                        <p className="text-gray-700 mb-3">{question.questionText}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      question.isCorrect 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {question.points} / {question.maxPoints} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Votre réponse :</p>
                      <div className="text-sm text-gray-600">
                        {question.userAnswers.join(', ') || 'Aucune réponse'}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Réponse correcte :</p>
                      <div className="text-sm text-green-600">
                        {question.correctAnswers.join(', ')}
                      </div>
                    </div>
                  </div>

                  {question.explanation && (
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Explication :</p>
                      <p className="text-sm text-gray-600">{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="primary"
            onClick={() => router.push('/student/dashboard')}
          >
            Retour au tableau de bord
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => router.push('/student/exams')}
          >
            Voir d'autres examens
          </Button>
        </div>
      </div>
    </div>
  );
}