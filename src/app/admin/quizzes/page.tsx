'use client';

import AdminLayout from '@/components/layouts/AdminLayout';
import QuizManager from '@/components/QuizManager';

export default function AdminQuizzesPage() {
  return (
    <AdminLayout
      title="Gestion des Quiz"
      subtitle="Gérez tous les types de quiz: leçons, examens et quiz de révision"
    >
      <QuizManager userRole="ADMIN" />
    </AdminLayout>
  );
}
