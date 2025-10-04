'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  Circle,
  AlertTriangle,
  Send,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Play,
  RotateCcw
} from 'lucide-react';

interface RevisionQuestion {
  id: string;
  text: string;
  questionType: string;
  order: number;
  options: {
    id: string;
    text: string;
  }[];
}

interface RevisionQuizSession {
  sessionId: string;
  quiz: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    questionCount: number | null;
    timeLimit: number | null;
    questions: RevisionQuestion[];
  };
  startedAt: string;
}

interface QuizResults {
  attemptId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  questions: {
    id: string;
    text: string;
    userAnswers: string[];
    correctAnswers: string[];
    isCorrect: boolean;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      selected: boolean;
    }[];
  }[];
}

interface Props {
  quizId: string;
}

export default function RevisionQuizSession({ quizId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [quizSession, setQuizSession] = useState<RevisionQuizSession | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  // Load quiz session
  const loadQuizSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/revision-quiz/${quizId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du quiz');
      }
      
      const data = await response.json();
      
      // Validate that the quiz has questions
      if (!data.quiz?.questions || data.quiz.questions.length === 0) {
        throw new Error('Ce quiz ne contient aucune question.');
      }
      
      setQuizSession(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  // Initialize timer when quiz starts
  const startQuiz = () => {
    setQuizStarted(true);
    setTimeStarted(new Date());
    
    if (quizSession?.quiz.timeLimit) {
      setTimeRemaining(quizSession.quiz.timeLimit * 60); // Convert minutes to seconds
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && quizStarted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      // Auto-submit when time runs out
      handleSubmitQuiz();
    }
  }, [timeRemaining, quizStarted]);

  // Format time utility
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, optionId: string) => {
    const question = quizSession?.quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    setCurrentAnswers(prev => {
      const currentSelected = prev[questionId] || [];
      
      if (question.questionType === 'QCMA') {
        // Multiple choice - single answer
        return {
          ...prev,
          [questionId]: [optionId]
        };
      } else if (question.questionType === 'QCMP') {
        // Multiple choice - multiple answers
        if (currentSelected.includes(optionId)) {
          return {
            ...prev,
            [questionId]: currentSelected.filter(id => id !== optionId)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentSelected, optionId]
          };
        }
      }
      
      return prev;
    });
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!quizSession) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/student/revision-quiz/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: currentAnswers
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission');
      }

      const results = await response.json();
      setResults(results);
      setShowSubmitConfirmation(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (quizSession && currentQuestionIndex < quizSession.quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Get question status for navigation
  const getQuestionStatus = (questionId: string) => {
    const answers = currentAnswers[questionId];
    return answers && answers.length > 0 ? 'answered' : 'unanswered';
  };

  // Load quiz on mount
  useEffect(() => {
    loadQuizSession();
  }, [loadQuizSession]);

  // Show results
  if (results) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Terminé!</h1>
              <p className="text-gray-600">Voici vos résultats</p>
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{results.score}%</div>
                <div className="text-sm text-blue-600">Score Final</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                <div className="text-sm text-green-600">Bonnes Réponses</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">{results.totalQuestions}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{results.timeSpent}min</div>
                <div className="text-sm text-purple-600">Temps Utilisé</div>
              </div>
            </div>

            {/* Question Results */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Détail des Réponses</h2>
              {results.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      Question {index + 1}: {question.text}
                    </h3>
                    <div className={`px-2 py-1 rounded text-sm ${
                      question.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {question.isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {question.options.map(option => (
                      <div key={option.id} className={`p-2 rounded border ${
                        option.isCorrect 
                          ? 'border-green-200 bg-green-50' 
                          : option.selected && !option.isCorrect
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {option.isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : option.selected ? (
                            <Circle className="w-4 h-4 text-red-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`${
                            option.isCorrect ? 'text-green-900' : 
                            option.selected && !option.isCorrect ? 'text-red-900' : 
                            'text-gray-700'
                          }`}>
                            {option.text}
                          </span>
                          {option.selected && (
                            <span className="text-xs text-gray-500">(Votre réponse)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-8">
              <Button 
                onClick={() => router.push('/student/revision-quiz/history')}
                variant="secondary"
              >
                Voir l'Historique
              </Button>
              <div className="space-x-3">
                <Button 
                  onClick={() => router.push('/student/revision-quiz')}
                  variant="secondary"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Nouveau Quiz
                </Button>
                <Button 
                  onClick={() => router.push('/student/quizzes')}
                >
                  Retour aux Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen   flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Chargement du Quiz de Révision
          </h2>
          <p className="text-gray-600 mb-8">
            Préparation des questions en cours...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Erreur de Chargement
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-3">
            <Button onClick={loadQuizSession} variant="secondary">
              Réessayer
            </Button>
            <Button onClick={() => router.push('/student/revision-quiz')}>
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No quiz session
  if (!quizSession) {
    return null;
  }

  // Pre-start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center p-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {quizSession.quiz.title}
          </h1>
          
          {quizSession.quiz.description && (
            <p className="text-lg text-gray-600 mb-8">
              {quizSession.quiz.description}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Questions</h3>
              <p className="text-gray-600">{quizSession.quiz.questions.length} questions</p>
            </div>
            
            {quizSession.quiz.timeLimit && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Temps Limité</h3>
                <p className="text-gray-600">{quizSession.quiz.timeLimit} minutes</p>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Instructions</span>
            </div>
            <ul className="mt-3 text-sm text-yellow-700 space-y-1 text-left">
              <li>• Lisez attentivement chaque question</li>
              <li>• Vous pouvez naviguer entre les questions</li>
              <li>• Vos réponses sont sauvegardées automatiquement</li>
              {quizSession.quiz.timeLimit && <li>• Le quiz se soumet automatiquement à la fin du temps</li>}
            </ul>
          </div>

          <Button onClick={startQuiz} size="lg" className="px-8">
            <Play className="w-5 h-5 mr-2" />
            Commencer le Quiz
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizSession.quiz.questions[currentQuestionIndex];
  
  // Guard against undefined currentQuestion
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Erreur du Quiz
          </h2>
          <p className="text-gray-600 mb-6">
            Aucune question trouvée pour ce quiz ou index invalide.
          </p>
          <Button onClick={() => router.push('/student/revision-quiz')}>
            Retour aux Quiz de Révision
          </Button>
        </div>
      </div>
    );
  }
  
  const progress = ((currentQuestionIndex + 1) / quizSession.quiz.questions.length) * 100;
  const answeredQuestions = Object.keys(currentAnswers).filter(
    qId => currentAnswers[qId] && currentAnswers[qId].length > 0
  ).length;

  return (
    <div className="min-h-screen">
      {/* Header with timer and progress */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {quizSession.quiz.title}
              </h1>
              <p className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} sur {quizSession.quiz.questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {timeRemaining !== null && (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-medium">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              
              <Button
                onClick={() => setShowSubmitConfirmation(true)}
                disabled={answeredQuestions === 0}
                variant={answeredQuestions === quizSession.quiz.questions.length ? "primary" : "secondary"}
              >
                <Send className="w-4 h-4 mr-2" />
                Soumettre ({answeredQuestions}/{quizSession.quiz.questions.length})
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question navigation sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h3 className="font-medium text-gray-900 mb-4">Navigation</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {quizSession.quiz.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : getQuestionStatus(question.id) === 'answered'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Répondu ({answeredQuestions})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Non répondu ({quizSession.quiz.questions.length - answeredQuestions})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main question area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Question */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {currentQuestion.text}
                </h2>
                
                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options?.map(option => {
                    const isSelected = currentAnswers[currentQuestion.id]?.includes(option.id) || false;
                    
                    return (
                      <label
                        key={option.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                          isSelected
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type={currentQuestion.questionType === 'QCMP' ? 'checkbox' : 'radio'}
                            name={`question-${currentQuestion.id}`}
                            value={option.id}
                            checked={isSelected}
                            onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-900">{option.text}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between">
                <Button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  variant="secondary"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>
                
                <Button
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === quizSession.quiz.questions.length - 1}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showSubmitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer la Soumission
            </h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-gray-600">
                Vous avez répondu à <strong>{answeredQuestions}</strong> questions 
                sur <strong>{quizSession.quiz.questions.length}</strong>.
              </p>
              
              {answeredQuestions < quizSession.quiz.questions.length && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-yellow-800 text-sm">
                    <strong>Attention:</strong> {quizSession.quiz.questions.length - answeredQuestions} questions 
                    ne sont pas encore répondues. Elles seront comptées comme incorrectes.
                  </p>
                </div>
              )}
              
              <p className="text-gray-600 text-sm">
                Une fois soumis, vous ne pourrez plus modifier vos réponses.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowSubmitConfirmation(false)}
                variant="secondary"
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Soumission...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}