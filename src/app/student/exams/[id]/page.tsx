/**
 * Student Exam Session Page (Legacy)
 * Redirects to the unified assessment session page
 */

import { redirect } from 'next/navigation';
import { generateMetadata } from '@/lib/metadata';

// Export metadata for this redirect page
export const metadata = generateMetadata({
  title: 'Redirection Examen',
  description: 'Redirection vers la session d\'examen unifiée.',
  keywords: ['examen', 'redirection'],
  noIndex: true, // Don't index redirect pages
});

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentExamSessionPage({ params }: Props) {
  const { id } = await params;
  redirect(`/student/assessments/${id}`);
}
