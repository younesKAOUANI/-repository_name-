/**
 * Unified Assessment Session Page
 * Handles both quizzes and exams in a single interface
 */

import AssessmentSessionClient from './AssessmentSessionClient';
import { generateMetadata } from '@/lib/metadata';

// Export metadata for assessment sessions
export const metadata = generateMetadata({
  title: 'Session d\'Évaluation',
  description: 'Passez votre quiz ou examen dans un environnement sécurisé et optimisé.',
  keywords: ['session', 'évaluation', 'quiz', 'examen', 'test'],
});

interface AssessmentSessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentSessionPage({ params }: AssessmentSessionPageProps) {
  const { id } = await params;
  
  return <AssessmentSessionClient assessmentId={id} />;
}
