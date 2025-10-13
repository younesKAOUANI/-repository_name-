/**
 * Create Quiz Modal Component
 * Handles creation of examens de module
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Trash2, BookOpen, GraduationCap, Shuffle } from 'lucide-react';
import { QuizType, QuestionType } from '@prisma/client';
import { QuizCreate, QuestionCreate, AnswerOptionCreate } from '@/services/quiz.admin.service';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quizData: QuizCreate) => Promise<void>;
  resources: any;
  loading: boolean;
  error: string;
}

const QuizTypeOptions = [
  { value: 'EXAM', label: 'Examen de module', icon: GraduationCap, description: 'Examen couvrant un module entier' },
];

const QuestionTypeOptions = [
  { value: 'QCMA', label: 'QCM (Tout ou rien)' },
  { value: 'QCMP', label: 'QCM (Points partiels)' },
  { value: 'QCS', label: 'Question à choix simple' },
  { value: 'QROC', label: 'Question à réponse ouverte courte' },
];

export default function CreateQuizModal({
  isOpen,
  onClose,
  onSubmit,
  resources,
  loading,
  error,
}: CreateQuizModalProps) {
  const [quizData, setQuizData] = useState<QuizCreate>({
    title: '',
    description: '',
    type: 'EXAM',
    lessonId: undefined,
    moduleId: undefined,
    questionCount: 20,
    timeLimit: undefined,
    questions: [],
    sessionLessons: [],
  });

  const [selectedStudyYear, setSelectedStudyYear] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);

  // Update available options when selections change
  useEffect(() => {
    if (!resources) return;

    if (selectedStudyYear) {
      const studyYear = resources.studyYears.find((sy: any) => sy.id === selectedStudyYear);
      if (selectedSemester) {
        const semester = studyYear?.semesters.find((sem: any) => sem.id === selectedSemester);
        setAvailableModules(semester?.modules || []);
        
        if (quizData.moduleId) {
          const module = semester?.modules.find((mod: any) => mod.id === quizData.moduleId);
          setAvailableLessons(module?.lessons || []);
        }
      } else {
        setAvailableModules(studyYear?.semesters.flatMap((sem: any) => sem.modules) || []);
      }
    }
  }, [selectedStudyYear, selectedSemester, quizData.moduleId, resources]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(quizData);
  };

  const addQuestion = () => {
    const newQuestion: QuestionCreate = {
      text: '',
      questionType: 'QCMA',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    };
    setQuizData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion],
    }));
  };

  const updateQuestionType = (questionIndex: number, newType: string) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => {
        if (i !== questionIndex) return q;
        
        let newOptions = q.options;
        
        // Adjust options based on question type
        if (newType === 'QROC') {
          // Short answer - no options, just expected answer
          newOptions = [{ text: '', isCorrect: true }];
        } else if (newType === 'QCS') {
          // Single choice - ensure only one is correct
          newOptions = q.options.length > 0 
            ? q.options.map((opt, idx) => ({ ...opt, isCorrect: idx === 0 }))
            : [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
              ];
        } else {
          // QCMA or QCMP - multiple choice, keep existing options or create defaults
          if (q.options.length === 0) {
            newOptions = [
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
            ];
          }
        }
        
        return {
          ...q,
          questionType: newType as QuestionType,
          options: newOptions
        };
      }) || [],
    }));
  };

  const updateQuestion = (index: number, updates: Partial<QuestionCreate>) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => i === index ? { ...q, ...updates } : q) || [],
    }));
  };

  const removeQuestion = (index: number) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, updates: Partial<AnswerOptionCreate>) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => {
        if (i !== questionIndex) return q;
        
        let updatedOptions = q.options.map((opt, oi) => oi === optionIndex ? { ...opt, ...updates } : opt);
        
        // For QCS (single choice), only one option can be correct
        if (q.questionType === 'QCS' && updates.isCorrect) {
          updatedOptions = updatedOptions.map((opt, oi) => ({
            ...opt,
            isCorrect: oi === optionIndex
          }));
        }
        
        return {
          ...q,
          options: updatedOptions
        };
      }) || [],
    }));
  };

  const addOption = (questionIndex: number) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => 
        i === questionIndex 
          ? {
              ...q,
              options: [...q.options, { text: '', isCorrect: false }]
            }
          : q
      ) || [],
    }));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => 
        i === questionIndex 
          ? {
              ...q,
              options: q.options.filter((_, oi) => oi !== optionIndex)
            }
          : q
      ) || [],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Créer un nouveau quiz</h2>
          <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations générales</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Titre du quiz *</label>
                <Input
                  value={quizData.title}
                  onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Entrez le titre du quiz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={quizData.description || ''}
                  onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description optionnelle du quiz"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type d'évaluation</label>
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-800">Examen de module</div>
                      <div className="text-sm text-blue-600">Examen couvrant un module entier</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-sm font-medium mb-2">Durée limite (minutes)</label>
                <Input
                  type="number"
                  value={quizData.timeLimit || ''}
                  onChange={(e) => setQuizData(prev => ({ 
                    ...prev, 
                    timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="Durée en minutes (optionnel)"
                  min="1"
                />
              </div>
            </div>

            {/* Location Selection */}
            {(quizData.type === 'QUIZ' || quizData.type === 'EXAM') && resources && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Localisation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Année d'étude</label>
                    <select
                      value={selectedStudyYear || ''}
                      onChange={(e) => {
                        const value = e.target.value || null;
                        setSelectedStudyYear(value);
                        setSelectedSemester(null);
                        setQuizData(prev => ({ ...prev, moduleId: undefined, lessonId: undefined }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Sélectionner une année</option>
                      {resources.studyYears.map((studyYear: any) => (
                        <option key={studyYear.id} value={studyYear.id}>
                          {studyYear.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Semestre</label>
                    <select
                      value={selectedSemester || ''}
                      onChange={(e) => {
                        const value = e.target.value || null;
                        setSelectedSemester(value);
                        setQuizData(prev => ({ ...prev, moduleId: undefined, lessonId: undefined }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      disabled={!selectedStudyYear}
                      required
                    >
                      <option value="">Sélectionner un semestre</option>
                      {selectedStudyYear && 
                        resources.studyYears
                          .find((sy: any) => sy.id === selectedStudyYear)
                          ?.semesters.map((semester: any) => (
                            <option key={semester.id} value={semester.id}>
                              {semester.name}
                            </option>
                          ))
                      }
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Module</label>
                  <select
                    value={quizData.moduleId || ''}
                    onChange={(e) => {
                      const value = e.target.value || undefined;
                      setQuizData(prev => ({ ...prev, moduleId: value, lessonId: undefined }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    disabled={!selectedSemester}
                    required
                  >
                    <option value="">Sélectionner un module</option>
                    {availableModules.map((module: any) => (
                      <option key={module.id} value={module.id}>
                        {module.name}
                      </option>
                    ))}
                  </select>
                </div>

                {quizData.type === 'QUIZ' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Leçon</label>
                    <select
                      value={quizData.lessonId || ''}
                      onChange={(e) => {
                        const value = e.target.value || undefined;
                        setQuizData(prev => ({ ...prev, lessonId: value }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      disabled={!quizData.moduleId}
                      required
                    >
                      <option value="">Sélectionner une leçon</option>
                      {availableLessons.map((lesson: any) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Session Quiz Options */}
            {quizData.type === 'SESSION' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Options du quiz de révision</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre de questions (15-50)</label>
                  <Input
                    type="number"
                    value={quizData.questionCount || 20}
                    onChange={(e) => setQuizData(prev => ({ 
                      ...prev, 
                      questionCount: parseInt(e.target.value) || 20 
                    }))}
                    min="15"
                    max="50"
                    required
                  />
                </div>

                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Shuffle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Les questions seront générées automatiquement à partir des leçons sélectionnées
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Vous pourrez choisir les leçons sources après avoir créé le quiz
                  </p>
                </div>
              </div>
            )}

            {/* Questions */}
            {quizData.type !== 'SESSION' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Questions</h3>
                  <Button type="button" onClick={addQuestion} variant="secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une question
                  </Button>
                </div>

                {quizData.questions?.map((question, questionIndex) => (
                  <div key={questionIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Question {questionIndex + 1}
                          </label>
                          <textarea
                            value={question.text}
                            onChange={(e) => updateQuestion(questionIndex, { text: e.target.value })}
                            placeholder="Tapez votre question ici..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Type de question</label>
                          <select
                            value={question.questionType}
                            onChange={(e) => updateQuestionType(questionIndex, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          >
                            {QuestionTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Answer Options - Different UI based on question type */}
                        {question.questionType === 'QROC' ? (
                          <div>
                            <label className="block text-sm font-medium mb-2">Réponse attendue</label>
                            <Input
                              value={question.options[0]?.text || ''}
                              onChange={(e) => updateOption(questionIndex, 0, { text: e.target.value })}
                              placeholder="Entrez la réponse correcte"
                              className="w-full"
                              required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              La réponse de l'étudiant sera comparée à cette réponse attendue
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium">
                                {question.questionType === 'QCS' ? 'Options de réponse (une seule correcte)' : 'Options de réponse'}
                              </label>
                              <Button
                                type="button"
                                onClick={() => addOption(questionIndex)}
                                variant="secondary"
                                size="sm"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Ajouter
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  {question.questionType === 'QCS' ? (
                                    <input
                                      type="radio"
                                      name={`question_${questionIndex}_correct`}
                                      checked={option.isCorrect}
                                      onChange={(e) => updateOption(questionIndex, optionIndex, { isCorrect: e.target.checked })}
                                      className="rounded"
                                    />
                                  ) : (
                                    <input
                                      type="checkbox"
                                      checked={option.isCorrect}
                                      onChange={(e) => updateOption(questionIndex, optionIndex, { isCorrect: e.target.checked })}
                                      className="rounded"
                                    />
                                  )}
                                  <Input
                                    value={option.text}
                                    onChange={(e) => updateOption(questionIndex, optionIndex, { text: e.target.value })}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="flex-1"
                                    required
                                  />
                                  {question.options.length > 2 && (
                                    <Button
                                      type="button"
                                      onClick={() => removeOption(questionIndex, optionIndex)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Helper text based on question type */}
                            <div className="mt-2 text-sm text-gray-500">
                              {question.questionType === 'QCMA' && (
                                <p>📝 QCM Tout ou rien : L'étudiant doit cocher toutes les bonnes réponses pour avoir des points</p>
                              )}
                              {question.questionType === 'QCMP' && (
                                <p>📊 QCM Points partiels : L'étudiant gagne des points pour chaque bonne réponse cochée</p>
                              )}
                              {question.questionType === 'QCS' && (
                                <p>🎯 Choix simple : L'étudiant ne peut sélectionner qu'une seule réponse</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        type="button" 
                        onClick={() => removeQuestion(questionIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {(!quizData.questions || quizData.questions.length === 0) && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune question ajoutée</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Cliquez sur "Ajouter une question" pour commencer
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="secondary" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer le quiz'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
