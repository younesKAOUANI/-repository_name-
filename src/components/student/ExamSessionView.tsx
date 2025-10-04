/**
 * Exam Session View
 * Interface for students to take an active exam
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  CheckCircle, 
  Circle,
  AlertTriangle,
  Send,
  ChevronLeft,
  ChevronRight,
  Flag,
  BookOpen,
  Play
} from 'lucide-react';
import { useStudentExam } from '@/hooks/useStudentExam';
import { ExamQuestion, ExamAnswer } from '@/services/student-exam.service';
import ExamResultView from '@/components/ExamResultView';

interface Props {
  examId?: string;
}

export default function ExamSessionView({ examId }: Props) {
  const router = useRouter();
  const {
    currentSession,
    currentExam,
    currentAnswers,
    currentResult,
    timeRemaining,
    isSubmitting,
    loading,
    error,
    updateAnswer,
    submitExam,
    resetSession,
    startExam,
    startTimer,
  } = useStudentExam();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  // Time formatting utility
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-start exam if examId is provided (but don't start timer yet)
  useEffect(() => {
    if (examId && !currentSession) {
      startExam(examId);
    }
  }, [examId, currentSession, startExam]);

  // Handle submission completion - navigate back to exam list
  const handleSubmitComplete = () => {
    resetSession();
    router.push('/student/exams');
  };

  // If there's a result to show, show the result view
  if (currentResult) {
    return <ExamResultView onBack={handleSubmitComplete} />;
  }

  // Show loading screen while exam is being loaded
  if (loading || (!currentSession && examId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Chargement de l'examen
          </h2>
          <p className="text-gray-600 mb-8">
            Préparation des questions en cours...
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Aucune session d'examen active</p>
          <Button onClick={() => router.push('/student/exams')} className="mt-4">
            Retour aux examens
          </Button>
        </div>
      </div>
    );
  }

  // Show exam start overlay if exam hasn't been started yet
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-2xl w-full mx-4">
            <div className="text-center">
              {/* Exam Icon */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              
              {/* Exam Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {currentExam?.title || 'Examen'}
              </h1>
              
              {/* Exam Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {currentSession.questions?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {timeRemaining > 0 ? formatTime(timeRemaining) : 'Libre'}
                    </div>
                    <div className="text-sm text-gray-600">Temps alloué</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {currentExam?.module?.name || 'Module'}
                    </div>
                    <div className="text-sm text-gray-600">Matière</div>
                  </div>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="text-left bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Instructions importantes
                </h3>
                <ul className="text-sm text-amber-700 space-y-2">
                  <li>• Lisez attentivement chaque question avant de répondre</li>
                  <li>• Vous devez répondre à toutes les questions pour pouvoir terminer l'examen</li>
                  <li>• Une fois commencé, le chronomètre ne peut pas être mis en pause</li>
                  <li>• Vos réponses sont sauvegardées automatiquement</li>
                  <li>• En cas de problème technique, contactez immédiatement votre enseignant</li>
                </ul>
              </div>
              
              {/* Start Button */}
              <Button
                onClick={() => {
                  setExamStarted(true);
                  startTimer();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="w-6 h-6 mr-2" />
                Commencer l'examen
              </Button>
              
              {/* Cancel Button */}
              <div className="mt-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/student/exams')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Annuler et retourner à la liste
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = currentSession.questions?.[currentQuestionIndex];
  const currentAnswer = currentAnswers.find(a => a.questionId === currentQuestion?.id);
  const totalQuestions = currentSession.questions?.length || 0;
  const answeredCount = currentAnswers.length;

  const handleAnswerChange = (questionId: string, selectedOptions: string[], textAnswer?: string) => {
    updateAnswer(questionId, selectedOptions, textAnswer);
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleSubmit = () => {
    setShowSubmitConfirmation(true);
  };

  const allQuestionsAnswered = answeredCount === totalQuestions;

  // Guard clause for missing questions
  if (!currentQuestion || !currentSession.questions || totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 mb-2">
            Préparation de l'examen...
          </div>
          <div className="text-sm text-gray-600">
            Chargement des questions en cours...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and progress */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {currentExam?.title || 'Examen'}
              </h1>
              <div className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} sur {totalQuestions}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Progress indicator */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{answeredCount}</span>/{totalQuestions} répondues
              </div>
              
              {/* Timer */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 
                timeRemaining < 900 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !allQuestionsAnswered}
                className={`flex items-center gap-2 ${
                  allQuestionsAnswered 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Envoi...' : allQuestionsAnswered ? 'Terminer' : `${totalQuestions - answeredCount} questions restantes`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question navigation sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h3 className="font-medium text-gray-900 mb-4">Navigation</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {currentSession.questions.map((_, index) => {
                  const isAnswered = currentAnswers.some(a => a.questionId === currentSession.questions[index].id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isAnswered
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main question area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Question header */}
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <div className="text-sm text-gray-500">
                    {currentQuestion.questionType === 'QCMA' && 'QCM Tout ou Rien'}
                    {currentQuestion.questionType === 'QCMP' && 'QCM Partiel'}
                    {currentQuestion.questionType === 'QCS' && 'Choix Simple'}
                    {currentQuestion.questionType === 'QROC' && 'Réponse Ouverte'}
                  </div>
                </div>
              </div>

              {/* Question content */}
              <div className="px-6 py-6">
                <div className="mb-6">
                  <p className="text-gray-900 text-lg leading-relaxed">
                    {currentQuestion.text}
                  </p>
                </div>

                {/* Answer options */}
                <QuestionAnswerInput
                  question={currentQuestion}
                  currentAnswer={currentAnswer}
                  onAnswerChange={handleAnswerChange}
                />
              </div>

              {/* Navigation buttons */}
              <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>

                <div className="text-sm text-gray-500">
                  {currentQuestionIndex + 1} / {totalQuestions}
                </div>

                <Button
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="flex items-center gap-2"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showSubmitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Confirmer la soumission
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vous avez répondu à toutes les questions ({totalQuestions}/{totalQuestions}).
                  </p>
                  <p className="text-gray-600 mb-2">
                    Êtes-vous sûr de vouloir terminer l'examen maintenant ? Cette action est définitive.
                  </p>
                  <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    ℹ️ Après la soumission, vous verrez immédiatement vos résultats détaillés avec les corrections.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowSubmitConfirmation(false)}
              >
                Continuer l'examen
              </Button>
              <Button
                onClick={() => {
                  setShowSubmitConfirmation(false);
                  submitExam();
                }}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isSubmitting ? 'Envoi en cours...' : 'Terminer l\'examen'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submission loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Soumission en cours
            </h3>
            <p className="text-gray-600">
              Calcul de vos résultats...
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Question Answer Input Component
interface QuestionAnswerInputProps {
  question: ExamQuestion;
  currentAnswer?: ExamAnswer;
  onAnswerChange: (questionId: string, selectedOptions: string[], textAnswer?: string) => void;
}

function QuestionAnswerInput({ question, currentAnswer, onAnswerChange }: QuestionAnswerInputProps) {
  const selectedOptions = currentAnswer?.selectedOptionIds || [];
  const textAnswer = currentAnswer?.textAnswer || '';

  const handleOptionToggle = (optionId: string) => {
    let newSelectedOptions: string[];

    if (question.questionType === 'QCS') {
      // Single choice - replace selection
      newSelectedOptions = [optionId];
    } else {
      // Multiple choice - toggle selection
      if (selectedOptions.includes(optionId)) {
        newSelectedOptions = selectedOptions.filter((id: string) => id !== optionId);
      } else {
        newSelectedOptions = [...selectedOptions, optionId];
      }
    }

    onAnswerChange(question.id, newSelectedOptions);
  };

  const handleTextChange = (value: string) => {
    onAnswerChange(question.id, [], value);
  };

  if (question.questionType === 'QROC') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Votre réponse:
        </label>
        <textarea
          value={textAnswer}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tapez votre réponse ici..."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const isSelected = selectedOptions.includes(option.id);
        const inputType = question.questionType === 'QCS' ? 'radio' : 'checkbox';
        
        return (
          <div
            key={option.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleOptionToggle(option.id)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {inputType === 'radio' ? (
                  isSelected ? (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )
                ) : (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by parent onClick
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-gray-900">{option.text}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
