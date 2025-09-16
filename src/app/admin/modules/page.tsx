'use client';

import AdminLayout from '@/components/layouts/AdminLayout';
import ModulesManager from '@/components/ModulesManager';

export default function AdminModulesPage() {
  return (
    <AdminLayout
      title="Gestion des modules"
      subtitle="Gérez les modules, semestres et années d'étude"
    >
      <ModulesManager 
        allowCreate={true}
        allowEdit={true}
        allowDelete={true}
        showActions={true}
      />
    </AdminLayout>
  );
}
