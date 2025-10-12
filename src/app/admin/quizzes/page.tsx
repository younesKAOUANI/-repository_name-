import { generateMetadata } from '@/lib/metadata';
import AdminQuizzesClient from '@/components/admin/AdminQuizzesClient';

// Export metadata for this page
export const metadata = generateMetadata({
  title: 'Gestion des Examens - Administration',
  description: 'Gérez les examens de modules de la plateforme.',
  keywords: ['gestion examens', 'administration', 'examens', 'modules'],
});

export default function AdminQuizzesPage() {
  return <AdminQuizzesClient />;
}
