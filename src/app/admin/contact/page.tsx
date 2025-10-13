import AdminContactsClient from '@/components/admin/AdminContactsClient';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Gestion des Contacts - Admin Pharmapedia',
  description: 'Gérez les messages de contact et demandes des utilisateurs sur la plateforme Pharmapedia.',
  keywords: [
    'admin contacts',
    'gestion contacts pharmapedia',
    'messages utilisateurs',
    'support client'
  ],
});

export default function AdminContactsPage() {
  return <AdminContactsClient />;
}