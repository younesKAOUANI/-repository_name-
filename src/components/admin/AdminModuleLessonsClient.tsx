'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, FileText, ArrowLeft, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { lessonService, Lesson } from '@/services/lesson.service';
import { moduleService, Module } from '@/services/module.service';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Lesson Item Component
interface SortableLessonItemProps {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
}

function SortableLessonItem({ lesson, onEdit, onDelete }: SortableLessonItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-xs text-gray-400">Ordre: {lesson.order}</span>
            <span className="text-xs text-gray-400">ID: {lesson.id}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(lesson)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(lesson)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminModuleLessonsClient() {
  const params = useParams();
  const moduleId = parseInt(params.moduleId as string, 10);
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (moduleId) {
      loadModuleAndLessons();
    }
  }, [moduleId]);

  const loadModuleAndLessons = async () => {
    try {
      setLoading(true);
      
      // Load module details
      const moduleData = await moduleService.getModule(moduleId);
      setModule(moduleData);

      // Load lessons for this module
      const lessonsData = await lessonService.getLessonsByModule(moduleId);
      // Sort lessons by order to ensure correct display
      const sortedLessons = lessonsData.sort((a, b) => a.order - b.order);
      setLessons(sortedLessons);
      
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = () => {
    setLessonForm({ title: '', description: '', content: '' });
    setEditingLesson(null);
    setShowCreateLesson(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || ''
    });
    setEditingLesson(lesson);
    setShowCreateLesson(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim()) {
      setError('Le titre de la leçon est requis');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (editingLesson) {
        // Update lesson
        await lessonService.updateLesson(editingLesson.id, lessonForm);
      } else {
        // Create lesson
        await lessonService.createLesson({
          ...lessonForm,
          moduleId
        });
      }

      setShowCreateLesson(false);
      await loadModuleAndLessons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la leçon "${lesson.title}" ?`)) {
      return;
    }

    try {
      setError('');
      await lessonService.deleteLesson(lesson.id);
      await loadModuleAndLessons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleCancel = () => {
    setShowCreateLesson(false);
    setLessonForm({ title: '', description: '', content: '' });
    setEditingLesson(null);
    setError('');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setIsReordering(true);
      const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
      const newIndex = lessons.findIndex((lesson) => lesson.id === over?.id);

      const reorderedLessons = arrayMove(lessons, oldIndex, newIndex);
      
      // Update the order values
      const updatedLessons = reorderedLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }));

      // Optimistically update the UI
      setLessons(updatedLessons);

      try {
        // Send the new order to the server
        const lessonIds = updatedLessons.map((lesson) => lesson.id);
        await lessonService.reorderLessons(moduleId, lessonIds);
        setError(''); // Clear any previous errors
      } catch (err) {
        // Revert on error
        setError(err instanceof Error ? err.message : 'Erreur lors de la réorganisation');
        await loadModuleAndLessons(); // Reload to get the correct order
      } finally {
        setIsReordering(false);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Gestion des leçons" subtitle="Chargement...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center space-x-4">
          <Link href="/admin/modules">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux modules
            </Button>
          </Link>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {lessons.length} leçon{lessons.length !== 1 ? 's' : ''}
            {lessons.length > 1 && (
              <span className="ml-2 text-blue-600">• Glissez-déposez pour réorganiser</span>
            )}
          </div>
          <Button variant="primary" onClick={handleCreateLesson}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une leçon
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Reordering Indicator */}
        {isReordering && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-700 text-sm flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Réorganisation en cours...
            </div>
          </div>
        )}

        {/* Lessons List */}
        <div className="bg-white rounded-lg shadow">
          {lessons.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Aucune leçon</p>
              <p className="text-sm">Commencez par ajouter une leçon à ce module.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={lessons.map(lesson => lesson.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-gray-200">
                  {lessons.map((lesson) => (
                    <SortableLessonItem
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={handleEditLesson}
                      onDelete={handleDeleteLesson}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Create/Edit Lesson Modal */}
        {showCreateLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">
                {editingLesson ? 'Modifier la leçon' : 'Ajouter une leçon'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <Input
                    id="title"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre de la leçon"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Input
                    id="description"
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de la leçon"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu
                  </label>
                  <textarea
                    id="content"
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contenu de la leçon"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveLesson}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sauvegarde...' : (editingLesson ? 'Modifier' : 'Ajouter')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}