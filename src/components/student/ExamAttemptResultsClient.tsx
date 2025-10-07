"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: string;
  userAnswer: string[];
  correctAnswer: string[];
  isCorrect: boolean;
  explanation?: string;
  explanationImg?: string;
  score: number;
  maxScore: number;
}

interface ExamAttemptResult {
  id: string;
  examId: string;
  title: string;
  description?: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number;
  startedAt: string;
  completedAt: string;
  questionResults: QuestionResult[];
}

export default function ExamAttemptResultsClient() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<ExamAttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [showQuestionDetails, setShowQuestionDetails] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (attemptId) {
      loadAttemptResult();
    }
  }, [attemptId]);

  const loadAttemptResult = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/exams/attempts/${attemptId}/results`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Résultats de tentative non trouvés");
        }
        throw new Error("Erreur lors du chargement des résultats");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBgColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-50 border-green-200";
    if (percentage >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getStatusIcon = () => {
    if (!result) return <AlertCircle className="h-6 w-6 text-gray-500" />;
    return result.percentage >= 50 ? (
      <CheckCircle className="h-6 w-6 text-green-500" />
    ) : (
      <XCircle className="h-6 w-6 text-red-500" />
    );
  };

  const isPassed = result ? result.percentage >= 50 : false;

  const toggleQuestionDetails = (questionId: string) => {
    setShowQuestionDetails(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
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

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center container mx-auto">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Impossible de charger les résultats de cette tentative."}
          </p>
          <div className="space-x-4">
            <Button variant="primary" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button variant="secondary" onClick={loadAttemptResult}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Résultats de tentative
              </h1>
              <p className="text-xl text-gray-600">{result.title}</p>
            </div>
            {getStatusIcon()}
          </div>
        </div>

        {/* Main Score Card */}
        <div className={`bg-white rounded-lg border-2 p-6 mb-6 ${getPerformanceBgColor(result.percentage)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Award className={`h-12 w-12 ${getPerformanceColor(result.percentage)}`} />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {result.score} / {result.maxScore}
                </h2>
                <p className={`text-xl font-semibold ${getPerformanceColor(result.percentage)}`}>
                  {result.percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center text-gray-600 mb-2">
                <Clock className="h-4 w-4 mr-2" />
                <span>Temps: {result.timeSpent} minutes</span>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {new Date(result.completedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Terminé
              </div>
            </div>
          </div>

          {/* Pass/Fail Status */}
          <div className={`p-4 rounded-lg ${
            isPassed 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {isPassed ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {isPassed 
                  ? `Félicitations ! Vous avez réussi l'examen (50% requis)`
                  : `Échec - 50% requis pour réussir`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {result.questionResults.filter(q => q.isCorrect).length}
            </p>
            <p className="text-sm text-gray-600">Bonnes réponses</p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {result.questionResults.filter(q => !q.isCorrect).length}
            </p>
            <p className="text-sm text-gray-600">Réponses incorrectes</p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {result.questionResults.length}
            </p>
            <p className="text-sm text-gray-600">Total questions</p>
          </div>
        </div>

        {/* Questions Review */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Révision des questions
            </h3>
            <Button
              variant="secondary"
              onClick={() => setShowAllDetails(!showAllDetails)}
            >
              {showAllDetails ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Masquer tout
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Afficher tout
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {result.questionResults.map((question, index) => {
              const showDetails = showAllDetails || showQuestionDetails[question.questionId];
              
              return (
                <div
                  key={question.questionId}
                  className={`border rounded-lg p-4 transition-all ${
                    question.isCorrect
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      {question.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-1" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            Question {index + 1}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleQuestionDetails(question.questionId)}
                          >
                            {showDetails ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-gray-700 mt-1">{question.questionText}</p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        question.isCorrect
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {question.score} / {question.maxScore} pts
                    </span>
                  </div>

                  {showDetails && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Votre réponse:
                          </p>
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                            {question.userAnswer.length > 0
                              ? question.userAnswer.join(', ')
                              : 'Aucune réponse'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Réponse correcte:
                          </p>
                          <p className="text-sm text-green-600 bg-white p-2 rounded border">
                            {question.correctAnswer.join(', ')}
                          </p>
                        </div>
                      </div>

                      {((question.explanation && question.explanation.trim()) || question.explanationImg) && (
                        <div className="border-t border-gray-200 pt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Explication:
                          </p>
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
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            onClick={() => router.push('/student/dashboard')}
          >
            Retour au tableau de bord
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => router.push(`/student/assessments/${result.examId}`)}
          >
            Refaire l'examen
          </Button>

          <Button
            variant="secondary"
            onClick={() => router.push('/student/exams')}
          >
            Autres examens
          </Button>
        </div>
      </div>
    </div>
  );
}