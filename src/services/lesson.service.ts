/**
 * Lesson Service
 * Handles all lesson-related API operations
 */

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  order: number;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonData {
  title: string;
  description?: string;
  content?: string;
  moduleId: string;
}

export interface UpdateLessonData {
  title?: string;
  description?: string;
  content?: string;
  order?: number;
}

class LessonService {
  private baseUrl = '/api/lessons';

  /**
   * Get all lessons for a module
   */
  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    const response = await fetch(`${this.baseUrl}?moduleId=${moduleId}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des leçons');
    }
    
    return response.json();
  }

  /**
   * Get a single lesson by ID
   */
  async getLessonById(id: string): Promise<Lesson> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la leçon');
    }
    
    return response.json();
  }

  /**
   * Create a new lesson
   */
  async createLesson(data: CreateLessonData): Promise<Lesson> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de la leçon');
    }
    
    return response.json();
  }

  /**
   * Update an existing lesson
   */
  async updateLesson(id: string, data: UpdateLessonData): Promise<Lesson> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour de la leçon');
    }
    
    return response.json();
  }

  /**
   * Delete a lesson
   */
  async deleteLesson(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression de la leçon');
    }
  }

  /**
   * Reorder lessons within a module
   */
  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ moduleId, lessonIds }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la réorganisation des leçons');
    }
  }
}

export const lessonService = new LessonService();
