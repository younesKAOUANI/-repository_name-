import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { PlanTypeName } from '@prisma/client';

export interface LicenseData {
  id: string;
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    year: number | null;
    university: string | null;
  };
  plan: {
    id: string;
    planType: {
      id: string;
      name: PlanTypeName;
      duration: number;
    };
  };
  // Scope-specific data
  yearScope?: {
    studyYear: {
      id: string;
      name: string;
    };
  };
  semScope?: {
    semester: {
      id: string;
      name: string;
      studyYear: {
        id: string;
        name: string;
      };
    };
  };
  modScope?: {
    module: {
      id: string;
      name: string;
      semester: {
        id: string;
        name: string;
        studyYear: {
          id: string;
          name: string;
        };
      };
    };
  };
}

export interface CreateLicenseData {
  userId: string;
  planType: PlanTypeName;
  startDate?: Date;
  // Scope-specific fields (only one should be provided)
  studyYearId?: string;
  semesterId?: string;
  moduleId?: string;
}

export interface LicenseFilters {
  userId?: string;
  planType?: PlanTypeName;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
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

/**
 * License service for managing student licenses
 */
export class LicenseService {

  /**
   * Create a new license for a student
   */
  async createLicense(data: CreateLicenseData): Promise<LicenseData> {
    try {
      logger.info('Creating new license', { data });

      // Validate that only one scope is provided
      const scopeCount = [data.studyYearId, data.semesterId, data.moduleId].filter(Boolean).length;
      if (scopeCount !== 1) {
        throw new Error('Exactly one scope (studyYear, semester, or module) must be provided');
      }

      // Get or create plan type
      let planType = await db.planType.findFirst({
        where: { name: data.planType }
      });

      if (!planType) {
        // Create default plan types if they don't exist
        const durations = {
          ANNUAL: 365,
          SEMESTRIAL: 180,
          MODULE: 365
        };
        
        planType = await db.planType.create({
          data: {
            name: data.planType,
            duration: durations[data.planType]
          }
        });
      }

      // Create plan
      const plan = await db.plan.create({
        data: {
          planTypeId: planType.id
        }
      });

      // Calculate dates
      const startDate = data.startDate || new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + planType.duration);

      // Create license
      const license = await db.license.create({
        data: {
          userId: data.userId,
          planId: plan.id,
          startDate,
          endDate,
          isActive: true
        }
      });

      // Create scope-specific relation
      if (data.studyYearId) {
        await db.licenseStudyYear.create({
          data: {
            licenseId: license.id,
            studyYearId: data.studyYearId
          }
        });
      } else if (data.semesterId) {
        await db.licenseSemester.create({
          data: {
            licenseId: license.id,
            semesterId: data.semesterId
          }
        });
      } else if (data.moduleId) {
        await db.licenseModule.create({
          data: {
            licenseId: license.id,
            moduleId: data.moduleId
          }
        });
      }

      // Return the created license with all relations
      return await this.getLicenseById(license.id);
    } catch (error) {
      logger.error('Error creating license', { error, data });
      throw new Error('Échec de la création de la licence');
    }
  }

  /**
   * Get license by ID with all relations
   */
  async getLicenseById(id: string): Promise<LicenseData> {
    try {
      const license = await db.license.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              year: true,
              university: true
            }
          },
          plan: {
            include: {
              planType: true
            }
          },
          yearScope: {
            include: {
              studyYear: true
            }
          },
          semScope: {
            include: {
              semester: {
                include: {
                  studyYear: true
                }
              }
            }
          },
          modScope: {
            include: {
              module: {
                include: {
                  semester: {
                    include: {
                      studyYear: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!license) {
        throw new Error('License not found');
      }

      return license as LicenseData;
    } catch (error) {
      logger.error('Error fetching license', { error, id });
      throw error;
    }
  }

  /**
   * Get all licenses with filtering and pagination
   */
  async getAllLicenses(filters: LicenseFilters = {}) {
    try {
      const {
        userId,
        planType,
        isActive,
        search,
        page = 1,
        pageSize = 10
      } = filters;

      logger.info('Fetching licenses with filters', { filters });

      const where: any = {};

      if (userId) {
        where.userId = userId;
      }

      if (planType) {
        where.plan = {
          planType: {
            name: planType
          }
        };
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.OR = [
          {
            user: {
              name: { contains: search, mode: 'insensitive' }
            }
          },
          {
            user: {
              email: { contains: search, mode: 'insensitive' }
            }
          }
        ];
      }

      const [licenses, totalCount] = await Promise.all([
        db.license.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                year: true,
                university: true
              }
            },
            plan: {
              include: {
                planType: true
              }
            },
            yearScope: {
              include: {
                studyYear: true
              }
            },
            semScope: {
              include: {
                semester: {
                  include: {
                    studyYear: true
                  }
                }
              }
            },
            modScope: {
              include: {
                module: {
                  include: {
                    semester: {
                      include: {
                        studyYear: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        db.license.count({ where })
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        licenses: licenses as LicenseData[],
        pagination: {
          currentPage: page,
          totalPages,
          pageSize,
          totalItems: totalCount
        }
      };
    } catch (error) {
      logger.error('Error fetching licenses', { error });
      throw new Error('Échec de la récupération des licences');
    }
  }

  /**
   * Update license status
   */
  async updateLicenseStatus(id: string, isActive: boolean): Promise<LicenseData> {
    try {
      logger.info('Updating license status', { id, isActive });

      await db.license.update({
        where: { id },
        data: { isActive }
      });

      return await this.getLicenseById(id);
    } catch (error) {
      logger.error('Error updating license status', { error, id });
      throw new Error('Échec de la mise à jour du statut de la licence');
    }
  }

  /**
   * Extend license duration
   */
  async extendLicense(id: string, additionalDays: number): Promise<LicenseData> {
    try {
      logger.info('Extending license', { id, additionalDays });

      const license = await db.license.findUnique({
        where: { id }
      });

      if (!license) {
        throw new Error('License not found');
      }

      const newEndDate = new Date(license.endDate);
      newEndDate.setDate(newEndDate.getDate() + additionalDays);

      await db.license.update({
        where: { id },
        data: { endDate: newEndDate }
      });

      return await this.getLicenseById(id);
    } catch (error) {
      logger.error('Error extending license', { error, id });
      throw new Error('Échec de l\'extension de la licence');
    }
  }

  /**
   * Delete a license
   */
  async deleteLicense(id: string): Promise<void> {
    try {
      logger.info('Deleting license', { id });

      // Delete the license (cascade will handle scope relations)
      await db.license.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting license', { error, id });
      throw new Error('Échec de la suppression de la licence');
    }
  }

  /**
   * Check if user has access to specific content
   */
  async checkUserAccess(userId: string, resourceType: 'studyYear' | 'semester' | 'module', resourceId: string): Promise<boolean> {
    try {
      const now = new Date();

      let whereClause: any = {
        userId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      };

      if (resourceType === 'studyYear') {
        whereClause.yearScope = {
          studyYearId: resourceId
        };
      } else if (resourceType === 'semester') {
        // Check for semester license or annual license that covers this semester
        const license = await db.license.findFirst({
          where: {
            ...whereClause,
            OR: [
              {
                semScope: {
                  semesterId: resourceId
                }
              },
              {
                yearScope: {
                  studyYear: {
                    semesters: {
                      some: {
                        id: resourceId
                      }
                    }
                  }
                }
              }
            ]
          }
        });
        return !!license;
      } else if (resourceType === 'module') {
        // Check for module, semester, or annual license that covers this module
        const license = await db.license.findFirst({
          where: {
            ...whereClause,
            OR: [
              {
                modScope: {
                  moduleId: resourceId
                }
              },
              {
                semScope: {
                  semester: {
                    modules: {
                      some: {
                        id: resourceId
                      }
                    }
                  }
                }
              },
              {
                yearScope: {
                  studyYear: {
                    semesters: {
                      some: {
                        modules: {
                          some: {
                            id: resourceId
                          }
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        });
        return !!license;
      }

      const license = await db.license.findFirst({
        where: whereClause
      });

      return !!license;
    } catch (error) {
      logger.error('Error checking user access', { error, userId, resourceType, resourceId });
      return false;
    }
  }

  /**
   * Get user's active licenses
   */
  async getUserLicenses(userId: string): Promise<LicenseData[]> {
    try {
      const result = await this.getAllLicenses({ 
        userId, 
        isActive: true,
        pageSize: 100 // Get all user licenses
      });
      return result.licenses;
    } catch (error) {
      logger.error('Error fetching user licenses', { error, userId });
      throw new Error('Échec de la récupération des licences utilisateur');
    }
  }

  /**
   * Get license statistics
   */
  async getLicenseStats(): Promise<LicenseStats> {
    try {
      logger.info('Fetching license statistics');

      const [
        totalLicenses,
        activeLicenses,
        expiredLicenses,
        licensesByType,
        recentLicenses
      ] = await Promise.all([
        db.license.count(),
        db.license.count({
          where: {
            isActive: true,
            endDate: { gte: new Date() }
          }
        }),
        db.license.count({
          where: {
            OR: [
              { isActive: false },
              { endDate: { lt: new Date() } }
            ]
          }
        }),
        db.license.groupBy({
          by: ['planId'],
          _count: { id: true }
        }),
        db.license.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        })
      ]);

      // Process licenses by type
      const typeStats = { ANNUAL: 0, SEMESTRIAL: 0, MODULE: 0 };
      
      // Since groupBy doesn't support nested includes in Prisma, we need to fetch the plan types separately
      const planIds = licensesByType.map(item => item.planId);
      const plans = await db.plan.findMany({
        where: { id: { in: planIds } },
        include: { planType: true }
      });

      licensesByType.forEach(item => {
        const plan = plans.find(p => p.id === item.planId);
        if (plan) {
          typeStats[plan.planType.name] += item._count.id;
        }
      });

      return {
        totalLicenses,
        activeLicenses,
        expiredLicenses,
        licensesByType: typeStats,
        recentLicenses
      };
    } catch (error) {
      logger.error('Error fetching license statistics', { error });
      throw new Error('Échec de la récupération des statistiques des licences');
    }
  }

  /**
   * Update expired licenses status
   */
  async updateExpiredLicenses(): Promise<number> {
    try {
      logger.info('Updating expired licenses');

      const result = await db.license.updateMany({
        where: {
          isActive: true,
          endDate: { lt: new Date() }
        },
        data: {
          isActive: false
        }
      });

      logger.info(`Updated ${result.count} expired licenses`);
      return result.count;
    } catch (error) {
      logger.error('Error updating expired licenses', { error });
      throw new Error('Échec de la mise à jour des licences expirées');
    }
  }
}

export const licenseService = new LicenseService();
