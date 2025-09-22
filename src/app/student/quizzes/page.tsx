/**
 * Student Quiz Page
 * Main page for students to access course quizzes
 */

import { Metadata } from 'next';
import StudentQuizInterface from '@/components/StudentQuizInterface';

export const metadata: Metadata = {
  title: 'Quiz - Pharmapedia',
  description: 'Testez vos connaissances avec nos quiz de cours',
};

export default function StudentQuizPage() {
  return <StudentQuizInterface />;
}
