/**
 * Student Exam Session Page (Legacy)
 * Redirects to the unified assessment session page
 */

import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentExamSessionPage({ params }: Props) {
  const { id } = await params;
  redirect(`/student/assessments/${id}`);
}
