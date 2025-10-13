import AdminSettingsClient from '@/components/admin/AdminSettingsClient';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Paramètres - Admin Pharmapedia',
  description: 'Gérez vos paramètres de compte administrateur, changez votre mot de passe et configurez vos préférences.',
  keywords: [
    'admin settings',
    'paramètres admin pharmapedia',
    'changement mot de passe',
    'configuration admin'
  ],
});

export default function AdminSettingsPage() {
  return <AdminSettingsClient />;
}