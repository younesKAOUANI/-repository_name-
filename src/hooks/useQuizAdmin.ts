/**
 * Quiz Admin Hook
 * Custom hook for managing quiz administration state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { QuizType } from '@prisma/client';
import quizAdminService, {
  Quiz,
  QuizCreate,
  QuizStats,
  QuizPagination,
  QuizFilters,
  SessionQuizOptions,
  Question,
} from '@/services/quiz.admin.service';

export interface UseQuizAdminState {
  // Data
  quizzes: Quiz[];
  selectedQuiz: Quiz | null;
  stats: QuizStats | null;
  resources: any;
  sessionQuestions: Question[];
  
  // Loading states
  loading: boolean;
  loadingStats: boolean;
  loadingResources: boolean;
  loadingSession: boolean;
  
  // Error handling
  error: string;
  
  // Pagination and filters  
  pagination: QuizPagination;
  filters: QuizFilters;
  
  // Modal states
  showCreateModal: boolean;
  showEditModal: boolean;
  showViewModal: boolean;
  showSessionModal: boolean;
  
  // Form states
  createForm: QuizCreate;
  editForm: Partial<QuizCreate>;
  sessionOptions: SessionQuizOptions;
}

export interface UseQuizAdminActions {
  // Data loading
  loadQuizzes: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadResources: () => Promise<void>;
  loadQuizById: (id: string) => Promise<void>;
  
  // Pagination and filtering
  handleSearch: (query: string) => void;
  handlePageChange: (page: number) => void;
  setFilters: (filters: Partial<QuizFilters>) => void;
  
  // Quiz operations
  handleCreateQuiz: (quizData: QuizCreate) => Promise<void>;
  handleEditQuiz: (e: React.FormEvent) => Promise<void>;
  handleEditQuizData: (quizData: QuizCreate) => Promise<void>;
  handleDeleteQuiz: (quiz: Quiz) => Promise<void>;
  handleDuplicateQuiz: (quiz: Quiz) => Promise<void>;
  
  // Session quiz operations
  generateSessionQuiz: () => Promise<void>;
  createSessionQuiz: (title: string, description?: string) => Promise<void>;
  
  // Modal management
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowViewModal: (show: boolean) => void;
  setShowSessionModal: (show: boolean) => void;
  handleViewQuiz: (quiz: Quiz) => void;
  handleEditQuizModal: (quiz: Quiz) => Promise<void>;
  
  // Form management
  setCreateForm: (form: Partial<QuizCreate>) => void;
  setEditForm: (form: Partial<QuizCreate>) => void;
  setSessionOptions: (options: Partial<SessionQuizOptions>) => void;
  resetForms: () => void;
}

const initialCreateForm: QuizCreate = {
  title: '',
  description: '',
  type: 'QUIZ',
  lessonId: undefined,
  moduleId: undefined,
  questionCount: 20,
  timeLimit: undefined,
  questions: [],
  sessionLessons: [],
};

const initialPagination: QuizPagination = {
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  totalItems: 0,
};

const initialFilters: QuizFilters = {
  search: '',
  type: undefined,
  moduleId: undefined,
  lessonId: undefined,
};

const initialSessionOptions: SessionQuizOptions = {
  questionCount: 20,
  selectedLessons: [],
  selectedModules: [],
  selectedSemesters: [],
  timeLimit: undefined,
};

export function useQuizAdmin(): UseQuizAdminState & UseQuizAdminActions {
  // State
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [resources, setResources] = useState<any>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  
  // Error handling
  const [error, setError] = useState('');
  
  // Pagination and filters
  const [pagination, setPagination] = useState<QuizPagination>(initialPagination);
  const [filters, setFiltersState] = useState<QuizFilters>(initialFilters);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  
  // Form states
  const [createForm, setCreateFormState] = useState<QuizCreate>(initialCreateForm);
  const [editForm, setEditFormState] = useState<Partial<QuizCreate>>({});
  const [sessionOptions, setSessionOptionsState] = useState<SessionQuizOptions>(initialSessionOptions);

  // Clear error when modals close
  useEffect(() => {
    if (!showCreateModal && !showEditModal && !showSessionModal) {
      setError('');
    }
  }, [showCreateModal, showEditModal, showSessionModal]);

  // Load quizzes when filters or pagination change
  useEffect(() => {
    loadQuizzes();
  }, [filters, pagination.currentPage]);

  // Date formatting utility
  const formatDate = useCallback((dateValue: string | Date | null | undefined): string => {
    if (!dateValue) {
      return '-';
    }
    
    try {
      const date = new Date(dateValue);
      
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  }, []);

  // Actions
  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await quizAdminService.getQuizzes(
        pagination.currentPage,
        pagination.pageSize,
        filters
      );
      
      // Format dates and prepare data for DataTable
      const formattedQuizzes = response.quizzes.map((quiz) => ({
        ...quiz,
        createdAt: formatDate(quiz.createdAt),
        updatedAt: formatDate(quiz.updatedAt),
      }));
      
      setQuizzes(formattedQuizzes);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des quiz');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filters, formatDate]);

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const statsData = await quizAdminService.getQuizStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Échec du chargement des statistiques:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadResources = useCallback(async () => {
    try {
      setLoadingResources(true);
      const resourcesData = await quizAdminService.getQuizResources();
      setResources(resourcesData);
    } catch (err: any) {
      console.error('Échec du chargement des ressources:', err);
    } finally {
      setLoadingResources(false);
    }
  }, []);

  const loadQuizById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const quiz = await quizAdminService.getQuizById(id);
      setSelectedQuiz(quiz);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement du quiz');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setFiltersState(prev => ({ ...prev, search: query }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<QuizFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleCreateQuiz = useCallback(async (quizData: QuizCreate) => {
    try {
      setLoading(true);
      setError('');
      await quizAdminService.createQuiz(quizData);
      setShowCreateModal(false);
      setCreateFormState(initialCreateForm);
      await loadQuizzes();
    } catch (err: any) {
      setError(err.message || 'Échec de la création du quiz');
    } finally {
      setLoading(false);
    }
  }, [loadQuizzes]);

  const handleEditQuiz = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;
    
    try {
      setLoading(true);
      setError('');
      await quizAdminService.updateQuiz(selectedQuiz.id, editForm);
      setShowEditModal(false);
      setEditFormState({});
      setSelectedQuiz(null);
      await loadQuizzes();
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du quiz');
    } finally {
      setLoading(false);
    }
  }, [selectedQuiz, editForm, loadQuizzes]);

  const handleEditQuizData = useCallback(async (quizData: QuizCreate) => {
    if (!selectedQuiz) return;
    
    try {
      setLoading(true);
      setError('');
      await quizAdminService.updateQuiz(selectedQuiz.id, quizData);
      setShowEditModal(false);
      setEditFormState({});
      setSelectedQuiz(null);
      await loadQuizzes();
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du quiz');
    } finally {
      setLoading(false);
    }
  }, [selectedQuiz, loadQuizzes]);

  const handleDeleteQuiz = useCallback(async (quiz: Quiz) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le quiz "${quiz.title}" ?`)) {
      return;
    }

    try {
      setLoading(true);
      await quizAdminService.deleteQuiz(quiz.id);
      await loadQuizzes();
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression du quiz');
    } finally {
      setLoading(false);
    }
  }, [loadQuizzes]);

  const handleDuplicateQuiz = useCallback(async (quiz: Quiz) => {
    try {
      setLoading(true);
      await quizAdminService.duplicateQuiz(quiz.id, `${quiz.title} (Copie)`);
      await loadQuizzes();
    } catch (err: any) {
      setError(err.message || 'Échec de la duplication du quiz');
    } finally {
      setLoading(false);
    }
  }, [loadQuizzes]);

  const generateSessionQuiz = useCallback(async () => {
    try {
      setLoadingSession(true);
      setError('');
      const questions = await quizAdminService.generateSessionQuiz(sessionOptions);
      setSessionQuestions(questions);
    } catch (err: any) {
      setError(err.message || 'Échec de la génération du quiz de session');
    } finally {
      setLoadingSession(false);
    }
  }, [sessionOptions]);

  const createSessionQuiz = useCallback(async (title: string, description?: string) => {
    try {
      setLoading(true);
      setError('');
      
      const sessionQuizData: QuizCreate = {
        title,
        description,
        type: 'SESSION',
        questionCount: sessionOptions.questionCount,
        timeLimit: sessionOptions.timeLimit,
        questions: sessionQuestions.map((q, index) => ({
          text: q.text,
          questionType: q.questionType,
          order: index + 1,
          options: q.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        })),
        sessionLessons: sessionOptions.selectedLessons,
      };

      console.log('=== FINAL SESSION QUIZ DATA ===');
      console.log('Title:', sessionQuizData.title);
      console.log('Description:', sessionQuizData.description);
      console.log('Type:', sessionQuizData.type);
      console.log('Question Count:', sessionQuizData.questionCount);
      console.log('Time Limit:', sessionQuizData.timeLimit);
      console.log('Questions Count:', sessionQuizData.questions?.length);
      console.log('Session Lessons:', sessionQuizData.sessionLessons);
      console.log('Full Quiz Data:', JSON.stringify(sessionQuizData, null, 2));

      await quizAdminService.createQuiz(sessionQuizData);
      setShowSessionModal(false);
      setSessionOptionsState(initialSessionOptions);
      setSessionQuestions([]);
      await loadQuizzes();
    } catch (err: any) {
      setError(err.message || 'Échec de la création du quiz de session');
    } finally {
      setLoading(false);
    }
  }, [sessionOptions, sessionQuestions, loadQuizzes]);

  const handleViewQuiz = useCallback(async (quiz: Quiz) => {
    try {
      setLoading(true);
      // Load the complete quiz data with questions for viewing
      const fullQuiz = await quizAdminService.getQuizById(quiz.id);
      setSelectedQuiz(fullQuiz);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error loading quiz for viewing:', error);
      setError('Erreur lors du chargement du quiz');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEditQuizModal = useCallback(async (quiz: Quiz) => {
    try {
      setLoading(true);
      // Load the complete quiz data with questions
      const fullQuiz = await quizAdminService.getQuizById(quiz.id);
      setSelectedQuiz(fullQuiz);
      setEditFormState({
        title: fullQuiz.title,
        description: fullQuiz.description,
        questionCount: fullQuiz.questionCount,
        timeLimit: fullQuiz.timeLimit,
      });
      setShowEditModal(true);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des détails du quiz');
    } finally {
      setLoading(false);
    }
  }, []);

  const setCreateForm = useCallback((form: Partial<QuizCreate>) => {
    setCreateFormState(prev => ({ ...prev, ...form }));
  }, []);

  const setEditForm = useCallback((form: Partial<QuizCreate>) => {
    setEditFormState(prev => ({ ...prev, ...form }));
  }, []);

  const setSessionOptions = useCallback((options: Partial<SessionQuizOptions>) => {
    setSessionOptionsState(prev => ({ ...prev, ...options }));
  }, []);

  const resetForms = useCallback(() => {
    setCreateFormState(initialCreateForm);
    setEditFormState({});
    setSessionOptionsState(initialSessionOptions);
    setSessionQuestions([]);
    setError('');
  }, []);

  return {
    // State
    quizzes,
    selectedQuiz,
    stats,
    resources,
    sessionQuestions,
    loading,
    loadingStats,
    loadingResources,
    loadingSession,
    error,
    pagination,
    filters,
    showCreateModal,
    showEditModal,
    showViewModal,
    showSessionModal,
    createForm,
    editForm,
    sessionOptions,
    
    // Actions
    loadQuizzes,
    loadStats,
    loadResources,
    loadQuizById,
    handleSearch,
    handlePageChange,
    setFilters,
    handleCreateQuiz,
    handleEditQuiz,
    handleEditQuizData,
    handleDeleteQuiz,
    handleDuplicateQuiz,
    generateSessionQuiz,
    createSessionQuiz,
    setShowCreateModal,
    setShowEditModal,
    setShowViewModal,
    setShowSessionModal,
    handleViewQuiz,
    handleEditQuizModal,
    setCreateForm,
    setEditForm,
    setSessionOptions,
    resetForms,
  };
}
