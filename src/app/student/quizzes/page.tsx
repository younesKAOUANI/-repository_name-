/**
 * Student Quiz Page
 * Main page for students to access course quizzes
 */

import StudentQuizInterface from '@/components/student/StudentQuizInterface';
import { COMMON_METADATA } from '@/lib/metadata';

// Export metadata using our centralized system
export const metadata = COMMON_METADATA.student.quizzes;

export default function StudentQuizPage() {
  return <StudentQuizInterface />;
}
