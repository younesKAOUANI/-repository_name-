'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Clock, 
  BookOpen, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Award,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  History
} from 'lucide-react';
import { useStudentQuiz } from '@/hooks/useStudentQuiz';
import { ModuleWithQuizzes, LessonWithQuizzes, QuizItem } from '@/services/student-quiz.service';

export default function StudentQuizInterface() {
  const router = useRouter();
  const {
    modules,
    loading,
    error,
    loadQuizzes,
    loadHistory,
    updateFilters,
    resetFilters,
    clearError,
    history,
  } = useStudentQuiz();

  const [selectedStudyYear, setSelectedStudyYear] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  // Load data on component mount
  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  // Load history when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  const handleStartQuiz = async (quizId: string) => {
    try {
      // Navigate to the unified assessment session page
      router.push(`/student/assessments/${quizId}`);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Pas de limite';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  const getQuizStatusBadge = (quiz: QuizItem) => {
    if (!quiz.isCompleted) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          Nouveau
        </span>
      );
    }

    const percentage = quiz.percentage || 0;
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

  // Calculate stats
  const totalQuizzes = modules.reduce((total, module) => 
    total + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.quizzes.length, 0), 0
  );
  
  const completedQuizzes = modules.reduce((total, module) => 
    total + module.lessons.reduce((lessonTotal, lesson) => 
      lessonTotal + lesson.quizzes.filter(quiz => quiz.isCompleted).length, 0
    ), 0
  );

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quiz de Cours
                </h1>
                <p className="text-sm text-gray-600">
                  Testez vos connaissances après chaque cours
                </p>
              </div>
            </div>
            
            {/* Stats Cards in Header */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <div className="text-sm font-medium text-blue-900">Total Quiz</div>
                <div className="text-xl font-bold text-blue-700">{totalQuizzes}</div>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <div className="text-sm font-medium text-green-900">Complétés</div>
                <div className="text-xl font-bold text-green-700">{completedQuizzes}</div>
              </div>
              <div className="bg-orange-50 px-4 py-2 rounded-lg">
                <div className="text-sm font-medium text-orange-900">Progression</div>
                <div className="text-xl font-bold text-orange-700">
                  {totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('available')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'available'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Quiz Disponibles ({totalQuizzes})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <History className="h-4 w-4" />
                  Historique ({completedQuizzes})
                </div>
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année d'étude
                </label>
                <select
                  value={selectedStudyYear || ''}
                  onChange={(e) => {
                    const yearId = e.target.value || undefined;
                    setSelectedStudyYear(yearId);
                    updateFilters({ studyYearId: yearId });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Toutes les années</option>
                  {/* TODO: replace hardcoded options with real study years if available */}
                  <option value="year-1">1ère Année</option>
                  <option value="year-2">2ème Année</option>
                  <option value="year-3">3ème Année</option>
                  <option value="year-4">4ème Année</option>
                  <option value="year-5">5ème Année</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetFilters();
                    setSelectedStudyYear(undefined);
                  }}
                  className="flex items-center gap-2 px-4 py-3"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={loadQuizzes}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-3"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
          <div className="p-6">
            {activeTab === 'available' ? (
              // Available Quizzes Tab
              loading ? (
                <div className="text-center py-16">
                  <div className="p-4 bg-blue-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement des quiz</h3>
                  <p className="text-gray-600">Veuillez patienter...</p>
                </div>
              ) : modules.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <GraduationCap className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Aucun quiz disponible
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Il n'y a actuellement aucun quiz disponible pour votre année d'étude. 
                    Vérifiez plus tard ou contactez votre enseignant.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {modules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      onStartQuiz={handleStartQuiz}
                      getQuizStatusBadge={getQuizStatusBadge}
                      formatDuration={formatDuration}
                    />
                  ))}
                </div>
              )
            ) : (
              // History Tab
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <History className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Historique des quiz</h2>
                      <p className="text-sm text-gray-600">Vos derniers résultats de quiz</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={loadHistory}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement de l'historique</h3>
                    <p className="text-gray-600">Veuillez patienter...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <History className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Aucun historique de quiz
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Vous n'avez pas encore complété de quiz.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((attempt) => (
                      <div key={attempt.attemptId} className="border rounded-xl p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-500">{attempt.module?.name || attempt.lesson?.title || 'Quiz'}</div>
                            <div className="text-base font-semibold text-gray-900">{attempt.title}</div>
                            <div className="text-xs text-gray-500">
                              Terminé le {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString('fr-FR') : '-'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{Math.round(attempt.percentage)}%</div>
                            <div className="text-xs text-gray-500">Score: {attempt.score}/{attempt.maxScore}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Module Card Component
interface ModuleCardProps {
  module: ModuleWithQuizzes;
  onStartQuiz: (quizId: string) => void;
  getQuizStatusBadge: (quiz: QuizItem) => React.ReactElement;
  formatDuration: (minutes?: number) => string;
}

function ModuleCard({ 
  module, 
  onStartQuiz, 
  getQuizStatusBadge, 
  formatDuration 
}: ModuleCardProps) {
  const totalQuizzes = module.lessons.reduce((total, lesson) => total + lesson.quizzes.length, 0);
  const completedQuizzes = module.lessons.reduce((total, lesson) => 
    total + lesson.quizzes.filter(quiz => quiz.isCompleted).length, 0
  );

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200">
      {/* Module Header */}
      <div className="p-6 border-b border-gray-200 bg-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{module.name}</h2>
              {module.studyYear && (
                <div className="flex items-center gap-2 mt-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{module.studyYear.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">Quiz</div>
              <div className="text-lg font-bold text-gray-900">{totalQuizzes}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">Complétés</div>
              <div className="text-lg font-bold text-green-600">{completedQuizzes}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">Progression</div>
              <div className="text-lg font-bold text-blue-600">
                {totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Content */}
      <div className="p-6 space-y-4">
        {module.lessons.map((lesson) => (
          <LessonSection
            key={lesson.id}
            lesson={lesson}
            onStartQuiz={onStartQuiz}
            getQuizStatusBadge={getQuizStatusBadge}
            formatDuration={formatDuration}
          />
        ))}
      </div>
    </div>
  );
}

// Lesson Section Component
interface LessonSectionProps {
  lesson: LessonWithQuizzes;
  onStartQuiz: (quizId: string) => void;
  getQuizStatusBadge: (quiz: QuizItem) => React.ReactElement;
  formatDuration: (minutes?: number) => string;
}

function LessonSection({ lesson, onStartQuiz, getQuizStatusBadge, formatDuration }: LessonSectionProps) {
  if (lesson.quizzes.length === 0) return null;

  return (
    <div className="p-6 border-b border-gray-100 last:border-b-0">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
        {lesson.description && (
          <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lesson.quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            onStart={() => onStartQuiz(quiz.id)}
            statusBadge={getQuizStatusBadge(quiz)}
            formatDuration={formatDuration}
          />
        ))}
      </div>
    </div>
  );
}

// Quiz Card Component
interface QuizCardProps {
  quiz: QuizItem;
  onStart: () => void;
  statusBadge: React.ReactElement;
  formatDuration: (minutes?: number) => string;
}

function QuizCard({ quiz, onStart, statusBadge, formatDuration }: QuizCardProps) {
  const locked = quiz.canStart === false;
  const label = quiz.isCompleted ? 'Refaire' : (locked ? 'Verrouillé' : 'Commencer');
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-200 group">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-900 transition-colors">
            {quiz.title}
          </h4>
          <div className="flex items-center gap-2">
            {quiz.isCompleted && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Fait</span>
            )}
            {statusBadge}
          </div>
        </div>

        {/* Description */}
        {quiz.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {quiz.description}
          </p>
        )}

        {/* Quiz Info */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white rounded p-2">
            <div className="text-xs font-medium text-gray-500">Questions</div>
            <div className="text-sm font-bold text-gray-900">{quiz.questionsCount}</div>
          </div>
          <div className="bg-white rounded p-2">
            <div className="text-xs font-medium text-gray-500">Durée</div>
            <div className="text-sm font-bold text-gray-900">{formatDuration(quiz.timeLimit)}</div>
          </div>
        </div>

        {/* Previous attempt info */}
        {quiz.isCompleted && (
          <div className="mb-4 p-2 bg-blue-50 rounded border border-blue-100">
            <div className="text-xs font-medium text-blue-900 mb-1">Dernier résultat</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700">
                {quiz.score}/{quiz.maxScore} pts
              </span>
              <span className="text-xs text-blue-600">
                {quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString('fr-FR') : ''}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={onStart}
          size="sm"
          disabled={locked}
          className={`w-full flex items-center justify-center gap-2 text-xs font-medium transition-all duration-200 ${
            locked
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : quiz.isCompleted 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Play className="h-3 w-3" />
          {label}
        </Button>
      </div>
    </div>
  );
}
