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
  questionId: number;
  questionText: string;
  questionType: string;
  userAnswer: string[];
  correctAnswer: string[];
  isCorrect: boolean;
  score: number;
  maxScore: number;
  explanation?: string;
}

interface AttemptResult {
  id: number;
  examId: number;
  title: string;
  description?: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  startedAt: string;
  timeSpent: number;
  questionResults: QuestionResult[];
  studyYear?: {
    id: number;
    name: string;
  };
  module?: {
    id: number;
    name: string;
  };
  lesson?: {
    id: number;
    title: string;
  };
}

export default function AttemptResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const attemptId = params.attemptId as string;

  useEffect(() => {
    if (attemptId) {
      fetchAttemptResults();
    }
  }, [attemptId]);

  const fetchAttemptResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/student/exams/attempts/${attemptId}/results`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attempt results");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching attempt results:", error);
      setError("Échec du chargement des résultats de la tentative");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (percentage: number) => {
    if (percentage >= 80) return "bg-green-50 border-green-200";
    if (percentage >= 50) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80)
      return <CheckCircle className="h-8 w-8 text-green-600" />;
    if (percentage >= 50)
      return <AlertCircle className="h-8 w-8 text-yellow-600" />;
    return <XCircle className="h-8 w-8 text-red-600" />;
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 50) return "Passable";
    return "Insuffisant";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="p-4 bg-blue-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chargement des résultats
            </h3>
            <p className="text-gray-600">Veuillez patienter...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="p-4 bg-red-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-6">
              {error ||
                "Impossible de charger les résultats de cette tentative"}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="secondary"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <Button
                onClick={fetchAttemptResults}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Résultats de la tentative
                  </h1>
                  <p className="text-sm text-gray-600">{result.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Summary */}
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          <div
            className={`rounded-xl border-2 p-8 mb-8 ${getScoreBg(
              result.percentage
            )}`}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {getScoreIcon(result.percentage)}
              </div>
              <h2
                className={`text-3xl font-bold mb-2 ${getScoreColor(
                  result.percentage
                )}`}
              >
                {result.score} / {result.maxScore} points
              </h2>
              <p
                className={`text-xl font-semibold mb-4 ${getScoreColor(
                  result.percentage
                )}`}
              >
                {result.percentage.toFixed(1)}% -{" "}
                {getScoreLabel(result.percentage)}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    Temps passé
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {result.timeSpent} min
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    Bonnes réponses
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {result.questionResults.filter((q) => q.isCorrect).length}
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    Complété le
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {new Date(result.completedAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Exam Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations sur l'examen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.module && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">
                    Module:
                  </span>
                  <span className="text-sm text-gray-900">
                    {result.module.name}
                  </span>
                </div>
              )}
              {result.lesson && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">
                    Leçon:
                  </span>
                  <span className="text-sm text-gray-900">
                    {result.lesson.title}
                  </span>
                </div>
              )}
              {result.studyYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">
                    Année d'étude:
                  </span>
                  <span className="text-sm text-gray-900">
                    {result.studyYear.name}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  Durée:
                </span>
                <span className="text-sm text-gray-900">
                  {result.timeSpent} minutes
                </span>
              </div>
            </div>
            {result.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">{result.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Question Details Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Détail des questions ({result.questionResults.length})
            </h3>
            <Button
              variant="secondary"
              onClick={() => setShowAnswers(!showAnswers)}
              className="flex items-center gap-2"
            >
              {showAnswers ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showAnswers ? "Masquer les réponses" : "Afficher les réponses"}
            </Button>
          </div>

          {showAnswers && (
            <div className="space-y-6">
              {result.questionResults.map((question, index) => (
                <div
                  key={question.questionId}
                  className={`border-2 rounded-lg p-6 ${
                    question.isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {question.isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          Question {index + 1}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            question.isCorrect
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {question.score.toFixed(1)}/{question.maxScore} pts
                        </span>
                      </div>

                      <h4 className="text-base font-medium text-gray-900 mb-4">
                        {question.questionText}
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Votre réponse:
                          </span>
                          <p className="text-sm text-gray-900 mt-1">
                            {question.userAnswer.length > 0
                              ? question.userAnswer.join(", ")
                              : "Aucune réponse"}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Bonne(s) réponse(s):
                          </span>
                          <p className="text-sm text-green-700 mt-1 font-medium">
                            {question.correctAnswer.join(", ")}
                          </p>
                        </div>

                        {question.explanation && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="text-sm font-medium text-blue-900">
                              Explication:
                            </span>
                            <p className="text-sm text-blue-800 mt-1">
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
