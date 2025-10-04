/**
 * Student Exam Page
 * Main page for students to access exams
 */

import StudentExamInterface from '@/components/student/StudentExamInterface';
import { COMMON_METADATA } from '@/lib/metadata';

// Export metadata using our centralized system
export const metadata = COMMON_METADATA.student.exams;

export default function StudentExamPage() {
  return <StudentExamInterface />
}
