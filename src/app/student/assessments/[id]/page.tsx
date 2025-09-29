/**
 * Unified Assessment Session Page
 * Handles both quizzes and exams in a single interface
 */

import { Metadata } from 'next';
import ExamSessionView from '@/components/ExamSessionView';

export const metadata: Metadata = {
  title: 'Assessment Session - Pharmapedia',
  description: 'Session d\'évaluation - Quiz ou Examen',
};

interface AssessmentSessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentSessionPage({ params }: AssessmentSessionPageProps) {
  const { id } = await params;
  
  return <ExamSessionView examId={id} />;
}
