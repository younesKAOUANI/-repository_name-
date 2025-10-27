'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
// Simple toast implementation
const toast = {
  error: (message: string) => {
    console.error(message);
    alert(`Erreur: ${message}`);
  },
  success: (message: string) => {
    console.log(message);
  }
};
import { 
  University, 
  ExternalLink,
  Calendar,
  BookOpen,
  Loader2,
  GraduationCap,
  FileText
} from 'lucide-react';

interface UniversityData {
  id: string;
  name: string;
  driveLinks: DriveLink[];
  _count: {
    driveLinks: number;
  };
}

interface DriveLink {
  id: string;
  year: string;
  studyYear: string;
  link: string;
  universityId: string;
  university?: UniversityData;
}

export default function StudentCoursesClient() {
  const [universities, setUniversities] = useState<UniversityData[]>([]);
  const [driveLinks, setDriveLinks] = useState<DriveLink[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [expandedStudyYears, setExpandedStudyYears] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Load universities
  const loadUniversities = async () => {
    try {
      const response = await fetch('/api/student/universities');
      if (!response.ok) throw new Error('Failed to load universities');
      const data = await response.json();
      setUniversities(data);
    } catch (error) {
      console.error('Error loading universities:', error);
      toast.error('Impossible de charger les universités');
    }
  };

  // Load drive links (courses) for selected university
  const loadCourses = async (universityId: string) => {
    try {
      setCoursesLoading(true);
      const response = await fetch(`/api/student/courses?universityId=${universityId}`);
      if (!response.ok) throw new Error('Failed to load courses');
      const data = await response.json();
      setDriveLinks(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Impossible de charger les cours');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Initial load - only universities
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadUniversities();
      setLoading(false);
    };

    loadData();
  }, []);

  // Handle university selection
  const handleUniversitySelect = async (universityId: string) => {
    setSelectedUniversityId(universityId);
    setExpandedStudyYears(new Set()); // Reset expanded study years
    await loadCourses(universityId);
  };

  // Toggle study year expansion
  const toggleStudyYear = (studyYear: string) => {
    const newExpanded = new Set(expandedStudyYears);
    if (newExpanded.has(studyYear)) {
      newExpanded.delete(studyYear);
    } else {
      newExpanded.add(studyYear);
    }
    setExpandedStudyYears(newExpanded);
  };

  // Group courses by study year
  const groupCoursesByStudyYear = () => {
    return driveLinks.reduce((groups, link) => {
      const studyYear = link.studyYear;
      if (!groups[studyYear]) {
        groups[studyYear] = [];
      }
      groups[studyYear].push(link);
      return groups;
    }, {} as Record<string, DriveLink[]>);
  };

  // Open course link in new tab
  const openCourse = (link: string, universityName: string, studyYear: string, year: string) => {
    window.open(link, '_blank');
    toast.success(`Ouverture du cours ${universityName} - ${studyYear} - ${year}`);
  };

  // Go back to universities list
  const goBackToUniversities = () => {
    setSelectedUniversityId(null);
    setDriveLinks([]);
    setExpandedStudyYears(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

            {/* Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Statistiques
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {universities.length}
            </div>
            <div className="text-sm text-gray-600">Universités</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {selectedUniversityId ? driveLinks.length : universities.reduce((total, uni) => total + uni._count.driveLinks, 0)}
            </div>
            <div className="text-sm text-gray-600">
              {selectedUniversityId ? 'Cours dans cette université' : 'Total des cours'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {selectedUniversityId ? Object.keys(groupCoursesByStudyYear()).length : 0}
            </div>
            <div className="text-sm text-gray-600">Années d'études</div>
          </div>
        </div>
      </div>
      
          {selectedUniversityId && (
            <Button variant="secondary" onClick={goBackToUniversities}>
              ← Retour aux universités
            </Button>
          )}



      {!selectedUniversityId ? (
        // Show universities list
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Choisir votre Université
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {universities.map((university) => (
              <Card 
                key={university.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 hover:border-blue-200"
                onClick={() => handleUniversitySelect(university.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg flex items-center group-hover:text-blue-600 transition-colors">
                      <University className="h-8 w-8 mr-3 text-blue-600" />
                      <span className="text-base sm:text-lg">{university.name}</span>
                    </CardTitle>
                    <Badge variant="secondary" className="mt-2 sm:mt-0">
                      {university._count.driveLinks} cours
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center sm:text-left">
                      Accédez aux cours et ressources pédagogiques de cette université.
                    </p>
                    <Button
                      variant="primary"
                      className="w-full py-3 text-base group-hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <BookOpen className="h-6 w-6 mr-2" />
                      <span className="text-sm sm:text-base">Voir les Cours</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {universities.length === 0 && (
            <Card className="bg-gray-50">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <University className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Aucune université disponible</h3>
                  <p className="text-sm">
                    Les universités seront bientôt disponibles. Veuillez vérifier à nouveau plus tard.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Show selected university's courses organized by study year
        <div>
          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Chargement des cours...</span>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-4">
                <BookOpen className="h-14 w-14 text-green-600" />
                <span>Cours - {universities.find(u => u.id === selectedUniversityId)?.name}</span>
              </h2>

              {Object.keys(groupCoursesByStudyYear()).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupCoursesByStudyYear())
                    .sort(([a], [b]) => a.localeCompare(b)) // Sort study years
                    .map(([studyYear, courses]) => (
                    <div key={studyYear} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleStudyYear(studyYear)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                            {studyYear}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {courses.length} cours
                            </Badge>
                            <Button variant="ghost" size="sm">
                              {expandedStudyYears.has(studyYear) ? '▼' : '▶'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {expandedStudyYears.has(studyYear) && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses
                              .sort((a, b) => b.year.localeCompare(a.year))
                              .map((course) => (
                                <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer group bg-white">
                                  <CardHeader className="pb-3">
                                    <div className="flex flex-col gap-2 sm:flex-row justify-between items-center">
                                      <div className="flex-1 flex flex-col items-center sm:items-start">
                                        <CardTitle className="text-base flex items-center group-hover:text-blue-600 transition-colors">
                                          <Calendar className="h-7 w-7 mr-3 text-blue-600" />
                                          <span className="text-base">Année {course.year}</span>
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-500 mt-1 text-center sm:text-left">
                                          {studyYear} - {course.year}
                                        </CardDescription>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openCourse(course.link, universities.find(u => u.id === selectedUniversityId)?.name || '', studyYear, course.year);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <ExternalLink className="h-5 w-5" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <Button
                                      variant="primary"
                                      className="w-full py-3 text-base flex items-center justify-center"
                                      onClick={() => openCourse(course.link, universities.find(u => u.id === selectedUniversityId)?.name || '', studyYear, course.year)}
                                    >
                                      <ExternalLink className="h-6 w-6 mr-2" />
                                      <span className="text-sm sm:text-base">Accéder au Cours</span>
                                    </Button>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-50">
                  <CardContent className="py-12">
                    <div className="text-center text-gray-500">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Aucun cours disponible</h3>
                      <p className="text-sm">
                        Aucun cours n'est actuellement disponible pour cette université.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}