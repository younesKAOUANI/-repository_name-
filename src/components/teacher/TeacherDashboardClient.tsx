'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import TeacherLayout from '@/components/teacher/TeacherLayout';

export default function TeacherDashboardClient() {
  const { data: session } = useSession();

  return (
    <TeacherLayout
      title="Tableau de bord enseignant"
      subtitle={`Bienvenue, ${session?.user?.name || 'Enseignant'}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informations personnelles
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Nom:</strong> {session?.user?.name}</p>
            <p><strong>Email:</strong> {session?.user?.email}</p>
            <p><strong>Rôle:</strong> Enseignant</p>
            {session?.user?.university && (
              <p><strong>Université:</strong> {session.user.university}</p>
            )}
          </div>
        </div>

        {/* Teaching Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Gestion des cours
          </h3>
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              ➕ Créer un quiz
            </Button>
            <Button variant="secondary" fullWidth>
              📚 Mes cours
            </Button>
            <Button variant="secondary" fullWidth>
              👥 Mes étudiants
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Statistiques
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Quiz créés:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span>Étudiants inscrits:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span>Cours actifs:</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}