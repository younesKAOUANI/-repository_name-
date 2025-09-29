'use client';

import React, { useState, useEffect } from 'react';
import { studentRevisionQuizService, ModuleInfo, LessonInfo, QuestionCountInfo } from '@/services/student-revision-quiz.service';
import { QuestionType } from '@prisma/client';

interface RevisionQuizCreatorProps {
  onSessionCreated?: (sessionData: any) => void;
}

const RevisionQuizCreator: React.FC<RevisionQuizCreatorProps> = ({
  onSessionCreated
}) => {
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, LessonInfo[]>>({});
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<string>('');
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [timeLimit, setTimeLimit] = useState(15);
  const [title, setTitle] = useState('Quiz de révision');
  
  const [availableQuestions, setAvailableQuestions] = useState<QuestionCountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    if (selectedModules.length > 0 || selectedLessons.length > 0) {
      updateAvailableQuestions();
    } else {
      setAvailableQuestions(null);
    }
  }, [selectedModules, selectedLessons]);

  const loadModules = async () => {
    try {
      const moduleData = await studentRevisionQuizService.getAvailableModules();
      setModules(moduleData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadLessonsForModule = async (moduleId: string) => {
    try {
      if (!lessonsByModule[moduleId]) {
        const lessons = await studentRevisionQuizService.getLessonsForModule(moduleId);
        setLessonsByModule(prev => ({
          ...prev,
          [moduleId]: lessons
        }));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateAvailableQuestions = async () => {
    try {
      const count = await studentRevisionQuizService.getAvailableQuestionCount(
        selectedLessons,
        selectedModules
      );
      setAvailableQuestions(count);
    } catch (err: any) {
      console.error('Erreur lors de la récupération du nombre de questions:', err);
    }
  };

  const handleModuleChange = (moduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedModules(prev => [...prev, moduleId]);
      loadLessonsForModule(moduleId);
    } else {
      setSelectedModules(prev => prev.filter(id => id !== moduleId));
      // Also remove lessons from this module
      const moduleLesson = lessonsByModule[moduleId] || [];
      const moduleLessonIds = moduleLesson.map(l => l.id);
      setSelectedLessons(prev => prev.filter(id => !moduleLessonIds.includes(id)));
    }
  };

  const handleLessonChange = (lessonId: string, checked: boolean) => {
    if (checked) {
      setSelectedLessons(prev => [...prev, lessonId]);
    } else {
      setSelectedLessons(prev => prev.filter(id => id !== lessonId));
    }
  };

  const handleQuestionTypeChange = (type: QuestionType, checked: boolean) => {
    if (checked) {
      setQuestionTypes(prev => [...prev, type]);
    } else {
      setQuestionTypes(prev => prev.filter(t => t !== type));
    }
  };

  const handleCreateSession = async () => {
    if (selectedModules.length === 0 && selectedLessons.length === 0) {
      setError('Veuillez sélectionner au moins un module ou une leçon');
      return;
    }

    if (!availableQuestions || availableQuestions.totalQuestions < questionCount) {
      setError(`Seulement ${availableQuestions?.totalQuestions || 0} questions disponibles`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = await studentRevisionQuizService.createRevisionSession({
        selectedModules,
        selectedLessons,
        questionCount,
        difficulty: difficulty || undefined,
        questionTypes: questionTypes.length > 0 ? questionTypes : undefined,
        timeLimit,
        title
      });

      if (onSessionCreated) {
        onSessionCreated(session);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer un Quiz de Révision</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Selection */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du quiz
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modules
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
              {modules.map(module => (
                <label key={module.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(module.id)}
                    onChange={(e) => handleModuleChange(module.id, e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm">{module.name}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedModules.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leçons spécifiques (optionnel)
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                {selectedModules.map(moduleId => {
                  const lessons = lessonsByModule[moduleId] || [];
                  return lessons.map(lesson => (
                    <label key={lesson.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedLessons.includes(lesson.id)}
                        onChange={(e) => handleLessonChange(lesson.id, e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-xs text-gray-600">{lesson.moduleName} - {lesson.title}</span>
                    </label>
                  ));
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de questions: {questionCount}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5</span>
              <span>50</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée (minutes): {timeLimit}
            </label>
            <input
              type="range"
              min="5"
              max="60"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulté (optionnel)
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="EASY">Facile</option>
              <option value="MEDIUM">Moyen</option>
              <option value="HARD">Difficile</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types de questions (optionnel)
            </label>
            <div className="space-y-2">
              {(['QCMA', 'QCMP', 'QCS', 'QROC'] as QuestionType[]).map(type => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={questionTypes.includes(type)}
                    onChange={(e) => handleQuestionTypeChange(type, e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {availableQuestions && (
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-medium text-blue-800">Questions disponibles</h4>
              <p className="text-sm text-blue-600">
                Total: {availableQuestions.totalQuestions} questions
              </p>
              {Object.keys(availableQuestions.byDifficulty).length > 0 && (
                <p className="text-xs text-blue-500">
                  Par difficulté: {Object.entries(availableQuestions.byDifficulty)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleCreateSession}
          disabled={loading || !availableQuestions || availableQuestions.totalQuestions < questionCount}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Création...' : 'Créer le Quiz'}
        </button>
      </div>
    </div>
  );
};

export default RevisionQuizCreator;
