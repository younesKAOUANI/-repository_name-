/**
 * Quiz Manager Component
 * Manages all three types of quizzes: QUIZ (lesson), EXAM (module), SESSION (custom)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DataTable from '@/components/ui/DataTable';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Copy, 
  BookOpen, 
  GraduationCap, 
  Shuffle,
  Clock,
  Users,
  X,
  Database
} from 'lucide-react';
import { QuizType } from '@prisma/client';
import { useQuizAdmin } from '@/hooks/useQuizAdmin';
import { Quiz } from '@/services/quiz.admin.service';
import SessionQuizModal from '@/components/modals/SessionQuizModal';
import CreateQuizModal from '@/components/modals/CreateQuizModal';
import EditQuizModal from '@/components/modals/EditQuizModal';
import ViewQuizModal from '@/components/modals/ViewQuizModal';

const QuizTypeIcons = {
  QUIZ: BookOpen,
  EXAM: GraduationCap,
  SESSION: Shuffle,
} as const;

const isValidQuizType = (type: any): type is keyof typeof QuizTypeIcons => {
  return type && typeof type === 'string' && type in QuizTypeIcons;
};



const QuizTypeLabels = {
  QUIZ: 'Quiz de leçon',
  EXAM: 'Examen de module',
  SESSION: 'Quiz de révision',
} as const;

const QuizTypeBadgeColors = {
  QUIZ: 'bg-blue-100 text-blue-800',
  EXAM: 'bg-red-100 text-red-800',
  SESSION: 'bg-green-100 text-green-800',
} as const;

interface QuizManagerProps {
  userRole: 'ADMIN' | 'INSTRUCTOR';
}

export default function QuizManager({ userRole }: QuizManagerProps) {
  const router = useRouter();
  const {
    quizzes,
    selectedQuiz,
    pagination,
    loading,
    loadingSession,
    stats,
    resources,
    loadingStats,
    loadingResources,
    error,
    showCreateModal,
    showEditModal,
    showViewModal,
    showSessionModal,
    createForm,
    editForm,
    sessionOptions,
    sessionQuestions,
    filters,
    loadStats,
    loadResources,
    loadQuizzes,
    handleSearch,
    handlePageChange,
    handleCreateQuiz,
    handleDeleteQuiz,
    handleEditQuiz,
    handleViewQuiz,
    handleEditQuizModal,
    handleEditQuizData,
    handleDuplicateQuiz,
    generateSessionQuiz,
    createSessionQuiz,
    setFilters,
    setEditForm,
    setSessionOptions,
    setShowCreateModal,
    setShowEditModal,
    setShowViewModal,
    setShowSessionModal,
  } = useQuizAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<QuizType | ''>('');
  const [selectedModule, setSelectedModule] = useState<number | ''>('');
  const [selectedLesson, setSelectedLesson] = useState<number | ''>('');

  useEffect(() => {
    loadStats();
    loadResources();
  }, [loadStats, loadResources]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleTypeFilter = (type: QuizType | '') => {
    setSelectedType(type);
    setFilters({ type: type || undefined });
  };

  const handleModuleFilter = (moduleId: number | '') => {
    setSelectedModule(moduleId);
    // Clear lesson filter when module changes
    setSelectedLesson('');
    setFilters({ 
      moduleId: moduleId || undefined,
      lessonId: undefined 
    });
  };

  const handleLessonFilter = (lessonId: number | '') => {
    setSelectedLesson(lessonId);
    setFilters({ lessonId: lessonId || undefined });
  };

  // Get available lessons based on selected module
  const getFilteredLessons = () => {
    if (!resources?.studyYears || !selectedModule) return [];
    
    const allLessons: any[] = [];
    resources.studyYears.forEach((studyYear: any) => {
      studyYear.semesters?.forEach((semester: any) => {
        semester.modules?.forEach((module: any) => {
          if (module.id === selectedModule) {
            allLessons.push(...(module.lessons || []));
          }
        });
      });
    });
    
    return allLessons.sort((a: any, b: any) => a.title.localeCompare(b.title));
  };

  // Get all available modules
  const getAllModules = () => {
    if (!resources?.studyYears) return [];
    
    const allModules: any[] = [];
    resources.studyYears.forEach((studyYear: any) => {
      studyYear.semesters?.forEach((semester: any) => {
        if (semester.modules) {
          allModules.push(...semester.modules);
        }
      });
    });
    
    return allModules.sort((a: any, b: any) => a.name.localeCompare(b.name));
  };

  const formatQuizLocation = (quiz: Quiz) => {
    if (!quiz) return 'Quiz de révision';
    if (quiz.lesson) {
      return `Leçon: ${quiz.lesson.title}`;
    }
    if (quiz.module) {
      return `Module: ${quiz.module.name}`;
    }
    return 'Quiz de révision';
  };

  const columns = [
    {
      key: 'title',
      label: 'Quiz',
      render: (title: string, quiz: Quiz) => quiz ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {(() => {
              if (!isValidQuizType(quiz.type)) {
                return <BookOpen className="h-4 w-4 text-gray-500" />;
              }
              const Icon = QuizTypeIcons[quiz.type];
              return <Icon className="h-4 w-4 text-gray-500" />;
            })()}
            <span className="font-medium">{quiz.title}</span>
          </div>
          {quiz.description && (
            <p className="text-sm text-gray-600 truncate max-w-md">
              {quiz.description}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {formatQuizLocation(quiz)}
          </p>
        </div>
      ) : <div>-</div>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (type: string, quiz: Quiz) => quiz ? (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isValidQuizType(type) ? QuizTypeBadgeColors[type] : 'bg-gray-100 text-gray-800'
        }`}>
          {isValidQuizType(type) ? QuizTypeLabels[type] : 'Quiz'}
        </span>
      ) : <div>-</div>,
    },
    {
    key: "questions",
    label: "Questions",
    render: (value: any, quiz: Quiz) => {
      const count = quiz?._count?.questions ?? 0;
      return <div className="text-center">{count}</div>;
    },
  },
  {
    key: "attempts",
    label: "Attempts",
    render: (value: any, quiz: Quiz) => {
      const count = quiz?._count?.attempts ?? 0;
      return <div className="text-center">{count}</div>;
    },
  },
    {
      key: 'duration',
      label: 'Durée',
      render: (value: any, quiz: Quiz) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          {quiz?.timeLimit ? `${quiz.timeLimit} min` : 'Illimitée'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (createdAt: string, quiz: Quiz) => (
        <div className="text-sm text-gray-600">
          {createdAt || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, quiz: Quiz) => quiz ? (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewQuiz(quiz)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditQuizModal(quiz)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDuplicateQuiz(quiz)}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteQuiz(quiz)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : <div>-</div>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quiz</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quiz de leçon</p>
                <p className="text-2xl font-bold text-blue-900">{stats.quizzesByType.QUIZ}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Examens</p>
                <p className="text-2xl font-bold text-red-900">{stats.quizzesByType.EXAM}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Banque de Questions</p>
                <p className="text-2xl font-bold text-green-900">
                  <span className="text-sm text-gray-500">Gérer →</span>
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher des quiz..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => router.push('/admin/question-bank')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Database className="h-4 w-4 mr-2" />
              Banque de Questions
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau quiz
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filtres
              {(selectedType || selectedModule || selectedLesson) && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {[selectedType, selectedModule, selectedLesson].filter(Boolean).length}
                </span>
              )}
              :
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedType}
              onChange={(e) => handleTypeFilter(e.target.value as QuizType | '')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px]"
            >
              <option value="">Tous les types</option>
              <option value="QUIZ">Quiz de leçon</option>
              <option value="EXAM">Examens</option>
              <option value="SESSION">Quiz de révision</option>
            </select>

            <select
              value={selectedModule}
              onChange={(e) => handleModuleFilter(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px]"
            >
              <option value="">Tous les modules</option>
              {getAllModules().map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>

            <select
              value={selectedLesson}
              onChange={(e) => handleLessonFilter(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px]"
              disabled={!selectedModule}
            >
              <option value="">Toutes les leçons</option>
              {getFilteredLessons().map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {(selectedType || selectedModule || selectedLesson) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedType('');
                  setSelectedModule('');
                  setSelectedLesson('');
                  setFilters({ type: undefined, moduleId: undefined, lessonId: undefined });
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Quiz Table */}
      <div className="bg-white rounded-lg border">
        <DataTable
          data={quizzes}
          columns={columns}
          loading={loading}
          pagination={{
            ...pagination,
            onPageChange: handlePageChange,
          }}
          emptyMessage="Aucun quiz trouvé"
        />
      </div>

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateQuiz}
        resources={resources}
        loading={loading}
        error={error}
      />

      {/* View Quiz Modal */}
      <ViewQuizModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        quiz={selectedQuiz}
      />

      {/* Edit Quiz Modal */}
      <EditQuizModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditQuizData}
        quiz={selectedQuiz}
        resources={resources}
        loading={loading}
        error={error}
      />

      {/* Session Quiz Modal */}
      <SessionQuizModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        resources={resources}
        sessionOptions={sessionOptions}
        setSessionOptions={setSessionOptions}
        onGenerateQuiz={generateSessionQuiz}
        onCreateQuiz={createSessionQuiz}
        sessionQuestions={sessionQuestions}
        loading={loading}
        loadingSession={loadingSession}
        error={error}
      />
    </div>
  );
}
