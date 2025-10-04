import { generateMetadata } from "@/lib/metadata";
import ExamAttemptResultsClient from "@/components/student/ExamAttemptResultsClient";

export const metadata = generateMetadata({
  title: 'Résultats de Tentative d\'Examen',
  description: 'Consultez les résultats détaillés de votre tentative d\'examen avec corrections et explications.',
  keywords: ['résultats', 'tentative', 'examen', 'corrections', 'explications'],
  noIndex: true, // Results pages should not be indexed
});

export default function ExamAttemptResultsPage() {
  return <ExamAttemptResultsClient />;
}
