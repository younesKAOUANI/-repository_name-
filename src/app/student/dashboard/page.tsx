import { COMMON_METADATA } from '@/lib/metadata';
import StudentDashboardClient from '@/components/student/StudentDashboardClient';

// Export metadata for this page
export const metadata = COMMON_METADATA.student.dashboard;

export default function StudentDashboardPage() {
  return <StudentDashboardClient />;
}
