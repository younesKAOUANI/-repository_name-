import { COMMON_METADATA } from '@/lib/metadata';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

// Export metadata for this page
export const metadata = COMMON_METADATA.admin.dashboard;

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
