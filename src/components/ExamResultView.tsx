/**
 * Exam Result View
 * Interface for displaying exam results and detailed feedback
 */

'use client';

import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useStudentExam } from '@/hooks/useStudentExam';

interface ExamResultViewProps {
  onBack: () => void;
}

export default function ExamResultView({ onBack }: ExamResultViewProps) {
  const { currentResult } = useStudentExam();

  if (!currentResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Aucun résultat à afficher</p>
          <Button onClick={onBack} className="mt-4">
            Retour aux examens
          </Button>
        </div>
      </div>
    );
  }

  // Use the properties from the API response
  const percentage = currentResult.percentage;
  const correctAnswers = currentResult.questionResults?.filter(q => q.isCorrect).length || 0;
  const totalQuestions = currentResult.questionResults?.length || 0;
  const timeSpent = currentResult.timeSpent || 0;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="h-12 w-12 text-green-600" />;
    if (percentage >= 50) return <AlertCircle className="h-12 w-12 text-yellow-600" />;
    return <XCircle className="h-12 w-12 text-red-600" />;
  };

  const getStatusMessage = (percentage: number) => {
    if (percentage >= 80) return { title: 'Excellent !', message: 'Félicitations pour cette excellente performance !' };
    if (percentage >= 50) return { title: 'Passable', message: 'Bon travail, mais il y a encore des améliorations possibles.' };
    return { title: 'Échec', message: 'Il faut réviser davantage pour améliorer vos résultats.' };
  };



  const status = getStatusMessage(percentage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Résultats de l&apos;examen
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results overview */}
        <div className={`rounded-lg border p-8 mb-8 ${getScoreBg(percentage)}`}>
          <div className="text-center">
            <div className="mb-4">
              {getStatusIcon(percentage)}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {status.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {status.message}
            </p>
            
            {/* Main Score Display */}
            <div className="mb-8">
              <div className={`text-6xl font-bold ${getScoreColor(percentage)} mb-4`}>
                {percentage.toFixed(0)}%
              </div>
              <div className="text-2xl font-semibold text-gray-700 mb-2">
                {currentResult.score} / {currentResult.maxScore} points
              </div>
              <div className="text-lg text-gray-600">
                {correctAnswers} sur {totalQuestions} questions correctes
              </div>
            </div>

            {/* Additional stats */}
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Soumis le: {new Date(currentResult.completedAt).toLocaleString('fr-FR')}</span>
              </div>
              {timeSpent > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Temps écoulé: {timeSpent} minute{timeSpent > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                percentage >= 80 ? 'bg-green-500' :
                percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Résumé de la performance
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {currentResult.score}
                </div>
                <div className="text-sm text-blue-800">Points obtenus</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {correctAnswers}
                </div>
                <div className="text-sm text-green-800">Bonnes réponses</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {totalQuestions - correctAnswers}
                </div>
                <div className="text-sm text-orange-800">Erreurs</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {percentage.toFixed(0)}%
                </div>
                <div className="text-sm text-purple-800">Réussite</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {percentage >= 80 ? '🎉 Excellente performance !' : 
                   percentage >= 50 ? '👍 Bonne performance' : 
                   '📚 Il faut réviser davantage'}
                </h4>
                <p className="text-gray-600 text-sm">
                  {percentage >= 80 ? 'Félicitations ! Vous maîtrisez parfaitement cette matière.' : 
                   percentage >= 50 ? 'Bon travail ! Continuez vos efforts pour atteindre l\'excellence.' : 
                   'N\'abandonnez pas ! Révisez les points difficiles et réessayez.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        {currentResult.questionResults && currentResult.questionResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm mt-8">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Résultats détaillés par question
              </h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {currentResult.questionResults.map((result, index) => (
                  <div
                    key={result.questionId}
                    className={`p-4 rounded-lg border-2 ${
                      result.isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {result.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          Question {index + 1}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.partialScore}/{result.maxScore} point{result.maxScore > 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">
                        {result.questionType}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-900 font-medium mb-2">
                        {result.questionText}
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Votre réponse:
                        </p>
                        <div className="text-sm text-gray-600">
                          {result.userAnswer.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {result.userAnswer.map((answer, idx) => (
                                <li key={idx}>{answer}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="italic">Pas de réponse</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Réponse(s) correcte(s):
                        </p>
                        <div className="text-sm text-green-600">
                          <ul className="list-disc list-inside">
                            {result.correctAnswer.map((answer, idx) => (
                              <li key={idx}>{answer}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {result.explanation && (
                      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Explication:
                        </p>
                        <p className="text-sm text-blue-800">
                          {result.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux examens
          </Button>
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Award className="h-4 w-4" />
            Imprimer le résultat
          </Button>
        </div>
      </div>
    </div>
  );
}
