'use client';

// Force dynamic rendering to avoid prerendering issues with event handlers
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layouts/AdminLayout';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import { Eye, Edit, Trash2, Mail, MailCheck, MapPin, Calendar, Users } from 'lucide-react';

interface Student {
  id: string;
  name: string | null;
  email: string | null;
  year: number | null;
  university: string | null;
  createdAt: string;
  emailVerified: string | null;
  image: string | null;
  _count?: {
    quizAttempts: number;
    licenses: number;
  };
}

interface StudentPagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState<StudentPagination>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    year: undefined as number | undefined,
    university: '',
    verified: undefined as boolean | undefined,
  });

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [pagination.currentPage, filters]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.university) params.append('university', filters.university);
      if (filters.verified !== undefined) params.append('verified', filters.verified.toString());

      const response = await fetch(`/api/students?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'étudiant "${student.name || student.email}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const columns: TableColumn<Student>[] = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          {row.image ? (
            <img
              src={row.image}
              alt={row.name || 'Avatar'}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{value || 'Sans nom'}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'year',
      label: 'Année',
      sortable: true,
      render: (value) => value ? `${value}ème année` : '-',
      width: '120px',
    },
    {
      key: 'university',
      label: 'Université',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'emailVerified',
      label: 'Statut',
      render: (value) => (
        <div className="flex items-center space-x-1">
          {value ? (
            <>
              <MailCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">Vérifié</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Non vérifié</span>
            </>
          )}
        </div>
      ),
      width: '120px',
    },
    {
      key: '_count',
      label: 'Activité',
      render: (value) => (
        <div className="text-sm">
          <div>{value?.quizAttempts || 0} quiz</div>
          <div className="text-gray-500">{value?.licenses || 0} licences</div>
        </div>
      ),
      width: '100px',
    },
    {
      key: 'createdAt',
      label: 'Inscription',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            {new Date(value).toLocaleDateString('fr-FR')}
          </span>
        </div>
      ),
      width: '140px',
    },
  ];

  const actions: TableAction<Student>[] = [
    {
      label: 'Voir les détails',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewStudent,
    },
    {
      label: 'Modifier',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditStudent,
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteStudent,
      variant: 'danger',
    },
  ];

  return (
    <AdminLayout
      title="Gestion des étudiants"
      subtitle="Gérez les comptes étudiants et leurs informations"
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Étudiants
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pagination.totalItems}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MailCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vérifiés
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {students.filter(s => s.emailVerified).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Non vérifiés
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {students.filter(s => !s.emailVerified).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ce mois
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {students.filter(s => {
                      const createdAt = new Date(s.createdAt);
                      const now = new Date();
                      return createdAt.getMonth() === now.getMonth() && 
                             createdAt.getFullYear() === now.getFullYear();
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Students Table */}
        <DataTable
          data={students}
          columns={columns}
          actions={actions}
          loading={loading}
          searchPlaceholder="Rechercher par nom, email ou université..."
          onSearch={handleSearch}
          pagination={{
            ...pagination,
            onPageChange: handlePageChange,
          }}
          emptyMessage="Aucun étudiant trouvé"
          title="Liste des étudiants"
          subtitle={`${pagination.totalItems} étudiants au total`}
        />

        {/* View Student Modal */}
        {showViewModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Détails de l'étudiant</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Informations personnelles</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nom:</strong> {selectedStudent.name || 'Non renseigné'}</p>
                    <p><strong>Email:</strong> {selectedStudent.email}</p>
                    <p><strong>Année d'étude:</strong> {selectedStudent.year ? `${selectedStudent.year}ème année` : 'Non renseigné'}</p>
                    <p><strong>Université:</strong> {selectedStudent.university || 'Non renseigné'}</p>
                    <p><strong>Statut:</strong> {selectedStudent.emailVerified ? 'Vérifié' : 'Non vérifié'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Activité</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Quiz tentés:</strong> {selectedStudent._count?.quizAttempts || 0}</p>
                    <p><strong>Licences:</strong> {selectedStudent._count?.licenses || 0}</p>
                    <p><strong>Inscription:</strong> {new Date(selectedStudent.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Fermer
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowViewModal(false);
                    setShowEditModal(true);
                  }}
                >
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Modifier l'étudiant</h3>
              
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  try {
                    const response = await fetch(`/api/students/${selectedStudent.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: formData.get('name'),
                        year: formData.get('year') ? parseInt(formData.get('year') as string) : null,
                        university: formData.get('university'),
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to update student');
                    }

                    setShowEditModal(false);
                    setSelectedStudent(null);
                    await loadStudents();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedStudent.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année d'étude
                  </label>
                  <select
                    name="year"
                    defaultValue={selectedStudent.year || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une année</option>
                    {[1, 2, 3, 4, 5, 6].map(year => (
                      <option key={year} value={year}>{year}ème année</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Université
                  </label>
                  <input
                    type="text"
                    name="university"
                    defaultValue={selectedStudent.university || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
