'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import ModulesManager from '@/components/shared/ModulesManager';

export default function AdminModulesClient() {
  return (
    <div>
      <ModulesManager 
        allowCreate={true}
        allowEdit={true}
        allowDelete={true}
        showActions={true}
      />
    </div>
  );
}