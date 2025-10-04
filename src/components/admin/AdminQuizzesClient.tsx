'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import QuizManager from '@/components/shared/QuizManager';

export default function AdminQuizzesClient() {
  return (
    <AdminLayout
      title="Gestion des Quiz"
      subtitle="Gérez tous les types de quiz: leçons, examens et quiz de révision"
    >
      <QuizManager userRole="ADMIN" />
    </AdminLayout>
  );
}