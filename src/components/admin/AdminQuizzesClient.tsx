'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import QuizManager from '@/components/shared/QuizManager';

export default function AdminQuizzesClient() {
  return (
      <QuizManager userRole="ADMIN" />
  );
}