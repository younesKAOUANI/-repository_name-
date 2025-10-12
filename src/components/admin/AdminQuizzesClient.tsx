'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import QuizManager from '@/components/shared/QuizManager';

export default function AdminQuizzesClient() {
  return (
    <AdminLayout
      title="Gestion des Examens"
      subtitle="Gérez les examens de modules"
    >
      <QuizManager userRole="ADMIN" />
    </AdminLayout>
  );
}