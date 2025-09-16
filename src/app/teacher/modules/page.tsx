'use client';

import TeacherLayout from '@/components/layouts/TeacherLayout';
import ModulesManager from '@/components/ModulesManager';

export default function TeacherModulesPage() {
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
