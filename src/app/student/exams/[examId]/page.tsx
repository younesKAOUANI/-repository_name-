/**
 * Student Exam Session Page
 * Page for students to take a specific exam
 */

import { Metadata } from 'next';
import ExamSessionView from '@/components/ExamSessionView';

export const metadata: Metadata = {
  title: 'Session d\'Examen - Pharmapedia',
  description: 'Passez votre examen',
};

interface Props {
  params: Promise<{ examId: string }>;
}

export default async function StudentExamSessionPage({ params }: Props) {
  const { examId } = await params;
  
  return <ExamSessionView examId={parseInt(examId)} />;
}
