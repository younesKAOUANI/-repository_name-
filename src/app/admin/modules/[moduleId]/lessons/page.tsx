import { generateMetadata } from '@/lib/metadata';
import AdminModuleLessonsClient from '@/components/admin/AdminModuleLessonsClient';

export const metadata = generateMetadata({
  title: 'Gestion des Leçons',
  description: 'Gérez les leçons d\'un module - créez, modifiez et organisez le contenu pédagogique.',
  keywords: ['leçons', 'module', 'contenu pédagogique', 'gestion'],
});

export const dynamic = 'force-dynamic';

export default function AdminModuleLessonsPage() {
  return <AdminModuleLessonsClient />;
}
