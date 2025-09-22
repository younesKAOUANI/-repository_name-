/**
 * Question Bank Manager Component
 * Admin/Instructor interface for managing the question bank
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import { useQuestionBankAdmin } from '@/hooks/useQuestionBankAdmin';
import { QuestionType } from '@prisma/client';
import { Plus, Search, Filter, RefreshCw, Eye, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { QuestionBankItem } from '@/services/question-bank.service';
import { useRouter } from 'next/navigation';
import CreateQuestionModal from '@/components/modals/CreateQuestionModal';

// Table columns for question bank
export const questionBankColumns: TableColumn<QuestionBankItem>[] = [
  {
    key: 'text',
    label: 'Question',
    sortable: true,
    render: (value, item) => {
      if (!item) return <span className="text-gray-400">-</span>;
      
      return (
        <div className="max-w-md">
          <p className="truncate font-medium">{item.text || 'Question sans texte'}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 text-xs rounded-full ${
              item.questionType === 'QCMA' ? 'bg-blue-100 text-blue-800' :
              item.questionType === 'QCMP' ? 'bg-indigo-100 text-indigo-800' :
              item.questionType === 'QCS' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
{item.questionType === 'QCMA' ? 'QCM Tout ou Rien' :
               item.questionType === 'QCMP' ? 'QCM Partiel' :
               item.questionType === 'QCS' ? 'Choix Simple' :
               'Réponse Ouverte'}
            </span>
            {item.difficulty && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                item.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.difficulty}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    key: 'context',
    label: 'Contexte',
    render: (value, item) => {
      if (!item) return <span className="text-gray-400">-</span>;
      
      if (item.lesson) {
        return (
          <div className="text-sm">
            <p className="font-medium">{item.lesson.title}</p>
            {item.lesson.module && (
              <p className="text-gray-500">{item.lesson.module.name}</p>
            )}
          </div>
        );
      } else if (item.module) {
        return (
          <div className="text-sm">
            <p className="font-medium">{item.module.name}</p>
          </div>
        );
      }
      
      return <span className="text-gray-400">-</span>;
    },
  },
  {
    key: 'isActive',
    label: 'Statut',
    sortable: true,
    render: (value, item) => {
      if (!item) return <span className="text-gray-400">-</span>;
      
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.isActive ? 'Actif' : 'Inactif'}
        </span>
      );
    },
  },
  {
    key: 'createdAt',
    label: 'Créé le',
    sortable: true,
    render: (value, item) => {
      if (!item) return <span className="text-gray-400">-</span>;
      return <span className="text-sm text-gray-600">{item.createdAt || '-'}</span>;
    },
  },
];

interface QuestionBankManagerProps {
  onQuestionSelect?: (question: QuestionBankItem) => void;
  selectionMode?: boolean;
}

export function QuestionBankManager({ 
  onQuestionSelect, 
  selectionMode = false 
}: QuestionBankManagerProps) {
  const router = useRouter();
  const [resources, setResources] = useState<any>(null);
  const [loadingResources, setLoadingResources] = useState(true);
  
  const {
    questions,
    currentQuestion,
    loading,
    pagination,
    filters,
    createModalOpen,
    editModalOpen,
    viewModalOpen,
    deleteModalOpen,
    loadQuestions,
    createQuestion,
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
  } = useQuestionBankAdmin();

  // Local state for form inputs
  const [searchInput, setSearchInput] = useState(filters.search);

  // Load resources (modules and lessons)
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoadingResources(true);
        const response = await fetch('/api/quizzes/resources');
        if (response.ok) {
          const data = await response.json();
          setResources(data);
        }
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setLoadingResources(false);
      }
    };

    loadResources();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: searchInput });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, updateFilters]);

  // Table actions
  const tableActions: TableAction<QuestionBankItem>[] = [
    {
      label: 'Voir',
      icon: <Eye className="h-4 w-4" />,
      onClick: (question) => openViewModal(question),
      variant: 'default',
    },
    {
      label: 'Modifier',
      icon: <Edit className="h-4 w-4" />,
      onClick: (question) => openEditModal(question),
      variant: 'default',
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (question) => openDeleteModal(question),
      variant: 'danger',
    },
  ];

  // Add select action if in selection mode
  if (selectionMode && onQuestionSelect) {
    tableActions.unshift({
      label: 'Sélectionner',
      onClick: (question) => onQuestionSelect(question),
      variant: 'default',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/quizzes')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux Quiz
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banque de Questions</h1>
            <p className="text-gray-600 mt-1">
              Gérer les questions pour les quiz de révision
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une Question
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search questions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={resetFilters} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Effacer
          </Button>
          <Button variant="secondary" onClick={loadQuestions} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={questionBankColumns}
        data={questions}
        actions={tableActions}
        loading={loading}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          pageSize: pagination.pageSize,
          totalItems: pagination.totalItems,
          onPageChange: changePage,
        }}
        searchPlaceholder="Rechercher des questions..."
        onSearch={(query) => updateFilters({ search: query })}
        emptyMessage="Aucune question trouvée. Ajoutez votre première question pour commencer."
      />

      {/* Modals */}
      <CreateQuestionModal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
        onSubmit={createQuestion}
        resources={resources}
        loading={loading}
        error={undefined}
      />
      
      {/* TODO: Add EditQuestionModal, ViewQuestionModal, DeleteQuestionModal */}
    </div>
  );
}
