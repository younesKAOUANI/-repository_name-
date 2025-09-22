'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function StudentDashboard() {
  const { data: session } = useSession();

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informations personnelles
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Nom:</strong> {session?.user?.name}</p>
            <p><strong>Email:</strong> {session?.user?.email}</p>
            <p><strong>Rôle:</strong> Étudiant</p>
            {session?.user?.year && (
              <p><strong>Année:</strong> {session.user.year}ème année</p>
            )}
            {session?.user?.university && (
              <p><strong>Université:</strong> {session.user.university}</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Actions rapides
          </h3>
          <div className="space-y-3">
            <Button variant="secondary" fullWidth>
              📚 Mes cours
            </Button>
            <Button variant="secondary" fullWidth>
              📝 Quiz disponibles  
            </Button>
            <Button variant="secondary" fullWidth>
              📊 Mes résultats
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Activité récente
          </h3>
          <p className="text-gray-500 text-sm">
            Aucune activité pour le moment.
          </p>
        </div>
      </div>
  );
}
