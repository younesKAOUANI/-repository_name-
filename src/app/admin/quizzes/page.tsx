import { generateMetadata } from '@/lib/metadata';
import AdminQuizzesClient from '@/components/admin/AdminQuizzesClient';

// Export metadata for this page
export const metadata = generateMetadata({
  title: 'Gestion des Quiz - Administration',
  description: 'Gérez tous les types de quiz de la plateforme: leçons, examens et quiz de révision.',
  keywords: ['gestion quiz', 'administration', 'leçons', 'examens'],
});

export default function AdminQuizzesPage() {
  return <AdminQuizzesClient />;
}
