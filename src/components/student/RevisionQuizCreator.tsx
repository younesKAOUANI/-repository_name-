'use client';

import React, { useState, useEffect } from 'react';
import { studentRevisionQuizService, ModuleInfo, LessonInfo, QuestionCountInfo } from '@/services/student-revision-quiz.service';
import { QuestionType } from '@prisma/client';
import { ChevronDown, ChevronRight, Book, FileText, Users, Clock, CheckCircle } from 'lucide-react';

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
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['EASY', 'MEDIUM', 'HARD']);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['QCMA', 'QCMP', 'QCS', 'QROC']);
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
  }, [selectedModules, selectedLessons, selectedDifficulties, questionTypes]);

  const loadModules = async () => {
    try {
      const moduleData = await studentRevisionQuizService.getAvailableModules();
      console.log('Modules chargés:', moduleData);
      setModules(moduleData);
    } catch (err: any) {
      console.error('Erreur lors du chargement des modules:', err);
      setError(`Erreur lors du chargement des modules: ${err.message}`);
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
        
        // If module is selected, auto-select its lessons
        if (selectedModules.includes(moduleId)) {
          const lessonIds = lessons.map(l => l.id);
          setSelectedLessons(prev => [...new Set([...prev, ...lessonIds])]);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleModuleExpansion = async (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (expandedModules.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
      // Load lessons when expanding
      if (!lessonsByModule[moduleId]) {
        await loadLessonsForModule(moduleId);
      }
    }
    setExpandedModules(newExpanded);
  };

  const toggleAllLessonsInModule = (moduleId: string, selectAll: boolean) => {
    const lessons = lessonsByModule[moduleId] || [];
    const lessonIds = lessons.map(l => l.id);
    
    if (selectAll) {
      setSelectedLessons(prev => [...new Set([...prev, ...lessonIds])]);
    } else {
      setSelectedLessons(prev => prev.filter(id => !lessonIds.includes(id)));
    }
  };

  const updateAvailableQuestions = async () => {
    try {
      const count = await studentRevisionQuizService.getAvailableQuestionCount(
        selectedLessons,
        selectedModules,
        selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
        questionTypes.length > 0 ? questionTypes : undefined
      );
      setAvailableQuestions(count);
    } catch (err: any) {
      console.error('Erreur lors de la récupération du nombre de questions:', err);
    }
  };

  const handleModuleChange = async (moduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedModules(prev => [...prev, moduleId]);
      // Expand the module to show lessons
      setExpandedModules(prev => new Set([...prev, moduleId]));
      
      // Load lessons if not already loaded
      if (!lessonsByModule[moduleId]) {
        await loadLessonsForModule(moduleId);
      }
      
      // Auto-select all lessons from this module
      const moduleLesson = lessonsByModule[moduleId] || [];
      const moduleLessonIds = moduleLesson.map(l => l.id);
      setSelectedLessons(prev => [...new Set([...prev, ...moduleLessonIds])]);
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

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    if (checked) {
      setSelectedDifficulties(prev => [...prev, difficulty]);
    } else {
      setSelectedDifficulties(prev => prev.filter(d => d !== difficulty));
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
        difficulty: selectedDifficulties.length > 0 ? selectedDifficulties[0] : undefined, // For backward compatibility, use first difficulty
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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Book className="h-6 w-6 mr-2 text-blue-600" />
          Créer un Quiz de Révision
        </h2>
        <p className="text-gray-600 mt-1">
          Sélectionnez les modules et leçons pour créer votre quiz personnalisé
        </p>
      </div>
      
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
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Book className="inline-block h-4 w-4 mr-1" />
              Sélection des Modules et Leçons
            </label>
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {modules.length === 0 ? (
                <div className="text-gray-500 text-sm p-6 text-center">
                  <Book className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  Aucun module disponible. Vérifiez que vous avez accès aux modules requis.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {modules.map(module => {
                    const isSelected = selectedModules.includes(module.id);
                    const isExpanded = expandedModules.has(module.id);
                    const lessons = lessonsByModule[module.id] || [];
                    const selectedLessonsCount = lessons.filter(l => selectedLessons.includes(l.id)).length;
                    
                    return (
                      <div key={module.id} className="bg-white">
                        {/* Module Header */}
                        <div className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleModuleChange(module.id, e.target.checked)}
                              className="rounded text-blue-600 mr-3 h-4 w-4"
                            />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <Book className="h-4 w-4 text-blue-600 mr-2" />
                                <span className="font-medium text-gray-900">{module.name}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                {module.description && (
                                  <span className="mr-2">{module.description}</span>
                                )}
                                {lessons.length > 0 && (
                                  <span className="flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {lessons.length} leçon{lessons.length > 1 ? 's' : ''}
                                    {isSelected && selectedLessonsCount > 0 && (
                                      <span className="ml-1 text-blue-600">
                                        ({selectedLessonsCount} sélectionnée{selectedLessonsCount > 1 ? 's' : ''})
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => toggleModuleExpansion(module.id)}
                            className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                        
                        {/* Lessons List */}
                        {isExpanded && (
                          <div className="bg-gray-50 border-t border-gray-100">
                            {lessons.length === 0 ? (
                              <div className="p-4 text-gray-500 text-sm text-center">
                                <FileText className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                                Aucune leçon disponible pour ce module
                              </div>
                            ) : (
                              <div className="p-2">
                                <div className="flex items-center justify-between mb-2 px-2">
                                  <div className="text-xs font-medium text-gray-600">
                                    Leçons ({lessons.length})
                                  </div>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => toggleAllLessonsInModule(module.id, true)}
                                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                                    >
                                      Tout sélectionner
                                    </button>
                                    <button
                                      onClick={() => toggleAllLessonsInModule(module.id, false)}
                                      className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                                    >
                                      Désélectionner
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                  {lessons.map(lesson => (
                                    <label 
                                      key={lesson.id} 
                                      className="flex items-center space-x-2 p-2 hover:bg-white rounded transition-colors cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedLessons.includes(lesson.id)}
                                        onChange={(e) => handleLessonChange(lesson.id, e.target.checked)}
                                        className="rounded text-blue-600 h-3 w-3"
                                      />
                                      <FileText className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                      <span className="text-sm text-gray-700 flex-1">
                                        {lesson.title}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Selection Summary */}
            {(selectedModules.length > 0 || selectedLessons.length > 0) && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800 font-medium">Sélection actuelle:</div>
                <div className="text-xs text-blue-600 mt-1">
                  {selectedModules.length} module{selectedModules.length > 1 ? 's' : ''} • {selectedLessons.length} leçon{selectedLessons.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Niveaux de Difficulté
              </label>
              <div className="flex space-x-1">
                <button
                  onClick={() => setSelectedDifficulties(['EASY', 'MEDIUM', 'HARD'])}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                >
                  Tout
                </button>
                <button
                  onClick={() => setSelectedDifficulties([])}
                  className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Aucun
                </button>
              </div>
            </div>
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {[
                { value: 'EASY', label: 'Facile', color: 'text-green-600' },
                { value: 'MEDIUM', label: 'Moyen', color: 'text-yellow-600' },
                { value: 'HARD', label: 'Difficile', color: 'text-red-600' }
              ].map(diff => (
                <label key={diff.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes(diff.value)}
                    onChange={(e) => handleDifficultyChange(diff.value, e.target.checked)}
                    className="rounded text-blue-600 h-4 w-4"
                  />
                  <span className={`text-sm font-medium ${diff.color}`}>{diff.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Types de Questions
              </label>
              <div className="flex space-x-1">
                <button
                  onClick={() => setQuestionTypes(['QCMA', 'QCMP', 'QCS', 'QROC'])}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                >
                  Tout
                </button>
                <button
                  onClick={() => setQuestionTypes([])}
                  className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Aucun
                </button>
              </div>
            </div>
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {([
                { value: 'QCMA' as QuestionType, label: 'QCM à Réponse Unique', description: 'Une seule bonne réponse' },
                { value: 'QCMP' as QuestionType, label: 'QCM à Réponses Multiples', description: 'Plusieurs bonnes réponses' },
                { value: 'QCS' as QuestionType, label: 'Questions Cas Spécifiques', description: 'Cas cliniques ou pratiques' },
                { value: 'QROC' as QuestionType, label: 'Questions à Réponse Ouverte Courte', description: 'Réponses textuelles brèves' }
              ]).map(type => (
                <label key={type.value} className="flex items-start space-x-2 cursor-pointer p-2 rounded hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={questionTypes.includes(type.value)}
                    onChange={(e) => handleQuestionTypeChange(type.value, e.target.checked)}
                    className="rounded text-blue-600 h-4 w-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {availableQuestions && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-800">Questions Disponibles</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Total avec filtres:</span>
                  <span className="font-semibold text-blue-800 bg-blue-100 px-3 py-1 rounded">
                    {availableQuestions.totalQuestions}
                  </span>
                </div>
                
                {/* Difficulty breakdown */}
                {Object.keys(availableQuestions.byDifficulty).length > 0 && (
                  <div className="pt-2 border-t border-blue-200">
                    <div className="text-xs text-blue-600 mb-2">Répartition par difficulté:</div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(availableQuestions.byDifficulty).map(([key, value]) => {
                        const isSelected = selectedDifficulties.includes(key);
                        const diffColor = key === 'EASY' ? 'bg-green-100 text-green-800' : 
                                         key === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 
                                         'bg-red-100 text-red-800';
                        return (
                          <div key={key} className={`text-xs px-2 py-1 rounded border ${isSelected ? diffColor : 'bg-gray-100 text-gray-500'}`}>
                            {key === 'EASY' ? 'Facile' : key === 'MEDIUM' ? 'Moyen' : 'Difficile'}: {value}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Question type breakdown */}
                {Object.keys(availableQuestions.byType).length > 0 && (
                  <div className="pt-2 border-t border-blue-200">
                    <div className="text-xs text-blue-600 mb-2">Répartition par type:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(availableQuestions.byType).map(([key, value]) => {
                        const isSelected = questionTypes.includes(key as QuestionType);
                        return (
                          <div key={key} className={`text-xs px-2 py-1 rounded border ${isSelected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                            {key}: {value}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {questionCount > availableQuestions.totalQuestions && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-2 flex items-center">
                    <span className="text-red-500 mr-1">⚠️</span>
                    Vous avez sélectionné plus de questions ({questionCount}) que disponibles ({availableQuestions.totalQuestions})
                  </div>
                )}
                
                {availableQuestions.totalQuestions === 0 && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 mt-2 flex items-center">
                    <span className="text-amber-500 mr-1">⚠️</span>
                    Aucune question disponible avec les filtres actuels
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedModules.length === 0 && selectedLessons.length === 0 ? (
              <span className="text-red-600">⚠️ Sélectionnez au moins un module ou une leçon</span>
            ) : availableQuestions?.totalQuestions === 0 ? (
              <span className="text-red-600">⚠️ Aucune question disponible pour la sélection actuelle</span>
            ) : availableQuestions && questionCount > availableQuestions.totalQuestions ? (
              <span className="text-red-600">⚠️ Questions demandées: {questionCount} | Disponibles: {availableQuestions.totalQuestions}</span>
            ) : (
              <span className="text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Prêt à créer {questionCount} questions sur {availableQuestions?.totalQuestions || 0} disponibles
              </span>
            )}
          </div>
          <button
            onClick={handleCreateSession}
            disabled={loading || !availableQuestions || availableQuestions.totalQuestions < questionCount || (selectedModules.length === 0 && selectedLessons.length === 0)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Book className="h-4 w-4 mr-2" />
                Créer le Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevisionQuizCreator;
