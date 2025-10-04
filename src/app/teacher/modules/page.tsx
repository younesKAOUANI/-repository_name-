import { COMMON_METADATA } from '@/lib/metadata';
import TeacherModulesClient from '@/components/teacher/TeacherModulesClient';

// Export metadata for this page
export const metadata = COMMON_METADATA.teacher.modules;

export default function TeacherModulesPage() {
  return <TeacherModulesClient />;
}
