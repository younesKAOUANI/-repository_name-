'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  BookOpen,
  FileText,
  TrendingUp,
  Award
} from 'lucide-react';
import { PlanTypeName } from '@prisma/client';
import { useLicenseAdmin } from '@/hooks/useLicenseAdmin';
import { License } from '@/services/license.admin.service';

export default function AdminLicensesClient() {
  const {
    // State
    licenses,
    stats,
    resources,
    loading,
    loadingResources,
    error,
    pagination,
    filters,
    selectedLicense,
    showViewModal,
    showCreateModal,
    showExtendModal,
    createForm,
    extendDays,

    // Actions
    handleSearch,
    handlePageChange,
    setFilters,
    handleCreateLicense,
    handleToggleStatus,
    handleExtendLicense,
    handleExtendSubmit,
    handleDeleteLicense,
    handleViewLicense,
    setShowViewModal,
    setShowCreateModal,
    setShowExtendModal,
    updateCreateForm,
    setExtendDays,
    getScopeDisplay,
    isExpired,
  } = useLicenseAdmin();


  const columns: TableColumn<License>[] = [
    {
      key: 'user',
      label: 'Étudiant',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value.name || 'Sans nom'}</div>
          <div className="text-sm text-gray-500">{value.email}</div>
          {value.year && (
            <div className="text-xs text-gray-400">{value.year}ème année</div>
          )}
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Type',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
            <Calendar className="h-4 w-4" />
            <span className="ml-1">Annuel</span>
          </span>
        </div>
      ),
      width: '100px',
    },
    {
      key: 'scope',
      label: 'Année d\'étude',
      render: (value, row) => (
        <div className="text-sm font-medium">
          {getScopeDisplay(row)}
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Statut',
      render: (value, row) => {
        const expired = isExpired(row);
        return (
          <div className="flex items-center space-x-1">
            {expired ? (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">Expiré</span>
              </>
            ) : value ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">Actif</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Inactif</span>
              </>
            )}
          </div>
        );
      },
      width: '120px',
    },
    {
      key: 'endDate',
      label: 'Expiration',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            {new Date(value).toLocaleDateString('fr-FR')}
          </span>
        </div>
      ),
      width: '140px',
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      sortable: true,
      render: (value) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString('fr-FR')}
        </span>
      ),
      width: '120px',
    },
  ];

  const actions: TableAction<License>[] = [
    {
      label: 'Voir les détails',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewLicense,
    },
    {
      label: 'Basculer statut',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleToggleStatus,
    },
    {
      label: 'Étendre',
      icon: <Calendar className="h-4 w-4" />,
      onClick: handleExtendLicense,
      show: (license) => license.isActive && !isExpired(license),
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteLicense,
      variant: 'danger',
    },
  ];

  return (
    <div
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Licences
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalLicenses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Actives
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeLicenses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Expirées
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.expiredLicenses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ce mois
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.recentLicenses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Actions Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="px-3 py-2 bg-blue-50 text-blue-800 rounded-md text-sm font-medium">
              Licences Annuelles Seulement
            </div>

            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => setFilters({ 
                isActive: e.target.value === '' ? undefined : e.target.value === 'true'
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle licence
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Licenses Table */}
        <DataTable
          data={licenses}
          columns={columns}
          actions={actions}
          loading={loading}
          searchPlaceholder="Rechercher par nom ou email..."
          onSearch={handleSearch}
          pagination={{
            ...pagination,
            onPageChange: handlePageChange,
          }}
          emptyMessage="Aucune licence trouvée"
          title="Liste des licences"
          subtitle={`${pagination.totalItems} licences au total`}
        />

        {/* View License Modal */}
        {showViewModal && selectedLicense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Détails de la licence</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Étudiant</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nom:</strong> {selectedLicense.user.name || 'Non renseigné'}</p>
                    <p><strong>Email:</strong> {selectedLicense.user.email}</p>
                    <p><strong>Année:</strong> {selectedLicense.user.year ? `${selectedLicense.user.year}ème année` : 'Non renseigné'}</p>
                    <p><strong>Université:</strong> {selectedLicense.user.university || 'Non renseigné'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Licence</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Type:</strong> {selectedLicense.plan.planType.name}</p>
                    <p><strong>Portée:</strong> {getScopeDisplay(selectedLicense)}</p>
                    <p><strong>Statut:</strong> {isExpired(selectedLicense) ? 'Expiré' : selectedLicense.isActive ? 'Actif' : 'Inactif'}</p>
                    <p><strong>Début:</strong> {new Date(selectedLicense.startDate).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Fin:</strong> {new Date(selectedLicense.endDate).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Durée:</strong> {selectedLicense.plan.planType.duration} jours</p>
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
              </div>
            </div>
          </div>
        )}

        {/* Create License Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Créer une nouvelle licence</h3>
              
              <form onSubmit={handleCreateLicense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Étudiant
                  </label>
                  {loadingResources ? (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      Chargement des étudiants...
                    </div>
                  ) : (
                    <select
                      value={createForm.userId}
                      onChange={(e) => updateCreateForm({ userId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionner un étudiant</option>
                      {resources?.students.map((student: any) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année d'étude
                  </label>
                  <select
                    value={createForm.studyYearId}
                    onChange={(e) => updateCreateForm({ studyYearId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner une année</option>
                    {resources?.studyYears.map((year: any) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <Input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => updateCreateForm({ startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary">
                    Créer
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Extend License Modal */}
        {showExtendModal && selectedLicense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Étendre la licence</h3>
              
              <div className="mb-4 text-sm text-gray-600">
                <p><strong>Étudiant:</strong> {selectedLicense.user.name || selectedLicense.user.email}</p>
                <p><strong>Expiration actuelle:</strong> {new Date(selectedLicense.endDate).toLocaleDateString('fr-FR')}</p>
              </div>

              <form onSubmit={handleExtendSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de jours à ajouter
                  </label>
                  <Input
                    type="number"
                    value={extendDays}
                    onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                    min="1"
                    max="365"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nouvelle date d'expiration: {new Date(new Date(selectedLicense.endDate).getTime() + extendDays * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowExtendModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary">
                    Étendre
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}