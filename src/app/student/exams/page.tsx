/**
 * Student Exam Page
 * Main page for students to access exams
 */

import { Metadata } from 'next';
import StudentExamInterface from '@/components/StudentExamInterface';

export const metadata: Metadata = {
  title: 'Examens - Pharmapedia',
  description: 'Passez vos examens et consultez vos résultats',
};

export default function StudentExamPage() {
  return <StudentExamInterface />
}
