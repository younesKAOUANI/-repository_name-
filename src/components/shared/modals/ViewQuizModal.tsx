/**
 * View Quiz Modal Component
 * Displays quiz details in read-only format
 */

'use client';

import { X, BookOpen, GraduationCap, Shuffle, Clock, Users, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Quiz } from '@/services/quiz.admin.service';
// Simple date formatting function with error handling
const formatDate = (dateString: string | Date) => {
  try {
    if (!dateString) return 'Date non définie';
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Date invalide';
    
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
};

interface ViewQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
}

const QuizTypeIcons = {
  QUIZ: BookOpen,
  EXAM: GraduationCap,
  SESSION: Shuffle,
} as const;

const QuizTypeLabels = {
  QUIZ: 'Quiz de leçon',
  EXAM: 'Examen de module',
  SESSION: 'Quiz de révision',
} as const;

const QuestionTypeLabels = {
  QCMA: 'QCM - Réponse unique (tout ou rien)',
  QCMP: 'QCM - Réponse partielle',
  QCS: 'Question à choix simple',
  QROC: 'Question à réponse ouverte courte',
} as const;

export default function ViewQuizModal({ isOpen, onClose, quiz }: ViewQuizModalProps) {
  if (!isOpen || !quiz) return null;

  // Debug logging
  console.log('ViewQuizModal - Quiz data:', quiz);
  console.log('ViewQuizModal - Questions:', quiz.questions);
  console.log('ViewQuizModal - Created at:', quiz.createdAt);

  const Icon = QuizTypeIcons[quiz.type] || BookOpen;
  const typeLabel = QuizTypeLabels[quiz.type] || 'Quiz';

  const formatQuizLocation = () => {
    if (quiz.lesson) {
      return `Leçon: ${quiz.lesson.title}`;
    }
    if (quiz.module) {
      return `Module: ${quiz.module.name}`;
    }
    if (quiz.type === 'SESSION' && quiz.sessionLessons?.length) {
      return `${quiz.sessionLessons.length} leçon(s) sélectionnée(s)`;
    }
    return 'Quiz de révision';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">{quiz.title}</h2>
              <p className="text-sm text-gray-600">{typeLabel}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Quiz Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du quiz
                  </label>
                  <p className="text-gray-900">{quiz.title}</p>
                </div>

                {quiz.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-900">{quiz.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de quiz
                  </label>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <span>{typeLabel}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <p className="text-gray-900">{formatQuizLocation()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Durée
                    </label>
                    <p className="text-gray-900">
                      {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'Illimitée'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FileText className="h-4 w-4 inline mr-1" />
                      Questions
                    </label>
                    <p className="text-gray-900">
                      {quiz.questions?.length || 0} question(s)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Créé le
                    </label>
                    <p className="text-gray-900">
                      {formatDate(quiz.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="h-4 w-4 inline mr-1" />
                      Tentatives
                    </label>
                    <p className="text-gray-900">
                      {quiz._count?.attempts || 0} tentative(s)
                    </p>
                  </div>
                </div>

                {quiz.type === 'SESSION' && quiz.questionCount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Questions générées
                    </label>
                    <p className="text-gray-900">{quiz.questionCount} question(s)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Session Quiz Lessons */}
            {quiz.type === 'SESSION' && quiz.sessionLessons?.length && (
              <div>
                <h3 className="text-lg font-medium mb-3">Leçons incluses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quiz.sessionLessons.map((sessionLesson, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{sessionLesson.lesson.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions */}
            {quiz.questions && quiz.questions.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Questions ({quiz.questions.length})
                </h3>
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {QuestionTypeLabels[question.questionType] || question.questionType}
                        </span>
                      </div>

                      <p className="text-gray-900 mb-3">{question.text}</p>

                      {question.options && question.options.length > 0 && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Options de réponse:
                          </label>
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={option.id}
                              className={`flex items-center gap-2 p-2 rounded ${
                                option.isCorrect 
                                  ? 'bg-green-50 border border-green-200' 
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                option.isCorrect 
                                  ? 'border-green-500 bg-green-500' 
                                  : 'border-gray-300'
                              }`}>
                                {option.isCorrect && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <span className={option.isCorrect ? 'font-medium text-green-800' : 'text-gray-900'}>
                                {option.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}


                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!quiz.questions || quiz.questions.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune question définie pour ce quiz</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
