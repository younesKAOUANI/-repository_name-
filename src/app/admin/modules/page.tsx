import { COMMON_METADATA } from '@/lib/metadata';
import AdminModulesClient from '@/components/admin/AdminModulesClient';

// Export metadata for this page
export const metadata = COMMON_METADATA.admin.modules;

export default function AdminModulesPage() {
  return <AdminModulesClient />;
}
