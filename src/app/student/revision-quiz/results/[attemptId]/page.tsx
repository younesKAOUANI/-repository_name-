import { generateMetadata } from '@/lib/metadata';
import RevisionQuizResultsClient from '@/components/student/RevisionQuizResultsClient';

export const metadata = generateMetadata({
  title: 'Résultats de Quiz de Révision',
  description: 'Consultez vos résultats de quiz de révision avec détails des réponses et recommandations d\'amélioration.',
  keywords: ['résultats', 'quiz révision', 'score', 'amélioration', 'analyse'],
  noIndex: true, // Results pages should not be indexed
});

export default function RevisionQuizResultsPage() {
  return <RevisionQuizResultsClient />;
}
