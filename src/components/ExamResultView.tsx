import React from 'react';

interface ExamResultViewProps {
  results?: any;
  onClose?: () => void;
  onBack?: () => void;
}

export default function ExamResultView({ results, onClose, onBack }: ExamResultViewProps) {
  const handleAction = onBack || onClose;
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Résultats de l'examen</h2>
      <p className="text-gray-600 mb-4">
        Composant de résultats d'examen - En cours de développement
      </p>
      {handleAction && (
        <button
          onClick={handleAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {onBack ? 'Retour' : 'Fermer'}
        </button>
      )}
    </div>
  );
}