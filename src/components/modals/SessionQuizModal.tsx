/**
 * Session Quiz Modal Component
 * Handles creation of SESSION type quizzes with customizable question selection
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Shuffle, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { SessionQuizOptions, Question } from '@/services/quiz.admin.service';

interface SessionQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: any;
  sessionOptions: SessionQuizOptions;
  setSessionOptions: (options: Partial<SessionQuizOptions>) => void;
  onGenerateQuiz: () => Promise<void>;
  onCreateQuiz: (title: string, description?: string) => Promise<void>;
  sessionQuestions: Question[];
  loading: boolean;
  loadingSession: boolean;
  error: string;
}

export default function SessionQuizModal({
  isOpen,
  onClose,
  resources,
  sessionOptions,
  setSessionOptions,
  onGenerateQuiz,
  onCreateQuiz,
  sessionQuestions,
  loading,
  loadingSession,
  error,
}: SessionQuizModalProps) {
  const [step, setStep] = useState<'selection' | 'preview' | 'create'>('selection');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [selectedStudyYears, setSelectedStudyYears] = useState<number[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([]);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);

  // Update session options when selections change
  useEffect(() => {
    setSessionOptions({
      selectedLessons,
      selectedModules,
      selectedSemesters: selectedSemesters,
    });
  }, [selectedStudyYears, selectedSemesters, selectedModules, selectedLessons, setSessionOptions]);

  const handleStudyYearToggle = (studyYearId: number) => {
    const isSelected = selectedStudyYears.includes(studyYearId);
    if (isSelected) {
      setSelectedStudyYears(prev => prev.filter(id => id !== studyYearId));
      // Remove related semesters and modules
      const studyYear = resources?.studyYears.find((sy: any) => sy.id === studyYearId);
      if (studyYear) {
        const semesterIds = studyYear.semesters.map((sem: any) => sem.id);
        setSelectedSemesters(prev => prev.filter(id => !semesterIds.includes(id)));
        
        const moduleIds = studyYear.semesters.flatMap((sem: any) => 
          sem.modules.map((mod: any) => mod.id)
        );
        setSelectedModules(prev => prev.filter(id => !moduleIds.includes(id)));
        
        const lessonIds = studyYear.semesters.flatMap((sem: any) => 
          sem.modules.flatMap((mod: any) => mod.lessons.map((lesson: any) => lesson.id))
        );
        setSelectedLessons(prev => prev.filter(id => !lessonIds.includes(id)));
      }
    } else {
      setSelectedStudyYears(prev => [...prev, studyYearId]);
    }
  };

  const handleSemesterToggle = (semesterId: number) => {
    const isSelected = selectedSemesters.includes(semesterId);
    if (isSelected) {
      setSelectedSemesters(prev => prev.filter(id => id !== semesterId));
      // Remove related modules and lessons
      const semester = resources?.studyYears
        .flatMap((sy: any) => sy.semesters)
        .find((sem: any) => sem.id === semesterId);
      if (semester) {
        const moduleIds = semester.modules.map((mod: any) => mod.id);
        setSelectedModules(prev => prev.filter(id => !moduleIds.includes(id)));
        
        const lessonIds = semester.modules.flatMap((mod: any) => 
          mod.lessons.map((lesson: any) => lesson.id)
        );
        setSelectedLessons(prev => prev.filter(id => !lessonIds.includes(id)));
      }
    } else {
      setSelectedSemesters(prev => [...prev, semesterId]);
    }
  };

  const handleModuleToggle = (moduleId: number) => {
    const isSelected = selectedModules.includes(moduleId);
    if (isSelected) {
      setSelectedModules(prev => prev.filter(id => id !== moduleId));
      // Remove related lessons
      const module = resources?.studyYears
        .flatMap((sy: any) => sy.semesters)
        .flatMap((sem: any) => sem.modules)
        .find((mod: any) => mod.id === moduleId);
      if (module) {
        const lessonIds = module.lessons.map((lesson: any) => lesson.id);
        setSelectedLessons(prev => prev.filter(id => !lessonIds.includes(id)));
      }
    } else {
      setSelectedModules(prev => [...prev, moduleId]);
    }
  };

  const handleLessonToggle = (lessonId: number) => {
    const isSelected = selectedLessons.includes(lessonId);
    if (isSelected) {
      setSelectedLessons(prev => prev.filter(id => id !== lessonId));
    } else {
      setSelectedLessons(prev => [...prev, lessonId]);
    }
  };

  const handleGenerateQuiz = async () => {
    await onGenerateQuiz();
    if (sessionQuestions.length > 0) {
      setStep('preview');
    }
  };

  const handleCreateQuiz = async () => {
    await onCreateQuiz(quizTitle, quizDescription);
    resetModal();
  };

  const resetModal = () => {
    setStep('selection');
    setQuizTitle('');
    setQuizDescription('');
    setSelectedStudyYears([]);
    setSelectedSemesters([]);
    setSelectedModules([]);
    setSelectedLessons([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getTotalSelections = () => {
    return selectedStudyYears.length + selectedSemesters.length + 
           selectedModules.length + selectedLessons.length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Shuffle className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold">Quiz de révision</h2>
              <p className="text-sm text-gray-600">
                {step === 'selection' && 'Sélectionnez les sources de questions'}
                {step === 'preview' && 'Prévisualisation des questions générées'}
                {step === 'create' && 'Finaliser le quiz'}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center gap-2 ${step === 'selection' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'selection' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Sélection</span>
            </div>
            <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'preview' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Prévisualisation</span>
            </div>
            <div className={`flex items-center gap-2 ${step === 'create' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'create' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Création</span>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Selection */}
          {step === 'selection' && (
            <div className="space-y-6">
              {/* Quiz Settings */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Paramètres du quiz</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre de questions (15-50)
                    </label>
                    <Input
                      type="number"
                      value={sessionOptions.questionCount}
                      onChange={(e) => setSessionOptions({ 
                        questionCount: Math.min(50, Math.max(15, parseInt(e.target.value) || 15)) 
                      })}
                      min="15"
                      max="50"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Durée limite (minutes) - Optionnel
                    </label>
                    <Input
                      type="number"
                      value={sessionOptions.timeLimit || ''}
                      onChange={(e) => setSessionOptions({ 
                        timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="Illimitée"
                      min="1"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Source Selection */}
              <div>
                <h3 className="font-medium mb-4">
                  Sources des questions ({getTotalSelections()} sélection{getTotalSelections() > 1 ? 's' : ''})
                </h3>
                
                {resources?.studyYears.map((studyYear: any) => (
                  <div key={studyYear.id} className="border rounded-lg mb-4">
                    {/* Study Year Header */}
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleStudyYearToggle(studyYear.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudyYears.includes(studyYear.id)}
                        onChange={() => {}}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{studyYear.name}</h4>
                        <p className="text-sm text-gray-600">
                          {studyYear.semesters.length} semestre{studyYear.semesters.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Semesters */}
                    <div className="border-t">
                      {studyYear.semesters.map((semester: any) => (
                        <div key={semester.id} className="border-b last:border-b-0">
                          <div
                            className="flex items-center gap-3 p-4 pl-8 cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSemesterToggle(semester.id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSemesters.includes(semester.id)}
                              onChange={() => {}}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium">{semester.name}</h5>
                              <p className="text-sm text-gray-600">
                                {semester.modules.length} module{semester.modules.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {/* Modules */}
                          <div>
                            {semester.modules.map((module: any) => (
                              <div key={module.id} className="border-t">
                                <div
                                  className="flex items-center gap-3 p-3 pl-12 cursor-pointer hover:bg-gray-50"
                                  onClick={() => handleModuleToggle(module.id)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedModules.includes(module.id)}
                                    onChange={() => {}}
                                    className="rounded"
                                  />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-sm">{module.name}</h6>
                                    <p className="text-xs text-gray-600">
                                      {module.lessons.length} leçon{module.lessons.length > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>

                                {/* Lessons */}
                                <div className="bg-gray-50">
                                  {module.lessons.map((lesson: any) => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center gap-3 p-2 pl-16 cursor-pointer hover:bg-gray-100"
                                      onClick={() => handleLessonToggle(lesson.id)}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedLessons.includes(lesson.id)}
                                        onChange={() => {}}
                                        className="rounded"
                                      />
                                      <BookOpen className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm">{lesson.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Questions générées</h3>
                  <p className="text-sm text-gray-600">
                    {sessionQuestions.length} question{sessionQuestions.length > 1 ? 's' : ''} prête{sessionQuestions.length > 1 ? 's' : ''} pour le quiz
                  </p>
                </div>
                <Button 
                  onClick={handleGenerateQuiz}
                  variant="secondary"
                  disabled={loadingSession}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  {loadingSession ? 'Génération...' : 'Régénérer'}
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sessionQuestions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">{question.text}</p>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2 text-sm">
                              {option.isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <div className="w-4 h-4 border border-gray-300 rounded-full" />
                              )}
                              <span className={option.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}>
                                {option.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-green-700 font-medium">Quiz prêt à être créé</p>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Les questions ont été sélectionnées aléatoirement à partir de vos sources.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Create */}
          {step === 'create' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Finalisation du quiz</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Titre du quiz *</label>
                    <Input
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Ex: Quiz de révision - Pharmacologie générale"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
                    <textarea
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      placeholder="Description du contenu du quiz..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Résumé du quiz</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {sessionQuestions.length} questions sélectionnées</li>
                  <li>• Sources: {getTotalSelections()} élément{getTotalSelections() > 1 ? 's' : ''}</li>
                  <li>• Durée: {sessionOptions.timeLimit ? `${sessionOptions.timeLimit} minutes` : 'Illimitée'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          
          <div className="flex gap-3">
            {step === 'selection' && (
              <Button
                onClick={handleGenerateQuiz}
                disabled={getTotalSelections() === 0 || loadingSession}
                className="bg-green-600 hover:bg-green-700"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                {loadingSession ? 'Génération...' : 'Générer les questions'}
              </Button>
            )}
            
            {step === 'preview' && (
              <>
                <Button variant="secondary" onClick={() => setStep('selection')}>
                  Retour
                </Button>
                <Button onClick={() => setStep('create')}>
                  Continuer
                </Button>
              </>
            )}
            
            {step === 'create' && (
              <>
                <Button variant="secondary" onClick={() => setStep('preview')}>
                  Retour
                </Button>
                <Button
                  onClick={handleCreateQuiz}
                  disabled={!quizTitle.trim() || loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Création...' : 'Créer le quiz'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
