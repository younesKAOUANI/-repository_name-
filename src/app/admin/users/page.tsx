import { COMMON_METADATA } from '@/lib/metadata';
import AdminUsersClient from '@/components/admin/AdminUsersClient';

// Export metadata for this page
export const metadata = COMMON_METADATA.admin.users;

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}