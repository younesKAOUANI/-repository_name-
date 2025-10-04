import { COMMON_METADATA } from '@/lib/metadata';
import RevisionQuizClient from '@/components/student/RevisionQuizClient';

export const metadata = COMMON_METADATA.student.revisionQuiz;

export default function RevisionQuizPage() {
  return <RevisionQuizClient />;
}
