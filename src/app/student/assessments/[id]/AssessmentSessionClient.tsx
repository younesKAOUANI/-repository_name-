'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ExamSessionView from '@/components/student/ExamSessionView';
import RevisionQuizSession from '@/components/student/RevisionQuizSession';

interface Props {
  assessmentId: string;
}

export default function AssessmentSessionClient({ assessmentId }: Props) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [assessmentType, setAssessmentType] = useState<'exam' | 'revision' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determineAssessmentType = async () => {
      try {
        // If there's a sessionId, it's likely a revision quiz
        if (sessionId) {
          setAssessmentType('revision');
          setLoading(false);
          return;
        }

        // Try to fetch as revision quiz first
        const revisionResponse = await fetch(`/api/student/revision-quiz/${assessmentId}`, {
          method: 'HEAD' // Just check if it exists
        });

        if (revisionResponse.ok) {
          setAssessmentType('revision');
        } else {
          // Fall back to exam
          setAssessmentType('exam');
        }
      } catch (error) {
        // Default to exam if there's an error
        setAssessmentType('exam');
      } finally {
        setLoading(false);
      }
    };

    determineAssessmentType();
  }, [assessmentId, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement de l'évaluation...</p>
        </div>
      </div>
    );
  }

  if (assessmentType === 'revision') {
    return <RevisionQuizSession quizId={assessmentId} />;
  }

  return <ExamSessionView examId={assessmentId} />;
}