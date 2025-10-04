'use client';

import TeacherLayout from '@/components/teacher/TeacherLayout';
import QuizManager from '@/components/shared/QuizManager';

export default function TeacherQuizzesClient() {
  return (
    <TeacherLayout
      title="Mes Quiz"
      subtitle="Créez et gérez vos quiz: leçons, examens et quiz de révision"
    >
      <QuizManager userRole="INSTRUCTOR" />
    </TeacherLayout>
  );
}