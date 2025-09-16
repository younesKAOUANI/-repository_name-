/**
 * Module Service
 * Handles all module-related operations
 */

export interface StudyYear {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  semesters: Semester[];
  _count: {
    semesters: number;
    modules: number;
  };
}

export interface Semester {
  id: number;
  name: string;
  studyYearId: number;
  createdAt: string;
  updatedAt: string;
  studyYear?: StudyYear;
  modules: Module[];
  _count: {
    modules: number;
  };
}

export interface Module {
  id: number;
  name: string;
  semesterId: number;
  createdAt: string;
  updatedAt: string;
  semester: Semester;
  lessons?: Lesson[];
  quizzes?: Quiz[];
  _count: {
    lessons: number;
    quizzes: number;
  };
}

export interface Lesson {
  id: number;
  title: string;
  content: string | null;
  moduleId: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    pdfs: number;
    videos: number;
    quizzes: number;
  };
}

export interface Quiz {
  id: number;
  title: string;
  type: 'QUIZ' | 'EXAM' | 'SESSION';
  moduleId?: number;
  lessonId?: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    questions: number;
  };
}

export interface CreateModuleData {
  name: string;
  semesterId: number;
}

export interface UpdateModuleData {
  name?: string;
  semesterId?: number;
}

class ModuleService {
  private baseUrl = '/api';

  /**
   * Get all study years with semesters and optionally modules
   */
  async getStudyYears(includeModules = false): Promise<StudyYear[]> {
    try {
      const params = new URLSearchParams();
      if (includeModules) {
        params.append('includeModules', 'true');
      }

      const response = await fetch(`${this.baseUrl}/study-years?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des années d\'étude');
      }

      const data = await response.json();
      return data.studyYears;
    } catch (error) {
      console.error('Error fetching study years:', error);
      throw error;
    }
  }

  /**
   * Get all modules with optional filtering
   */
  async getModules(filters?: { studyYearId?: number; semesterId?: number }): Promise<Module[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.studyYearId) {
        params.append('studyYearId', filters.studyYearId.toString());
      }
      if (filters?.semesterId) {
        params.append('semesterId', filters.semesterId.toString());
      }

      const response = await fetch(`${this.baseUrl}/modules?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des modules');
      }

      const data = await response.json();
      return data.modules;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  /**
   * Get a specific module by ID
   */
  async getModule(id: number): Promise<Module> {
    try {
      const response = await fetch(`${this.baseUrl}/modules/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération du module');
      }

      const data = await response.json();
      return data.module;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  /**
   * Create a new module
   */
  async createModule(moduleData: CreateModuleData): Promise<Module> {
    try {
      const response = await fetch(`${this.baseUrl}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création du module');
      }

      const data = await response.json();
      return data.module;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  }

  /**
   * Update a module
   */
  async updateModule(id: number, moduleData: UpdateModuleData): Promise<Module> {
    try {
      const response = await fetch(`${this.baseUrl}/modules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour du module');
      }

      const data = await response.json();
      return data.module;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  }

  /**
   * Delete a module
   */
  async deleteModule(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/modules/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression du module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }

  /**
   * Create a new study year
   */
  async createStudyYear(name: string): Promise<StudyYear> {
    try {
      const response = await fetch(`${this.baseUrl}/study-years`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de l\'année d\'étude');
      }

      const data = await response.json();
      return data.studyYear;
    } catch (error) {
      console.error('Error creating study year:', error);
      throw error;
    }
  }
}

export const moduleService = new ModuleService();
