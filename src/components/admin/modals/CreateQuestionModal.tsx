/**
 * Create Question Modal
 * Modal for creating new questions in the question bank
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Plus, 
  Trash2, 
  Save,
  AlertCircle 
} from 'lucide-react';
import { QuestionType } from '@prisma/client';
import { QuestionBankCreate } from '@/hooks/useQuestionBankAdmin';

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionBankCreate) => Promise<void>;
  resources?: any;
  loading?: boolean;
  error?: string;
}

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export default function CreateQuestionModal({
  isOpen,
  onClose,
  onSubmit,
  resources,
  loading = false,
  error
}: CreateQuestionModalProps) {
  const [formData, setFormData] = useState<QuestionBankCreate>({
    text: '',
    questionType: 'QCMA',
    lessonId: undefined,
    moduleId: undefined,
    difficulty: undefined,
    explanation: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
  });
  
  const [selectedStudyYearId, setSelectedStudyYearId] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        text: '',
        questionType: 'QCMA',
        lessonId: undefined,
        moduleId: undefined,
        difficulty: undefined,
        explanation: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      });
      setSelectedStudyYearId('');
      setValidationErrors([]);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof QuestionBankCreate, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };
      
      // When changing question type, reset options appropriately
      if (field === 'questionType') {
        if (value === 'QROC') {
          // For QROC, we only need one option with isCorrect = true
          newData.options = [{ text: '', isCorrect: true }];
        } else if (prev.questionType === 'QROC') {
          // When switching from QROC to other types, reset to default options
          newData.options = [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ];
        }
      }
      
      return newData;
    });
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: any) => {
    const newOptions = [...formData.options];
    
    // For QCS (single choice), uncheck all other options when one is checked
    if (formData.questionType === 'QCS' && field === 'isCorrect' && value === true) {
      newOptions.forEach((opt, i) => {
        if (i !== index) {
          opt.isCorrect = false;
        }
      });
    }
    
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      options: newOptions,
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.text.trim()) {
      errors.push('Le texte de la question est requis');
    }

    // Validation for QROC type
    if (formData.questionType === 'QROC') {
      if (!formData.options[0]?.text?.trim()) {
        errors.push('La réponse attendue est requise pour les questions QROC');
      }
    } else {
      // Validation for other question types (QCMA, QCMP, QCS)
      if (formData.options.length < 2) {
        errors.push('Au moins 2 options sont requises');
      }

      const filledOptions = formData.options.filter(opt => opt.text.trim());
      if (filledOptions.length < 2) {
        errors.push('Au moins 2 options doivent avoir du texte');
      }

      const correctOptions = formData.options.filter(opt => opt.isCorrect && opt.text.trim());
      if (correctOptions.length === 0) {
        errors.push('Au moins une option doit être marquée comme correcte');
      }

      // For QCS, ensure only one correct answer
      if (formData.questionType === 'QCS' && correctOptions.length > 1) {
        errors.push('Pour les questions à choix simple, une seule option peut être correcte');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Filter out empty options (but keep QROC single option)
      let filteredOptions;
      if (formData.questionType === 'QROC') {
        // For QROC, ensure the single option has isCorrect = true
        filteredOptions = [{
          text: formData.options[0].text.trim(),
          isCorrect: true
        }];
      } else {
        // For other types, filter out empty options
        filteredOptions = formData.options.filter(opt => opt.text.trim());
      }
      
      const submitData = {
        ...formData,
        options: filteredOptions,
      };
      
      console.log('Creating question with data:', submitData);
      await onSubmit(submitData);
      console.log('Question created successfully');
      onClose(); // Ensure modal closes after successful creation
    } catch (err) {
      console.error('Error creating question:', err);
    }
  };

  const getAllModules = () => {
    if (!resources?.studyYears || !selectedStudyYearId) return [];
    
    const studyYear = resources.studyYears.find((sy: any) => sy.id === selectedStudyYearId);
    if (!studyYear) return [];
    
    const allModules: any[] = [];
    studyYear.semesters?.forEach((semester: any) => {
      if (semester.modules) {
        allModules.push(...semester.modules);
      }
    });
    
    return allModules.sort((a: any, b: any) => a.name.localeCompare(b.name));
  };

  const getFilteredLessons = () => {
    if (!resources?.studyYears || !formData.moduleId || !selectedStudyYearId) return [];
    
    const studyYear = resources.studyYears.find((sy: any) => sy.id === selectedStudyYearId);
    if (!studyYear) return [];
    
    const allLessons: any[] = [];
    studyYear.semesters?.forEach((semester: any) => {
      semester.modules?.forEach((module: any) => {
        if (module.id === formData.moduleId) {
          allLessons.push(...(module.lessons || []));
        }
      });
    });
    
    return allLessons.sort((a: any, b: any) => a.title.localeCompare(b.title));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Ajouter une Question
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Erreurs de validation:
                  </h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Server Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte de la Question *
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez le texte de votre question..."
            />
          </div>

          {/* Study Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Année d'étude (Optionnel)
            </label>
            <select
              value={selectedStudyYearId}
              onChange={(e) => {
                setSelectedStudyYearId(e.target.value);
                handleInputChange('moduleId', undefined);
                handleInputChange('lessonId', undefined);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une année...</option>
              {resources?.studyYears?.map((studyYear: any) => (
                <option key={studyYear.id} value={studyYear.id}>
                  {studyYear.name}
                </option>
              ))}
            </select>
          </div>

          {/* Module Selection */}
          {selectedStudyYearId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module (Optionnel)
              </label>
              <select
                value={formData.moduleId || ''}
                onChange={(e) => {
                  const moduleId = e.target.value || undefined;
                  handleInputChange('moduleId', moduleId);
                  handleInputChange('lessonId', undefined); // Clear lesson when module changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un module...</option>
                {getAllModules().map((module: any) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lesson Selection */}
          {formData.moduleId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leçon (Optionnel)
              </label>
              <select
                value={formData.lessonId || ''}
                onChange={(e) => {
                  const lessonId = e.target.value || undefined;
                  handleInputChange('lessonId', lessonId);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une leçon...</option>
                {getFilteredLessons().map((lesson: any) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de Question *
            </label>
            <select
              value={formData.questionType}
              onChange={(e) => handleInputChange('questionType', e.target.value as QuestionType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="QCMA">QCM Tout ou Rien</option>
              <option value="QCMP">QCM Partiel</option>
              <option value="QCS">Question à Choix Simple</option>
              <option value="QROC">Question à Réponse Ouverte Courte</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulté (Optionnel)
            </label>
            <select
              value={formData.difficulty || ''}
              onChange={(e) => handleInputChange('difficulty', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une difficulté...</option>
              <option value="EASY">Facile</option>
              <option value="MEDIUM">Moyen</option>
              <option value="HARD">Difficile</option>
            </select>
          </div>

          {/* Options - Different UI based on question type */}
          <div>
            {formData.questionType === 'QROC' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réponse attendue *
                </label>
                <Input
                  value={formData.options[0]?.text || ''}
                  onChange={(e) => handleOptionChange(0, 'text', e.target.value)}
                  placeholder="Entrez la réponse correcte"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  La réponse de l'étudiant sera comparée à cette réponse attendue
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.questionType === 'QCS' ? 'Options de réponse (une seule correcte) *' : 'Options de Réponse *'}
                  </label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addOption}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter Option
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      {formData.questionType === 'QCS' ? (
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={option.isCorrect}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      )}
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}...`}
                        className="flex-1"
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Helper text based on question type */}
                <div className="mt-2 text-xs text-gray-500">
                  {formData.questionType === 'QCMA' && (
                    <p>📝 QCM Tout ou rien : L'étudiant doit cocher toutes les bonnes réponses pour avoir des points</p>
                  )}
                  {formData.questionType === 'QCMP' && (
                    <p>📊 QCM Points partiels : L'étudiant gagne des points pour chaque bonne réponse cochée</p>
                  )}
                  {formData.questionType === 'QCS' && (
                    <p>🎯 Choix simple : L'étudiant ne peut sélectionner qu'une seule réponse</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explication (Optionnel)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Explication de la réponse correcte..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? 'Création...' : 'Créer la Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
