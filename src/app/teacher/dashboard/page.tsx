import { COMMON_METADATA } from '@/lib/metadata';
import TeacherDashboardClient from '@/components/teacher/TeacherDashboardClient';

// Export metadata for this page
export const metadata = COMMON_METADATA.teacher.dashboard;

export default function TeacherDashboardPage() {
  return <TeacherDashboardClient />;
}
