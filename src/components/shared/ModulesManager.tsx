'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { 
  moduleService, 
  StudyYear, 
  Module, 
  CreateModuleData 
} from '@/services/module.service';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen, 
  FileText,
  Calendar,
  List
} from 'lucide-react';

interface ExpandedState {
  studyYears: Set<string>;
  semesters: Set<string>;
}

interface ModulesManagerProps {
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  showActions?: boolean;
}

export default function ModulesManager({ 
  allowCreate = true, 
  allowEdit = true, 
  allowDelete = true,
  showActions = true 
}: ModulesManagerProps) {
  const [studyYears, setStudyYears] = useState<StudyYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expanded, setExpanded] = useState<ExpandedState>({
    studyYears: new Set(),
    semesters: new Set()
  });

  // Modal states
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Form states
  const [moduleName, setModuleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadStudyYears();
  }, []);

  const loadStudyYears = async () => {
    try {
      setLoading(true);
      const data = await moduleService.getStudyYears(true);
      setStudyYears(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudyYear = (studyYearId: string) => {
    setExpanded(prev => ({
      ...prev,
      studyYears: prev.studyYears.has(studyYearId) 
        ? new Set([...prev.studyYears].filter(id => id !== studyYearId))
        : new Set([...prev.studyYears, studyYearId])
    }));
  };

  const toggleSemester = (semesterId: string) => {
    setExpanded(prev => ({
      ...prev,
      semesters: prev.semesters.has(semesterId)
        ? new Set([...prev.semesters].filter(id => id !== semesterId))
        : new Set([...prev.semesters, semesterId])
    }));
  };

  const handleCreateModule = (semesterId: string) => {
    if (!allowCreate) return;
    setSelectedSemesterId(semesterId);
    setModuleName('');
    setEditingModule(null);
    setShowCreateModule(true);
  };

  const handleEditModule = (module: Module) => {
    if (!allowEdit) return;
    setSelectedSemesterId(module.semesterId);
    setModuleName(module.name);
    setEditingModule(module);
    setShowCreateModule(true);
  };

  const handleDeleteModule = async (module: Module) => {
    if (!allowDelete) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le module "${module.name}" ?`)) {
      return;
    }

    try {
      await moduleService.deleteModule(module.id);
      await loadStudyYears(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleSubmitModule = async () => {
    if (!moduleName.trim() || !selectedSemesterId) {
      setError('Le nom du module est requis');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (editingModule) {
        await moduleService.updateModule(editingModule.id, {
          name: moduleName.trim(),
          semesterId: selectedSemesterId
        });
      } else {
        const moduleData: CreateModuleData = {
          name: moduleName.trim(),
          semesterId: selectedSemesterId
        };
        await moduleService.createModule(moduleData);
      }

      setShowCreateModule(false);
      setModuleName('');
      setSelectedSemesterId(null);
      setEditingModule(null);
      await loadStudyYears(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelModule = () => {
    setShowCreateModule(false);
    setModuleName('');
    setSelectedSemesterId(null);
    setEditingModule(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      {showActions && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {studyYears.length} années d'étude • {' '}
            {studyYears.reduce((total, year) => total + year._count.modules, 0)} modules au total
          </div>
          <Button
            variant="primary"
            onClick={() => loadStudyYears()}
            disabled={loading}
          >
            🔄 Actualiser
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Study Years Tree */}
      <div className="bg-white rounded-lg shadow">
        {studyYears.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune année d'étude trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {studyYears.map((studyYear) => (
              <div key={studyYear.id} className="p-4">
                {/* Study Year Header */}
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  onClick={() => toggleStudyYear(studyYear.id)}
                >
                  <div className="flex items-center space-x-3">
                    {expanded.studyYears.has(studyYear.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-lg">{studyYear.name}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{studyYear._count.semesters} semestres</span>
                    <span>{studyYear._count.modules} modules</span>
                  </div>
                </div>

                {/* Semesters */}
                {expanded.studyYears.has(studyYear.id) && (
                  <div className="ml-8 mt-4 space-y-3">
                    {studyYear.semesters.map((semester) => (
                      <div key={semester.id} className="border border-gray-200 rounded-lg">
                        {/* Semester Header */}
                        <div 
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleSemester(semester.id)}
                        >
                          <div className="flex items-center space-x-3">
                            {expanded.semesters.has(semester.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <FileText className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{semester.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {semester._count.modules} modules
                            </span>
                            {allowCreate && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateModule(semester.id);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Modules */}
                        {expanded.semesters.has(semester.id) && (
                          <div className="border-t border-gray-200 bg-gray-50">
                            {semester.modules.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                Aucun module dans ce semestre
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-200">
                                {semester.modules.map((module) => (
                                  <div 
                                    key={module.id} 
                                    className="p-3 flex items-center justify-between hover:bg-white"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <BookOpen className="h-4 w-4 text-blue-500" />
                                      <span className="font-medium">{module.name}</span>
                                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                                        <span>{module._count.lessons} leçons</span>
                                        <span>{module._count.quizzes} quiz</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Link href={`/admin/modules/${module.id}/lessons`}>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-600 hover:text-blue-700"
                                        >
                                          <List className="h-4 w-4" />
                                        </Button>
                                      </Link>
                                      {allowEdit && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditModule(module)}
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {allowDelete && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteModule(module)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Module Modal */}
      {showCreateModule && (allowCreate || allowEdit) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingModule ? 'Modifier le module' : 'Créer un nouveau module'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du module
                </label>
                <Input
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="Ex: Pharmacologie Générale"
                  error={error && !moduleName.trim() ? 'Le nom est requis' : ''}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={handleCancelModule}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitModule}
                  loading={isSubmitting}
                  disabled={isSubmitting || !moduleName.trim()}
                >
                  {editingModule ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
