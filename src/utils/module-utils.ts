import { db } from '@/lib/db';

/**
 * Get modules by study year ID
 */
export async function getModulesByStudyYear(studyYearId: string) {
  console.log('📚 Fetching modules for study year:', studyYearId);
  
  const modules = await db.module.findMany({
    where: {
      semester: {
        studyYearId: studyYearId
      }
    },
    include: {
      semester: {
        include: {
          studyYear: true
        }
      },
      lessons: {
        orderBy: {
          order: 'asc'
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`📊 Found ${modules.length} modules for study year ${studyYearId}`);
  
  modules.forEach((module, index) => {
    console.log(`📖 Module ${index + 1}:`, {
      id: module.id,
      name: module.name,
      lessonsCount: module.lessons.length,
      semester: {
        id: module.semester.id,
        name: module.semester.name,
        studyYear: {
          id: module.semester.studyYear.id,
          name: module.semester.studyYear.name
        }
      }
    });
  });

  return modules;
}

/**
 * Get modules by semester ID
 */
export async function getModulesBySemester(semesterId: string) {
  console.log('📚 Fetching modules for semester:', semesterId);
  
  const modules = await db.module.findMany({
    where: {
      semesterId: semesterId
    },
    include: {
      semester: {
        include: {
          studyYear: true
        }
      },
      lessons: {
        orderBy: {
          order: 'asc'
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`📊 Found ${modules.length} modules for semester ${semesterId}`);
  
  return modules;
}

/**
 * Get modules accessible by a student based on their license scopes
 */
export async function getStudentAccessibleModules(licenses: any[]) {
  console.log('🔐 Determining accessible modules from licenses:', licenses.length);
  
  const moduleConditions = [];
  
  for (const license of licenses) {
    if (license.yearScope) {
      // Year scope: all modules in the study year
      moduleConditions.push({
        semester: {
          studyYearId: license.yearScope.studyYearId
        }
      });
      console.log(`🎓 Adding year scope access for study year: ${license.yearScope.studyYearId}`);
    } else if (license.semScope) {
      // Semester scope: all modules in the semester
      moduleConditions.push({
        semesterId: license.semScope.semesterId
      });
      console.log(`📅 Adding semester scope access for semester: ${license.semScope.semesterId}`);
    } else if (license.modScope) {
      // Module scope: specific module
      moduleConditions.push({
        id: license.modScope.moduleId
      });
      console.log(`📖 Adding module scope access for module: ${license.modScope.moduleId}`);
    }
  }

  if (moduleConditions.length === 0) {
    console.log('⚠️ No valid license scopes found');
    return [];
  }

  const modules = await db.module.findMany({
    where: {
      OR: moduleConditions
    },
    include: {
      semester: {
        include: {
          studyYear: true
        }
      },
      lessons: {
        orderBy: {
          order: 'asc'
        }
      }
    },
    orderBy: [
      {
        semester: {
          studyYear: {
            name: 'asc'
          }
        }
      },
      {
        semester: {
          name: 'asc'
        }
      },
      {
        name: 'asc'
      }
    ]
  });

  console.log(`📚 Found ${modules.length} accessible modules`);
  
  return modules;
}

/**
 * Check if a student has access to a specific module
 */
export async function hasModuleAccess(userId: string, moduleId: string): Promise<boolean> {
  console.log(`🔍 Checking module access for user ${userId} and module ${moduleId}`);
  
  const userLicenses = await db.user.findUnique({
    where: { id: userId },
    include: {
      licenses: {
        where: {
          isActive: true,
          endDate: { gt: new Date() }
        },
        include: {
          yearScope: true,
          semScope: true,
          modScope: true
        }
      }
    }
  });

  if (!userLicenses || userLicenses.licenses.length === 0) {
    console.log('❌ No valid licenses found');
    return false;
  }

  // Get the module to check its study year and semester
  const module = await db.module.findUnique({
    where: { id: moduleId },
    include: {
      semester: {
        include: {
          studyYear: true
        }
      }
    }
  });

  if (!module) {
    console.log('❌ Module not found');
    return false;
  }

  // Check each license for access
  for (const license of userLicenses.licenses) {
    if (license.yearScope && license.yearScope.studyYearId === module.semester.studyYearId) {
      console.log('✅ Access granted via year scope');
      return true;
    }
    
    if (license.semScope && license.semScope.semesterId === module.semesterId) {
      console.log('✅ Access granted via semester scope');
      return true;
    }
    
    if (license.modScope && license.modScope.moduleId === moduleId) {
      console.log('✅ Access granted via module scope');
      return true;
    }
  }

  console.log('❌ No matching license scope found');
  return false;
}
