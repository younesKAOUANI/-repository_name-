'use client';

import TeacherLayout from '@/components/teacher/TeacherLayout';
import ModulesManager from '@/components/shared/ModulesManager';

export default function TeacherModulesClient() {
  return (
    <TeacherLayout
      title="Modules d'enseignement"
      subtitle="Consultez et gérez vos modules d'enseignement"
    >
      <ModulesManager 
        allowCreate={false}
        allowEdit={false}
        allowDelete={false}
        showActions={true}
      />
    </TeacherLayout>
  );
}