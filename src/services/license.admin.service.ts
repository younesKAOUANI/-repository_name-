/**
 * License Admin Service
 * Handles all license administration operations for the admin interface
 */

import { PlanTypeName } from '@prisma/client';

export interface License {
  id: number;
  userId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    year: number | null;
    university: string | null;
  };
  plan: {
    id: number;
    planType: {
      id: number;
      name: PlanTypeName;
      duration: number;
    };
  };
  yearScope?: {
    studyYear: {
      id: number;
      name: string;
    };
  };
  semScope?: {
    semester: {
      id: number;
      name: string;
      studyYear: {
        id: number;
        name: string;
      };
    };
  };
  modScope?: {
    module: {
      id: number;
      name: string;
      semester: {
        id: number;
        name: string;
        studyYear: {
          id: number;
          name: string;
        };
      };
    };
  };
}

export interface LicenseStats {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  licensesByType: {
    ANNUAL: number;
    SEMESTRIAL: number;
    MODULE: number;
  };
  recentLicenses: number;
}

export interface LicensePagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface LicenseFilters {
  search: string;
  planType?: PlanTypeName;
  isActive?: boolean;
}

export interface LicenseListResponse {
  licenses: License[];
  pagination: LicensePagination;
}

export interface LicenseResources {
  studyYears: Array<{
    id: number;
    name: string;
  }>;
  students: Array<{
    id: string;
    name: string | null;
    email: string | null;
  }>;
}

export interface CreateLicenseData {
  userId: string;
  planType: PlanTypeName;
  studyYearId: string;
  startDate: string;
}

class LicenseAdminService {
  private baseUrl = '/api/licenses';

  /**
   * Fetch paginated licenses with filters
   */
  async getLicenses(
    page: number = 1,
    pageSize: number = 10,
    filters: LicenseFilters = { search: '' }
  ): Promise<LicenseListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.planType) params.append('planType', filters.planType);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch licenses');
      }

      const data = await response.json();
      return {
        licenses: data.licenses,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error fetching licenses:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors du chargement des licences');
    }
  }

  /**
   * Fetch license statistics
   */
  async getStats(): Promise<LicenseStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch license statistics');
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching license stats:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques');
    }
  }

  /**
   * Fetch resources needed for license creation (students and study years)
   */
  async getResources(): Promise<LicenseResources> {
    try {
      const response = await fetch(`${this.baseUrl}/resources`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }

      const data = await response.json();
      return {
        studyYears: data.studyYears || [],
        students: data.students || [],
      };
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors du chargement des ressources');
    }
  }

  /**
   * Create a new license
   */
  async createLicense(licenseData: CreateLicenseData): Promise<void> {
    try {
      const scopeData: any = {};
      
      if (licenseData.planType === 'ANNUAL' && licenseData.studyYearId) {
        scopeData.studyYearId = parseInt(licenseData.studyYearId);
      } else {
        throw new Error('Veuillez sélectionner une année d\'étude pour la licence annuelle');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: licenseData.userId,
          planType: licenseData.planType,
          startDate: licenseData.startDate,
          ...scopeData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create license');
      }
    } catch (error) {
      console.error('Error creating license:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la création de la licence');
    }
  }

  /**
   * Update license status (active/inactive)
   */
  async updateLicenseStatus(licenseId: number, isActive: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${licenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          isActive
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update license status');
      }
    } catch (error) {
      console.error('Error updating license status:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut');
    }
  }

  /**
   * Extend a license by adding days
   */
  async extendLicense(licenseId: number, additionalDays: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${licenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extend',
          additionalDays
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extend license');
      }
    } catch (error) {
      console.error('Error extending license:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de l\'extension de la licence');
    }
  }

  /**
   * Delete a license
   */
  async deleteLicense(licenseId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${licenseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete license');
      }
    } catch (error) {
      console.error('Error deleting license:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la suppression de la licence');
    }
  }

  /**
   * Utility function to get scope display text
   */
  getScopeDisplay(license: License): string {
    if (license.yearScope) {
      return license.yearScope.studyYear.name;
    }
    return 'Année non définie';
  }

  /**
   * Utility function to check if a license is expired
   */
  isExpired(license: License): boolean {
    return new Date(license.endDate) < new Date();
  }

  /**
   * Utility function to get plan type color classes
   */
  getPlanTypeColor(planType: PlanTypeName): string {
    switch (planType) {
      case 'ANNUAL': return 'text-blue-600 bg-blue-100';
      case 'SEMESTRIAL': return 'text-green-600 bg-green-100';
      case 'MODULE': return 'text-purple-600 bg-purple-100';
    }
  }
}

// Export singleton instance
export const licenseAdminService = new LicenseAdminService();
export default licenseAdminService;
