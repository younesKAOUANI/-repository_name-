import { generateMetadata } from '@/lib/metadata';
import ExamResultsClient from '@/components/student/ExamResultsClient';

export const metadata = generateMetadata({
  title: 'Résultats d\'Examen',
  description: 'Consultez vos résultats d\'examen détaillés avec analyse des réponses et recommandations.',
  keywords: ['résultats', 'examen', 'score', 'analyse', 'performance'],
  noIndex: true, // Results pages should not be indexed
});

export default function ExamResultsPage() {
  return <ExamResultsClient />;
}
