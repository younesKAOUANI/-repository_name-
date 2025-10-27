'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Mail, 
  MailCheck,
  User, 
  Shield, 
  GraduationCap,
  Users,
  Search,
  Filter
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  year: number | null;
  university: string | null;
  universityId: string | null;
  sex: string | null;
  phoneNumber: string | null;
  createdAt: string;
  emailVerified: string | null;
  image: string | null;
  universityRelation?: {
    id: string;
    name: string;
  } | null;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  year?: number;
  universityId?: string;
  sex?: 'MALE' | 'FEMALE';
  phoneNumber?: string;
}

interface University {
  id: string;
  name: string;
}

interface UserPagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export default function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState<UserPagination>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
  });

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyAction, setVerifyAction] = useState<'verify' | 'unverify'>('verify');

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    year: undefined,
    universityId: '',
    sex: undefined,
    phoneNumber: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const searchParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
      });

      console.log('Fetching users from:', `/api/admin/users?${searchParams}`);
      const response = await fetch(`/api/admin/users?${searchParams}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(errorData.message || 'Échec du chargement des utilisateurs');
      }

      const data = await response.json();
      console.log('Full API response:', data);
      console.log('Users array:', data.users);
      console.log('Users count:', data.users?.length);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadUniversities();
  }, [pagination.currentPage, pagination.pageSize]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadUsers();
  };

  const loadUniversities = async () => {
    try {
      setLoadingUniversities(true);
      const response = await fetch('/api/universities');
      if (response.ok) {
        const data = await response.json();
        setUniversities(data.universities || []);
      }
    } catch (error) {
      console.error('Error loading universities:', error);
      setUniversities([]);
    } finally {
      setLoadingUniversities(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      year: undefined,
      universityId: '',
      sex: undefined,
      phoneNumber: '',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'adresse e-mail est requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Adresse e-mail invalide';
    }

    if (!showEditModal && !formData.password.trim()) {
      errors.password = 'Le mot de passe est requis';
    } else if (!showEditModal && formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (formData.role === 'STUDENT') {
      if (!formData.universityId?.trim()) {
        errors.universityId = 'L\'université est requise pour les étudiants';
      }
    }

    if (formData.phoneNumber && !/^\+\d{1,3}\d{8,14}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Format de téléphone invalide (ex: +213xxxxxxxxx)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de création de l\'utilisateur');
      }

      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de création de l\'utilisateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!validateForm() || !selectedUser) return;

    try {
      setIsSubmitting(true);
      
      const updateData: Partial<UserFormData> = { ...formData };
      if (!updateData.password) {
        const { password, ...dataWithoutPassword } = updateData;
        Object.assign(updateData, dataWithoutPassword);
        delete (updateData as any).password;
      }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de modification de l\'utilisateur');
      }

      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de modification de l\'utilisateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de suppression de l\'utilisateur');
      }

      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de suppression de l\'utilisateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyUser = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      
      const method = verifyAction === 'verify' ? 'POST' : 'DELETE';
      const response = await fetch(`/api/admin/users/${selectedUser.id}/verify`, {
        method,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Échec de ${verifyAction === 'verify' ? 'vérification' : 'annulation de vérification'} de l'utilisateur`);
      }

      setShowVerifyModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Échec de ${verifyAction === 'verify' ? 'vérification' : 'annulation de vérification'} de l'utilisateur`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openVerifyModal = (user: User, action: 'verify' | 'unverify') => {
    setSelectedUser(user);
    setVerifyAction(action);
    setShowVerifyModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Keep empty for edit
      role: user.role as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN',
      year: user.year || undefined,
      universityId: user.universityId || '',
      sex: user.sex as 'MALE' | 'FEMALE' | undefined,
      phoneNumber: user.phoneNumber || '',
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      INSTRUCTOR: 'bg-blue-100 text-blue-800',
      STUDENT: 'bg-green-100 text-green-800',
    };
    
    const labels = {
      ADMIN: 'Admin',
      INSTRUCTOR: 'Enseignant',
      STUDENT: 'Étudiant',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'name',
      label: 'Nom',
      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-8 w-8">
            {user.image ? (
              <img className="h-8 w-8 rounded-full" src={user.image} alt="" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{user.name || 'Nom non défini'}</div>
            <div className="text-sm text-gray-500">{user.email || 'Email non défini'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (value, user) => getRoleBadge(user.role),
    },
    {
      key: 'university',
      label: 'Université',
      render: (value, user) => user.universityRelation?.name || user.university || '-',
    },
    {
      key: 'year',
      label: 'Année',
      render: (value, user) => {
        if (!user.year) return '-';
        if (user.year === 7) return 'Résidanat';
        return `${user.year}ème année`;
      },
    },
    {
      key: 'emailVerified',
      label: 'Vérifié',
      render: (value, user) => (
        <div className="flex items-center">
          {user.emailVerified ? (
            <MailCheck className="h-4 w-4 text-green-500" />
          ) : (
            <Mail className="h-4 w-4 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (value, user) => new Date(user.createdAt).toLocaleDateString('fr-FR'),
    },
  ];

  const actions: TableAction<User>[] = [
    {
      label: 'Voir',
      icon: <Eye className="h-4 w-4" />,
      onClick: openViewModal,
    },
    {
      label: (user: User) => user.emailVerified ? 'Annuler vérification' : 'Vérifier',
      icon: (user: User) => user.emailVerified ? <Mail className="h-4 w-4" /> : <MailCheck className="h-4 w-4" />,
      onClick: (user: User) => openVerifyModal(user, user.emailVerified ? 'unverify' : 'verify'),
      variant: (user: User) => user.emailVerified ? 'default' : 'success',
    },
    {
      label: 'Modifier',
      icon: <Edit className="h-4 w-4" />,
      onClick: openEditModal,
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: openDeleteModal,
      variant: 'danger',
    },
  ];

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-gray-600">Gérez les administrateurs, enseignants et étudiants</p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nouvel utilisateur</span>
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les rôles</option>
                <option value="ADMIN">Administrateur</option>
                <option value="INSTRUCTOR">Enseignant</option>
                <option value="STUDENT">Étudiant</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSearch} variant="primary">
                Rechercher
              </Button>
              <Button 
                onClick={() => {
                  setFilters({ search: '', role: '' });
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                  loadUsers();
                }}
                variant="secondary"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          data={users}
          columns={columns}
          actions={actions}
          loading={loading}
          pagination={{
            ...pagination,
            onPageChange: (page: number) => setPagination(prev => ({ ...prev, currentPage: page }))
          }}
        />

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Créer un nouvel utilisateur</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      error={formErrors.name}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse e-mail *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={formErrors.email}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe *
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      error={formErrors.password}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="STUDENT">Étudiant</option>
                      <option value="INSTRUCTOR">Enseignant</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sexe
                    </label>
                    <select
                      value={formData.sex || ''}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'MALE' | 'FEMALE' | undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="MALE">Homme</option>
                      <option value="FEMALE">Femme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de téléphone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      error={formErrors.phoneNumber}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>

                {formData.role === 'STUDENT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Université *
                      </label>
                      {loadingUniversities ? (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                          Chargement...
                        </div>
                      ) : (
                        <select
                          value={formData.universityId || ''}
                          onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Sélectionnez une université</option>
                          {universities.map((university) => (
                            <option key={university.id} value={university.id}>
                              {university.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {formErrors.universityId && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.universityId}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Année d'études
                      </label>
                      <select
                        value={formData.year || ''}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionnez l'année</option>
                        <option value="1">1ère année</option>
                        <option value="2">2ème année</option>
                        <option value="3">3ème année</option>
                        <option value="4">4ème année</option>
                        <option value="5">5ème année</option>
                        <option value="6">6ème année</option>
                        <option value="7">Résidanat</option>
                      </select>
                      {formErrors.year && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.year}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreateUser} disabled={isSubmitting}>
                  {isSubmitting ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Modifier l'utilisateur</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      error={formErrors.name}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse e-mail *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={formErrors.email}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe (laisser vide pour conserver)
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      error={formErrors.password}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="STUDENT">Étudiant</option>
                      <option value="INSTRUCTOR">Enseignant</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sexe
                    </label>
                    <select
                      value={formData.sex || ''}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'MALE' | 'FEMALE' | undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="MALE">Homme</option>
                      <option value="FEMALE">Femme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de téléphone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      error={formErrors.phoneNumber}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>

                {formData.role === 'STUDENT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Université *
                      </label>
                      {loadingUniversities ? (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                          Chargement...
                        </div>
                      ) : (
                        <select
                          value={formData.universityId || ''}
                          onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Sélectionnez une université</option>
                          {universities.map((university) => (
                            <option key={university.id} value={university.id}>
                              {university.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {formErrors.universityId && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.universityId}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Année d'études
                      </label>
                      <select
                        value={formData.year || ''}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionnez l'année</option>
                        <option value="1">1ère année</option>
                        <option value="2">2ème année</option>
                        <option value="3">3ème année</option>
                        <option value="4">4ème année</option>
                        <option value="5">5ème année</option>
                        <option value="6">6ème année</option>
                        <option value="7">Résidanat</option>
                      </select>
                      {formErrors.year && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.year}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button onClick={handleEditUser} disabled={isSubmitting}>
                  {isSubmitting ? 'Modification...' : 'Modifier'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">Détails de l'utilisateur</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {selectedUser.image ? (
                    <img className="h-16 w-16 rounded-full" src={selectedUser.image} alt="" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Université</label>
                    <p className="mt-1">{selectedUser.universityRelation?.name || selectedUser.university || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Année d'études</label>
                    <p className="mt-1">{selectedUser.year ? (selectedUser.year === 7 ? 'Résidanat' : `${selectedUser.year}ème année`) : '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email vérifié</label>
                    <p className="mt-1">{selectedUser.emailVerified ? 'Oui' : 'Non'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Créé le</label>
                    <p className="mt-1">{new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Supprimer l'utilisateur</h2>
              
              <p className="mb-4">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser.name}</strong> ?
                Cette action est irréversible.
              </p>

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteUser} disabled={isSubmitting}>
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Verify User Modal */}
        {showVerifyModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className={`text-xl font-semibold mb-4 ${verifyAction === 'verify' ? 'text-green-600' : 'text-orange-600'}`}>
                {verifyAction === 'verify' ? 'Vérifier l\'utilisateur' : 'Annuler la vérification'}
              </h2>
              
              <p className="mb-4">
                {verifyAction === 'verify' ? (
                  <>
                    Êtes-vous sûr de vouloir marquer <strong>{selectedUser.name}</strong> comme vérifié ?
                    L'utilisateur pourra accéder à toutes les fonctionnalités de la plateforme.
                  </>
                ) : (
                  <>
                    Êtes-vous sûr de vouloir annuler la vérification de <strong>{selectedUser.name}</strong> ?
                    L'utilisateur devra vérifier son email à nouveau.
                  </>
                )}
              </p>

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleVerifyUser} 
                  disabled={isSubmitting}
                  className={verifyAction === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
                >
                  {isSubmitting ? 'Traitement...' : verifyAction === 'verify' ? 'Vérifier' : 'Annuler la vérification'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}