import { COMMON_METADATA } from '@/lib/metadata';
import StudentProfileClient from '@/components/student/StudentProfileClient';

export const metadata = COMMON_METADATA.student.profile;

export default function StudentProfilePage() {
  return <StudentProfileClient />;
}
