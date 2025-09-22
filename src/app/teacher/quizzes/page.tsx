'use client';

import TeacherLayout from '@/components/layouts/TeacherLayout';
import QuizManager from '@/components/QuizManager';

export default function TeacherQuizzesPage() {
  return (
    <TeacherLayout
      title="Mes Quiz"
      subtitle="Créez et gérez vos quiz: leçons, examens et quiz de révision"
    >
      <QuizManager userRole="INSTRUCTOR" />
    </TeacherLayout>
  );
}
