/**
 * License Admin Hook
 * Custom hook for managing license administration state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { PlanTypeName } from '@prisma/client';
import licenseAdminService, {
  License,
  LicenseStats,
  LicensePagination,
  LicenseFilters,
  LicenseResources,
  CreateLicenseData
} from '@/services/license.admin.service';

export interface UseLicenseAdminState {
  // Data
  licenses: License[];
  stats: LicenseStats | null;
  resources: LicenseResources | null;
  
  // Loading states
  loading: boolean;
  loadingStats: boolean;
  loadingResources: boolean;
  
  // Error handling
  error: string;
  
  // Pagination and filters
  pagination: LicensePagination;
  filters: LicenseFilters;
  
  // Modal states
  selectedLicense: License | null;
  showViewModal: boolean;
  showCreateModal: boolean;
  showExtendModal: boolean;
  
  // Form states
  createForm: CreateLicenseData;
  extendDays: number;
}

export interface UseLicenseAdminActions {
  // Data loading
  loadLicenses: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadResources: () => Promise<void>;
  
  // Pagination and filtering
  handleSearch: (query: string) => void;
  handlePageChange: (page: number) => void;
  setFilters: (filters: Partial<LicenseFilters>) => void;
  
  // License operations
  handleCreateLicense: (e: React.FormEvent) => Promise<void>;
  handleToggleStatus: (license: License) => Promise<void>;
  handleExtendLicense: (license: License) => void;
  handleExtendSubmit: (e: React.FormEvent) => Promise<void>;
  handleDeleteLicense: (license: License) => Promise<void>;
  
  // Modal management
  handleViewLicense: (license: License) => void;
  setShowViewModal: (show: boolean) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowExtendModal: (show: boolean) => void;
  setSelectedLicense: (license: License | null) => void;
  
  // Form management
  setCreateForm: (form: CreateLicenseData) => void;
  updateCreateForm: (updates: Partial<CreateLicenseData>) => void;
  resetCreateForm: () => void;
  setExtendDays: (days: number) => void;
  
  // Utility functions
  getScopeDisplay: (license: License) => string;
  isExpired: (license: License) => boolean;
  getPlanTypeColor: (planType: PlanTypeName) => string;
  
  // Error handling
  setError: (error: string) => void;
  clearError: () => void;
}

const initialCreateForm: CreateLicenseData = {
  userId: '',
  planType: 'ANNUAL',
  studyYearId: '',
  startDate: new Date().toISOString().split('T')[0],
};

const initialPagination: LicensePagination = {
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  totalItems: 0,
};

const initialFilters: LicenseFilters = {
  search: '',
  planType: undefined,
  isActive: undefined,
};

export function useLicenseAdmin(): UseLicenseAdminState & UseLicenseAdminActions {
  // State
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState<LicenseStats | null>(null);
  const [resources, setResources] = useState<LicenseResources | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [pagination, setPagination] = useState<LicensePagination>(initialPagination);
  const [filters, setFiltersState] = useState<LicenseFilters>(initialFilters);
  
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  
  const [createForm, setCreateForm] = useState<CreateLicenseData>(initialCreateForm);
  const [extendDays, setExtendDays] = useState(30);

  // Load licenses
  const loadLicenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await licenseAdminService.getLicenses(
        pagination.currentPage,
        pagination.pageSize,
        filters
      );
      setLicenses(data.licenses);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filters]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const statsData = await licenseAdminService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load resources
  const loadResources = useCallback(async () => {
    try {
      setLoadingResources(true);
      const resourcesData = await licenseAdminService.getResources();
      setResources(resourcesData);
    } catch (err) {
      console.error('Error loading resources:', err);
      setResources({ studyYears: [], students: [] });
    } finally {
      setLoadingResources(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    loadLicenses();
  }, [loadLicenses]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (showCreateModal && !resources) {
      loadResources();
    }
  }, [showCreateModal, resources, loadResources]);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setFiltersState(prev => ({ ...prev, search: query }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<LicenseFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleCreateLicense = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await licenseAdminService.createLicense(createForm);
      setShowCreateModal(false);
      setCreateForm(initialCreateForm);
      await loadLicenses();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  }, [createForm, loadLicenses, loadStats]);

  const handleToggleStatus = useCallback(async (license: License) => {
    try {
      await licenseAdminService.updateLicenseStatus(license.id, !license.isActive);
      await loadLicenses();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }, [loadLicenses, loadStats]);

  const handleExtendLicense = useCallback((license: License) => {
    setSelectedLicense(license);
    setShowExtendModal(true);
  }, []);

  const handleExtendSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense) return;

    try {
      await licenseAdminService.extendLicense(selectedLicense.id, extendDays);
      setShowExtendModal(false);
      setSelectedLicense(null);
      setExtendDays(30);
      await loadLicenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'extension');
    }
  }, [selectedLicense, extendDays, loadLicenses]);

  const handleDeleteLicense = useCallback(async (license: License) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette licence ?`)) {
      return;
    }

    try {
      await licenseAdminService.deleteLicense(license.id);
      await loadLicenses();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }, [loadLicenses, loadStats]);

  const handleViewLicense = useCallback((license: License) => {
    setSelectedLicense(license);
    setShowViewModal(true);
  }, []);

  const updateCreateForm = useCallback((updates: Partial<CreateLicenseData>) => {
    setCreateForm(prev => ({ ...prev, ...updates }));
  }, []);

  const resetCreateForm = useCallback(() => {
    setCreateForm(initialCreateForm);
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Utility functions
  const getScopeDisplay = useCallback((license: License) => {
    return licenseAdminService.getScopeDisplay(license);
  }, []);

  const isExpired = useCallback((license: License) => {
    return licenseAdminService.isExpired(license);
  }, []);

  const getPlanTypeColor = useCallback((planType: PlanTypeName) => {
    return licenseAdminService.getPlanTypeColor(planType);
  }, []);

  return {
    // State
    licenses,
    stats,
    resources,
    loading,
    loadingStats,
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
    loadLicenses,
    loadStats,
    loadResources,
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
    setSelectedLicense,
    setCreateForm,
    updateCreateForm,
    resetCreateForm,
    setExtendDays,
    getScopeDisplay,
    isExpired,
    getPlanTypeColor,
    setError,
    clearError,
  };
}
