/**
 * Question Bank Admin Hook
 * Manages question bank CRUD operations for admin/instructor interface
 */

import { useState, useCallback, useEffect } from 'react';
import { QuestionType } from '@prisma/client';
import { questionBankService, QuestionBankItem, QuestionBankFilters, QuestionBankListResponse } from '@/services/question-bank.service';
import { formatDate } from '@/utils/date.utils';

export interface QuestionBankCreate {
  text: string;
  questionType: QuestionType;
  lessonId?: number;
  moduleId?: number;
  difficulty?: string;
  explanation?: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

export interface QuestionBankUpdate extends QuestionBankCreate {
  id: number;
}

interface UseQuestionBankAdminState {
  questions: QuestionBankItem[];
  currentQuestion: QuestionBankItem | null;
  loading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
  filters: QuestionBankFilters;
  // Modal states
  createModalOpen: boolean;
  editModalOpen: boolean;
  viewModalOpen: boolean;
  deleteModalOpen: boolean;
}

interface UseQuestionBankAdminActions {
  // Data loading
  loadQuestions: () => Promise<void>;
  loadQuestion: (id: number) => Promise<void>;
  
  // CRUD operations
  createQuestion: (data: QuestionBankCreate) => Promise<void>;
  updateQuestion: (data: QuestionBankUpdate) => Promise<void>;
  deleteQuestion: (id: number) => Promise<void>;
  
  // Modal management
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (question: QuestionBankItem) => void;
  closeEditModal: () => void;
  openViewModal: (question: QuestionBankItem) => void;
  closeViewModal: () => void;
  openDeleteModal: (question: QuestionBankItem) => void;
  closeDeleteModal: () => void;
  
  // Filtering and pagination
  updateFilters: (newFilters: Partial<QuestionBankFilters>) => void;
  changePage: (page: number) => void;
  resetFilters: () => void;
}

interface UseQuestionBankAdminReturn extends UseQuestionBankAdminState, UseQuestionBankAdminActions {}

const initialFilters: QuestionBankFilters = {
  search: '',
  questionType: undefined,
  moduleId: undefined,
  lessonId: undefined,
  difficulty: undefined,
  isActive: undefined,
};

const initialPagination = {
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  totalItems: 0,
};

export function useQuestionBankAdmin(): UseQuestionBankAdminReturn {
  const [state, setState] = useState<UseQuestionBankAdminState>({
    questions: [],
    currentQuestion: null,
    loading: false,
    pagination: initialPagination,
    filters: initialFilters,
    createModalOpen: false,
    editModalOpen: false,
    viewModalOpen: false,
    deleteModalOpen: false,
  });

  // Data loading
  const loadQuestions = useCallback(async (page?: number, pageSize?: number, filters?: QuestionBankFilters) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response: QuestionBankListResponse = await questionBankService.getQuestions(
        page || state.pagination.currentPage,
        pageSize || state.pagination.pageSize,
        filters || state.filters
      );
      
      setState(prev => ({
        ...prev,
        questions: response.questions.map(q => ({
          ...q,
          createdAt: formatDate(q.createdAt),
          updatedAt: formatDate(q.updatedAt),
        })),
        pagination: response.pagination,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading questions:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.pagination.currentPage, state.pagination.pageSize, state.filters]);

  const loadQuestion = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const question = await questionBankService.getQuestionById(id);
      setState(prev => ({
        ...prev,
        currentQuestion: {
          ...question,
          createdAt: formatDate(question.createdAt),
          updatedAt: formatDate(question.updatedAt),
        },
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading question:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // CRUD operations
  const createQuestion = useCallback(async (data: QuestionBankCreate) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await questionBankService.createQuestion(data);
      await loadQuestions();
      setState(prev => ({ ...prev, createModalOpen: false, loading: false }));
    } catch (error) {
      console.error('Error creating question:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [loadQuestions]);

  const updateQuestion = useCallback(async (data: QuestionBankUpdate) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await questionBankService.updateQuestion(data.id, data);
      await loadQuestions();
      setState(prev => ({ ...prev, editModalOpen: false, loading: false }));
    } catch (error) {
      console.error('Error updating question:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [loadQuestions]);

  const deleteQuestion = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await questionBankService.deleteQuestion(id);
      await loadQuestions();
      setState(prev => ({ ...prev, deleteModalOpen: false, loading: false }));
    } catch (error) {
      console.error('Error deleting question:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [loadQuestions]);

  // Modal management
  const openCreateModal = useCallback(() => {
    setState(prev => ({ ...prev, createModalOpen: true, currentQuestion: null }));
  }, []);

  const closeCreateModal = useCallback(() => {
    setState(prev => ({ ...prev, createModalOpen: false, currentQuestion: null }));
  }, []);

  const openEditModal = useCallback(async (question: QuestionBankItem) => {
    setState(prev => ({ ...prev, editModalOpen: true, currentQuestion: question }));
    // Load full question data with options
    await loadQuestion(question.id);
  }, [loadQuestion]);

  const closeEditModal = useCallback(() => {
    setState(prev => ({ ...prev, editModalOpen: false, currentQuestion: null }));
  }, []);

  const openViewModal = useCallback(async (question: QuestionBankItem) => {
    setState(prev => ({ ...prev, viewModalOpen: true, currentQuestion: question }));
    // Load full question data with options
    await loadQuestion(question.id);
  }, [loadQuestion]);

  const closeViewModal = useCallback(() => {
    setState(prev => ({ ...prev, viewModalOpen: false, currentQuestion: null }));
  }, []);

  const openDeleteModal = useCallback((question: QuestionBankItem) => {
    setState(prev => ({ ...prev, deleteModalOpen: true, currentQuestion: question }));
  }, []);

  const closeDeleteModal = useCallback(() => {
    setState(prev => ({ ...prev, deleteModalOpen: false, currentQuestion: null }));
  }, []);

  // Filtering and pagination
  const updateFilters = useCallback((newFilters: Partial<QuestionBankFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, currentPage: 1 }, // Reset to first page
    }));
  }, []);

  const changePage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: page },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: initialFilters,
      pagination: { ...prev.pagination, currentPage: 1 },
    }));
  }, []);

  // Load questions when filters or pagination change
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return {
    // State
    questions: state.questions,
    currentQuestion: state.currentQuestion,
    loading: state.loading,
    pagination: state.pagination,
    filters: state.filters,
    createModalOpen: state.createModalOpen,
    editModalOpen: state.editModalOpen,
    viewModalOpen: state.viewModalOpen,
    deleteModalOpen: state.deleteModalOpen,
    
    // Actions
    loadQuestions,
    loadQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,  
    openDeleteModal,
    closeDeleteModal,
    updateFilters,
    changePage,
    resetFilters,
  };
}
