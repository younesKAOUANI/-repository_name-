import { useState, useEffect } from 'react';

export interface StudyYear {
  id: number;
  name: string;
  semesters: Semester[];
}

export interface Semester {
  id: number;
  name: string;
  studyYearId: number;
  modules: Module[];
}

export interface Module {
  id: number;
  name: string;
  semesterId: number;
}

export interface Student {
  id: string;
  name: string | null;
  email: string | null;
  year: number | null;
  university: string | null;
}

export interface LicenseResources {
  studyYears: StudyYear[];
  students: Student[];
}

export function useLicenseResources() {
  const [resources, setResources] = useState<LicenseResources | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadResources = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch study years with semesters and modules
      const [studyYearsResponse, studentsResponse] = await Promise.all([
        fetch('/api/licenses/resources'),
        fetch('/api/students?pageSize=1000') // Get all students for dropdown
      ]);

      if (!studyYearsResponse.ok || !studentsResponse.ok) {
        throw new Error('Failed to fetch resources');
      }

      const studyYearsData = await studyYearsResponse.json();
      const studentsData = await studentsResponse.json();

      setResources({
        studyYears: studyYearsData.studyYears,
        students: studentsData.students
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  return {
    resources,
    loading,
    error,
    reload: loadResources
  };
}
