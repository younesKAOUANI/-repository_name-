import { COMMON_METADATA } from '@/lib/metadata';
import AdminLicensesClient from '@/components/admin/AdminLicensesClient';

// Export metadata for this page
export const metadata = COMMON_METADATA.admin.licenses;

export default function AdminLicensesPage() {
  return <AdminLicensesClient />;
}


