/**
 * Edit Quiz Modal Component
 * Handles full editing of quiz including questions and answers
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Trash2, BookOpen, GraduationCap, Shuffle } from 'lucide-react';
import { QuizType, QuestionType } from '@prisma/client';
import { Quiz, QuizCreate, QuestionCreate, AnswerOptionCreate } from '@/services/quiz.admin.service';

interface EditQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quizData: QuizCreate) => Promise<void>;
  quiz: Quiz | null;
  resources: any;
  loading: boolean;
  error: string;
}

const QuizTypeOptions = [
  { value: 'QUIZ', label: 'Quiz de leçon', icon: BookOpen, description: 'Quiz attaché à une leçon spécifique' },
  { value: 'EXAM', label: 'Examen de module', icon: GraduationCap, description: 'Examen couvrant un module entier' },
  { value: 'SESSION', label: 'Quiz de révision', icon: Shuffle, description: 'Quiz généré à partir de plusieurs leçons' },
];

const QuestionTypeOptions = [
  { value: 'QCMA', label: 'QCM - Réponse unique (tout ou rien)' },
  { value: 'QCMP', label: 'QCM - Réponse partielle' },
  { value: 'QCS', label: 'Question à choix simple' },
  { value: 'QROC', label: 'Question à réponse ouverte courte' },
];

export default function EditQuizModal({
  isOpen,
  onClose,
  onSubmit,
  quiz,
  resources,
  loading,
  error
}: EditQuizModalProps) {
  const [quizData, setQuizData] = useState<QuizCreate>({
    title: '',
    description: '',
    type: 'QUIZ',
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

  // Initialize form data when quiz changes
  useEffect(() => {
    if (quiz && isOpen) {
      console.log('EditQuizModal - Quiz data received:', quiz);
      console.log('EditQuizModal - Questions:', quiz.questions);
      
      setQuizData({
        title: quiz.title,
        description: quiz.description || '',
        type: quiz.type,
        lessonId: quiz.lessonId,
        moduleId: quiz.moduleId,
        questionCount: quiz.questionCount,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions?.map(q => ({
          text: q.text,
          questionType: q.questionType,
          options: q.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        })) || [],
        sessionLessons: quiz.sessionLessons?.map(sl => sl.lesson.id) || [],
      });
      
      console.log('EditQuizModal - Formatted questions:', quiz.questions?.length || 0);

      // Set initial selections based on quiz data
      if (quiz.module?.semester?.studyYear) {
        setSelectedStudyYear(quiz.module.semester.studyYear.id);
        setSelectedSemester(quiz.module.semester.id);
      }
    }
  }, [quiz, isOpen]);

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
      questions: prev.questions?.map((q, i) => 
        i === questionIndex 
          ? {
              ...q,
              options: q.options.map((opt, oi) => oi === optionIndex ? { ...opt, ...updates } : opt)
            }
          : q
      ) || [],
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
          <h2 className="text-xl font-semibold">Modifier le quiz</h2>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Durée limite (minutes)</label>
                  <Input
                    type="number"
                    value={quizData.timeLimit || ''}
                    onChange={(e) => setQuizData(prev => ({ 
                      ...prev, 
                      timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Optionnel"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type de quiz</label>
                  <select
                    value={quizData.type}
                    onChange={(e) => setQuizData(prev => ({ ...prev, type: e.target.value as QuizType }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {QuizTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Questions ({quizData.questions?.length || 0})</h3>
                <Button
                  type="button"
                  onClick={addQuestion}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une question
                </Button>
              </div>

              {quizData.questions && quizData.questions.length > 0 ? 
                quizData.questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Question {qIndex + 1}</h4>
                    <div className="flex items-center gap-2">
                      <select
                        value={question.questionType}
                        onChange={(e) => updateQuestion(qIndex, { questionType: e.target.value as QuestionType })}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        {QuestionTypeOptions.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(qIndex)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Énoncé de la question *</label>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                      placeholder="Entrez l'énoncé de la question"
                      className="w-full border border-gray-300 rounded px-3 py-2 min-h-[80px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">Options de réponse</label>
                      <Button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        size="sm"
                        variant="ghost"
                        className="text-sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter une option
                      </Button>
                    </div>

                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type={question.questionType === 'QCMP' ? 'checkbox' : 'radio'}
                          name={`question-${qIndex}-correct`}
                          checked={option.isCorrect}
                          onChange={(e) => {
                            if (question.questionType === 'QCMA' || question.questionType === 'QCS') {
                              // For single choice, uncheck others
                              const updatedOptions = question.options.map((opt, i) => ({
                                ...opt,
                                isCorrect: i === oIndex ? e.target.checked : false
                              }));
                              updateQuestion(qIndex, { options: updatedOptions });
                            } else {
                              updateOption(qIndex, oIndex, { isCorrect: e.target.checked });
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <Input
                          value={option.text}
                          onChange={(e) => updateOption(qIndex, oIndex, { text: e.target.value })}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1"
                        />
                        {question.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune question ajoutée. Cliquez sur "Ajouter une question" pour commencer.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
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
                disabled={loading || !quizData.title.trim()}
              >
                {loading ? 'Modification...' : 'Modifier le Quiz'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
