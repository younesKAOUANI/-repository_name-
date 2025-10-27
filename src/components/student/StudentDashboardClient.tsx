'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Progress component inline
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  Activity,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  GraduationCap,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  overview: {
    totalAttempts: number;
    completedQuizzes: number;
    averageScore: string;
    completionRate: string;
    totalQuizzesAvailable: number;
  };
  progress: {
    NOT_STARTED: number;
    IN_PROGRESS: number;
    COMPLETED: number;
  };
  recentActivity: Array<{
    id: string;
    quizTitle: string;
    score: number | null;
    completedAt: string | null;
    module: string;
    studyYear: string;
  }>;
  topPerformance: Array<{
    quizTitle: string;
    score: number;
    module: string;
    studyYear: string;
  }>;
  strugglingAreas: Array<{
    quizTitle: string;
    score: number;
    module: string;
    studyYear: string;
  }>;
  activityChart: Record<string, number>;
}

export default function StudentDashboardClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/student/dashboard-stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (


    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <GraduationCap className="h-6 w-6 mr-3" />
              Tableau de Bord Étudiant
            </h1>
            <p className="text-blue-100 mt-1">
              Bienvenue, {session?.user?.name}! Voici un aperçu de votre progression.
            </p>
          </div>
          <div className="text-right">
            <div className="text-blue-100 text-sm">Aujourd'hui</div>
            <div className="text-lg font-semibold">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>


      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Tentatives</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.overview.totalAttempts || 0}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Quiz Complétés</p>
                <p className="text-2xl font-bold text-green-600">{stats?.overview.completedQuizzes || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Score Moyen</p>
                <p className={`text-2xl font-bold ${getScoreColor(parseFloat(stats?.overview.averageScore || '0'))}`}> 
                  {stats?.overview.averageScore || '0'}%
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Taux de Complétion</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.overview.completionRate || '0'}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview - Personal Info card removed */}

      {/* Recent Activity & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Activité Récente
            </CardTitle>
            <CardDescription>
              Vos dernières tentatives de quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity.length ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{activity.quizTitle}</p>
                      <p className="text-xs text-gray-500">
                        {activity.module} • {activity.studyYear}
                      </p>
                    </div>
                    <div className="text-right">
                      {activity.score !== null ? (
                        <Badge variant={getScoreBadgeVariant(activity.score)}>
                          {activity.score}%
                        </Badge>
                      ) : (
                        <Badge variant="outline">En cours</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-6">
                Aucune activité récente
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Meilleures Performances
            </CardTitle>
            <CardDescription>
              Vos meilleurs résultats de quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topPerformance.length ? (
              <div className="space-y-3">
                {stats.topPerformance.map((performance, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{performance.quizTitle}</p>
                      <p className="text-xs text-gray-500">
                        {performance.module} • {performance.studyYear}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {performance.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-6">
                Commencez des quiz pour voir vos performances
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Areas to Improve */}
      {stats?.strugglingAreas.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
              Domaines à Améliorer
            </CardTitle>
            <CardDescription>
              Quiz où vous pourriez améliorer vos résultats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.strugglingAreas.map((area, index) => (
                <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium truncate">{area.quizTitle}</h4>
                    <Badge variant="destructive">{area.score}%</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{area.module}</p>
                  <p className="text-xs text-gray-500">{area.studyYear}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

    </div>
  );
}