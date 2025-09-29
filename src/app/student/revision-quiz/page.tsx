'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import RevisionQuizCreator from '@/components/RevisionQuizCreator';

export default function RevisionQuizPage() {
  const router = useRouter();

  const handleSessionCreated = (sessionData: any) => {
    // Navigate to the quiz session
    router.push(`/student/assessment/${sessionData.quiz.id}?sessionId=${sessionData.sessionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz de Révision</h1>
            <p className="text-gray-600">
              Créez un quiz personnalisé à partir de la banque de questions pour réviser les modules et leçons de votre choix.
            </p>
          </div>

          <RevisionQuizCreator onSessionCreated={handleSessionCreated} />
        </div>
      </div>
    </div>
  );
}
