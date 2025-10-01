'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layouts/AdminLayout';
import Link from 'next/link';
import { 
  MdSchool,
  MdPerson,
  MdCardMembership,
  MdBusiness,
  MdMenuBook,
  MdSettings
} from 'react-icons/md';

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <AdminLayout
      title="Tableau de bord administrateur"
      subtitle={`Bienvenue, ${session?.user?.name || 'Administrateur'}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informations personnelles   
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Nom:</strong> {session?.user?.name}</p>
            <p><strong>Email:</strong> {session?.user?.email}</p>
            <p><strong>Rôle:</strong> Administrateur</p>
            {session?.user?.university && (
              <p><strong>Université:</strong> {session.user.university}</p>
            )}
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Gestion des utilisateurs
          </h3>
          <div className="flex flex-col gap-2">
            <Link href="/admin/teachers">
              <Button variant="secondary" fullWidth className="flex items-center space-x-2">
                <MdSchool className="w-4 h-4" />
                <span>Enseignants</span>
              </Button>
            </Link>
            <Link href="/admin/students">
              <Button variant="secondary" fullWidth className="flex items-center space-x-2">
                <MdPerson className="w-4 h-4" />
                <span>Étudiants</span>
              </Button>
            </Link>
            <Link href="/admin/licenses">
              <Button variant="secondary" fullWidth className="flex items-center space-x-2">
                <MdCardMembership className="w-4 h-4" />
                <span>Gérer les licences</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* System Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Gestion du système
          </h3>
          <div className="flex flex-col gap-2">
            <Link href="/admin/universities">
              <Button variant="secondary" fullWidth className="flex items-center space-x-2">
                <MdBusiness className="w-4 h-4" />
                <span>Universités</span>
              </Button>
            </Link>
            <Link href="/admin/modules">
              <Button variant="secondary" fullWidth className="flex items-center space-x-2">
                <MdMenuBook className="w-4 h-4" />
                <span>Modules</span>
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="secondary" fullWidth className="flex items-center space-x-2">
                <MdSettings className="w-4 h-4" />
                <span>Paramètres</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Statistiques globales
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Utilisateurs totaux:</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between">
              <span>Enseignants:</span>
              <span className="font-medium">1</span>
            </div>
            <div className="flex justify-between">
              <span>Étudiants:</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between">
              <span>Quiz créés:</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Activité récente du système
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-sm">
            Aucune activité récente pour le moment.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export const dynamic = 'force-dynamic';
