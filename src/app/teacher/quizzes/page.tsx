import { COMMON_METADATA } from '@/lib/metadata';
import TeacherQuizzesClient from '@/components/teacher/TeacherQuizzesClient';

// Export metadata for this page
export const metadata = COMMON_METADATA.teacher.quizzes;

export default function TeacherQuizzesPage() {
  return <TeacherQuizzesClient />;
}
