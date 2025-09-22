/**
 * Student Exam Interface
 * Main interface for students to   const handleStartExam = async (examId: number) => {
    try {
      // Navigate to the exam session page
      router.push(`/student/exams/${examId}`);
    } catch (error) {
      console.error('Failed to start exam:', error);
    }
  };ams and view results
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Play, 
  History, 
  Filter, 
  BookOpen, 
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useStudentExam } from '@/hooks/useStudentExam';
import { StudentExam, ExamHistory } from '@/services/student-exam.service';
import ExamSessionView from '@/components/ExamSessionView';
import ExamResultView from '@/components/ExamResultView';

export default function StudentExamInterface() {
  const router = useRouter();
  const {
    availableExams,
    examHistory,
    currentResult,
    loading,
    error,
    loadAvailableExams,
    loadExamHistory,
    updateFilters,
    resetFilters,
    clearError,
    resetSession,
  } = useStudentExam();

  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [selectedStudyYear, setSelectedStudyYear] = useState<number | undefined>();

  // Load data on component mount
  useEffect(() => {
    loadAvailableExams();
  }, [loadAvailableExams]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadExamHistory();
    }
  }, [activeTab, loadExamHistory]);

  // If there's a result to show, show the result view
  if (currentResult) {
    return <ExamResultView onBack={resetSession} />;
  }

    const handleStartExam = async (examId: number) => {
    try {
      // Navigate to the exam session page
      router.push(`/student/exams/${examId}`);
    } catch (error) {
      console.error('Failed to start exam:', error);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Pas de limite';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  const getExamStatusBadge = (exam: StudentExam) => {
    if (!exam.isCompleted) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          Disponible
        </span>
      );
    }

    const percentage = exam.percentage || 0;
    if (percentage >= 80) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Réussi ({percentage.toFixed(1)}%)
        </span>
      );
    } else if (percentage >= 50) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Passable ({percentage.toFixed(1)}%)
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Échec ({percentage.toFixed(1)}%)
        </span>
      );
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-sm">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="mt-2 text-red-600 hover:text-red-700"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab('available')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'available'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Play className="h-4 w-4" />
                  Examens Disponibles
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === 'available' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {availableExams.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <History className="h-4 w-4" />
                  Historique
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === 'history' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {examHistory.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Filter className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année d'étude
              </label>
              <select
                value={selectedStudyYear || ''}
                onChange={(e) => {
                  const yearId = e.target.value ? parseInt(e.target.value) : undefined;
                  setSelectedStudyYear(yearId);
                  updateFilters({ studyYearId: yearId });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les années</option>
                <option value="1">1ère Année</option>
                <option value="2">2ème Année</option>
                <option value="3">3ème Année</option>
                <option value="4">4ème Année</option>
                <option value="5">5ème Année</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  resetFilters();
                  setSelectedStudyYear(undefined);
                }}
                className="flex items-center gap-2 px-6 py-3"
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'available' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Examens Disponibles
                  </h2>
                  <p className="text-sm text-gray-600">
                    Cliquez sur un examen pour commencer
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={loadAvailableExams}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="p-4 bg-blue-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement des examens</h3>
                <p className="text-gray-600">Veuillez patienter...</p>
              </div>
            ) : availableExams.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Aucun examen disponible
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Il n'y a actuellement aucun examen disponible pour votre année d'étude. 
                  Vérifiez plus tard ou contactez votre enseignant.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {availableExams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onStart={() => handleStartExam(exam.id)}
                    loading={loading}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <History className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Historique des Examens
                  </h2>
                  <p className="text-sm text-gray-600">
                    Consultez vos examens passés et résultats
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={loadExamHistory}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="p-4 bg-green-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <RefreshCw className="h-10 w-10 animate-spin text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement de l'historique</h3>
                <p className="text-gray-600">Veuillez patienter...</p>
              </div>
            ) : examHistory.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <History className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Aucun examen passé
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Vous n'avez encore passé aucun examen. Commencez par passer votre premier examen 
                  dans l'onglet "Examens Disponibles".
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examHistory.map((exam) => (
                  <ExamHistoryCard
                    key={exam.attemptId}
                    exam={exam}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Exam Card Component
interface ExamCardProps {
  exam: StudentExam;
  onStart: () => void;
  loading: boolean;
}

function ExamCard({ exam, onStart, loading }: ExamCardProps) {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Pas de limite';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  const getStatusBadge = () => {
    if (!exam.isCompleted) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          Nouveau
        </span>
      );
    }

    const percentage = exam.percentage || 0;
    if (percentage >= 80) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Réussi ({percentage.toFixed(1)}%)
        </span>
      );
    } else if (percentage >= 50) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Passable ({percentage.toFixed(1)}%)
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Échec ({percentage.toFixed(1)}%)
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200 group">
      <div className="p-6">
        {/* Header with title and status */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-900 transition-colors">
            {exam.title}
          </h3>
          {getStatusBadge()}
        </div>

        {/* Description */}
        {exam.description && (
          <p className="text-gray-600 text-sm mb-6 line-clamp-3">
            {exam.description}
          </p>
        )}

        {/* Module Badge */}
        {exam.module && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <BookOpen className="h-3 w-3 mr-1" />
              {exam.module.name}
            </span>
          </div>
        )}

        {/* Exam Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Questions</div>
            <div className="text-lg font-semibold text-gray-900">{exam.questionsCount}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Durée</div>
            <div className="text-lg font-semibold text-gray-900">
              {exam.timeLimit ? formatDuration(exam.timeLimit) : 'Libre'}
            </div>
          </div>
        </div>

        {/* Show previous attempt info if completed */}
        {exam.isCompleted && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="text-sm font-medium text-blue-900 mb-2">Dernière tentative</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Score: <span className="font-semibold">{exam.score}/{exam.maxScore}</span>
              </span>
              <span className="text-xs text-blue-600">
                {exam.completedAt ? new Date(exam.completedAt).toLocaleDateString('fr-FR') : ''}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={onStart}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 font-medium transition-all duration-200 ${
            exam.isCompleted 
              ? 'bg-orange-600 hover:bg-orange-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <Play className="h-4 w-4" />
          {exam.isCompleted ? 'Repasser l\'examen' : 'Commencer l\'examen'}
        </Button>
      </div>
    </div>
  );
}

// Exam History Card Component
interface ExamHistoryCardProps {
  exam: ExamHistory;
}

function ExamHistoryCard({ exam }: ExamHistoryCardProps) {
  const getExamStatusBadge = (exam: ExamHistory) => {
    const percentage = exam.percentage || 0;
    if (percentage >= 80) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Réussi
        </span>
      );
    } else if (percentage >= 50) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Passable
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Échec
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
            {exam.title}
          </h3>
          {getExamStatusBadge(exam)}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Meilleur score:</span>
            <span className="font-medium">
              {exam.score}/{exam.maxScore} ({exam.percentage?.toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Dernier essai:</span>
            <span className="text-gray-900">
              {exam.completedAt ? new Date(exam.completedAt).toLocaleDateString('fr-FR') : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Temps passé:</span>
            <span className="text-gray-900">
              {exam.completedAt && exam.startedAt ? 
                `${Math.round((new Date(exam.completedAt).getTime() - new Date(exam.startedAt).getTime()) / 60000)} min` : 
                '-'}
            </span>
          </div>
          {exam.module && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Module:</span>
              <span className="text-gray-900">{exam.module.name}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full ${
              (exam.percentage || 0) >= 80 ? 'bg-green-500' :
              (exam.percentage || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(exam.percentage || 0, 100)}%` }}
          />
        </div>

        <Button
          variant="secondary"
          className="w-full flex items-center gap-2"
          onClick={() => {
            // Navigate to detailed results view for this specific attempt
            window.location.href = `/student/exams/attempts/${exam.attemptId}/results`;
          }}
        >
          <Eye className="h-4 w-4" />
          Voir les détails
        </Button>
      </div>
    </div>
  );
}
