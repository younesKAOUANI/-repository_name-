'use client';

import React, { useState, useEffect } from 'react';
import { QuestionType } from '@prisma/client';
import { questionBankService } from '@/services/question-bank.service';

interface StudyYear {
  id: string;
  name: string;
}

interface Module {
  id: string;
  name: string;
  semester: {
    studyYear: {
      id: string;
      name: string;
    };
  };
}

interface Lesson {
  id: string;
  title: string;
  moduleId: string;
}

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

interface QuestionBankAdminFormProps {
  onSubmit?: (questionData: any) => void;
  onCancel?: () => void;
  initialData?: any;
  submitLabel?: string;
}

const QuestionBankAdminForm: React.FC<QuestionBankAdminFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Ajouter la question'
}) => {
  const [studyYears, setStudyYears] = useState<StudyYear[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  const [formData, setFormData] = useState({
    text: initialData?.text || '',
    questionType: initialData?.questionType || QuestionType.QCMA,
    studyYearId: initialData?.studyYearId || '',
    moduleId: initialData?.moduleId || '',
    lessonId: initialData?.lessonId || '',
    difficulty: initialData?.difficulty || 'MEDIUM',
    explanation: initialData?.explanation || '',
  });

  const [options, setOptions] = useState<QuestionOption[]>(
    initialData?.options || [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudyYears();
    loadModules();
  }, []);

  useEffect(() => {
    if (formData.moduleId) {
      loadLessons(formData.moduleId);
    } else {
      setLessons([]);
      setFormData(prev => ({ ...prev, lessonId: '' }));
    }
  }, [formData.moduleId]);

  const loadStudyYears = async () => {
    try {
      const response = await fetch('/api/admin/study-years');
      if (!response.ok) throw new Error('Erreur lors du chargement des années d\'étude');
      const data = await response.json();
      setStudyYears(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadModules = async () => {
    try {
      const response = await fetch('/api/admin/modules');
      if (!response.ok) throw new Error('Erreur lors du chargement des modules');
      const data = await response.json();
      setModules(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadLessons = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}/lessons`);
      if (!response.ok) throw new Error('Erreur lors du chargement des leçons');
      const data = await response.json();
      setLessons(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredModules = formData.studyYearId 
    ? modules.filter(module => module.semester.studyYear.id === formData.studyYearId)
    : modules;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset dependent fields
    if (field === 'studyYearId') {
      setFormData(prev => ({ ...prev, moduleId: '', lessonId: '' }));
    } else if (field === 'moduleId') {
      setFormData(prev => ({ ...prev, lessonId: '' }));
    }
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions(prev => [...prev, { text: '', isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.text.trim()) {
        throw new Error('Le texte de la question est requis');
      }

      if (options.length < 2) {
        throw new Error('Au moins 2 options sont requises');
      }

      if (!options.some(opt => opt.isCorrect)) {
        throw new Error('Au moins une option doit être marquée comme correcte');
      }

      if (options.some(opt => !opt.text.trim())) {
        throw new Error('Toutes les options doivent avoir un texte');
      }

      const questionData = {
        ...formData,
        options: options.filter(opt => opt.text.trim()),
      };

      if (onSubmit) {
        await onSubmit(questionData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {initialData ? 'Modifier la question' : 'Ajouter une question à la banque'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texte de la question *
          </label>
          <textarea
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Entrez le texte de la question..."
            required
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de question *
          </label>
          <select
            value={formData.questionType}
            onChange={(e) => handleInputChange('questionType', e.target.value as QuestionType)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value={QuestionType.QCMA}>Question à choix multiples (une réponse)</option>
            <option value={QuestionType.QCMP}>Question à choix multiples (plusieurs réponses)</option>
          </select>
        </div>

        {/* Study Year Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Année d'étude
          </label>
          <select
            value={formData.studyYearId}
            onChange={(e) => handleInputChange('studyYearId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les années</option>
            {studyYears.map(year => (
              <option key={year.id} value={year.id}>{year.name}</option>
            ))}
          </select>
        </div>

        {/* Module Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Module
          </label>
          <select
            value={formData.moduleId}
            onChange={(e) => handleInputChange('moduleId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionnez un module</option>
            {filteredModules.map(module => (
              <option key={module.id} value={module.id}>
                {module.name} ({module.semester.studyYear.name})
              </option>
            ))}
          </select>
        </div>

        {/* Lesson Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leçon
          </label>
          <select
            value={formData.lessonId}
            onChange={(e) => handleInputChange('lessonId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!formData.moduleId}
          >
            <option value="">Sélectionnez une leçon</option>
            {lessons.map(lesson => (
              <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulté
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Non spécifiée</option>
            <option value="EASY">Facile</option>
            <option value="MEDIUM">Moyen</option>
            <option value="HARD">Difficile</option>
          </select>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explication (optionnelle)
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) => handleInputChange('explanation', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Explication de la réponse correcte..."
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options de réponse *
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}...`}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Ajouter une option
            </button>
          </div>
        </div>

        {/* Submit/Cancel buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionBankAdminForm;
