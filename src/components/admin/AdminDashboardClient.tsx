'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  MdSchool,
  MdPerson,
  MdCardMembership,
  MdBusiness,
  MdMenuBook,
  MdSettings,
  MdQuiz,
  MdTrendingUp,
  MdAssignment,
  MdGroups,
  MdBarChart,
  MdTimeline,
  MdEventNote,
  MdSpeed,
  MdError,
  MdCheckCircle,
  MdHourglassEmpty,
  MdRefresh
} from 'react-icons/md';

interface DashboardStats {
  users: {
    total: number;
    students: number;
    instructors: number;
    admins: number;
    newThisMonth: number;
    activeToday: number;
  };
  universities: {
    total: number;
    withActiveStudents: number;
  };
  content: {
    studyYears: number;
    semesters: number;
    modules: number;
    lessons: number;
    questionBank: number;
  };
  quizzes: {
    total: number;
    exams: number;
    sessions: number;
    regular: number;
    attempts: number;
    completedAttempts: number;
    avgScore: number;
  };
  licenses: {
    active: number;
    expired: number;
    total: number;
    revenue: number;
  };
  activity: {
    dailyAttempts: { date: string; count: number }[];
    topPerformers: { name: string; university: string; avgScore: number }[];
    recentActivity: { 
      type: string; 
      description: string; 
      timestamp: string;
      user?: string;
    }[];
  };
}

interface QuizPerformance {
  quizTitle: string;
  attempts: number;
  avgScore: number;
  completionRate: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function AdminDashboardClient() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quizPerformance, setQuizPerformance] = useState<QuizPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, performanceRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/quiz-performance')
      ]);
      
      if (statsRes.ok && performanceRes.ok) {
        const statsData = await statsRes.json();
        const performanceData = await performanceRes.json();
        
        setStats(statsData);
        setQuizPerformance(performanceData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MdHourglassEmpty className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord administrateur</h1>
          <p className="text-gray-600">Vue d'ensemble complète du système</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Overview */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800 uppercase tracking-wide">Utilisateurs</h3>
              <p className="text-3xl font-bold text-blue-900">{stats?.users.total || 0}</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Étudiants:</span>
                  <span className="font-semibold text-blue-900">{stats?.users.students || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Enseignants:</span>
                  <span className="font-semibold text-blue-900">{stats?.users.instructors || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Nouveaux ce mois:</span>
                  <span className="font-semibold text-green-600">+{stats?.users.newThisMonth || 0}</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <MdGroups className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Quiz & Exam Analytics */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-purple-800 uppercase tracking-wide">Examens & Quiz</h3>
              <p className="text-3xl font-bold text-purple-900">{stats?.quizzes.total || 0}</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700">Examens:</span>
                  <span className="font-semibold text-purple-900">{stats?.quizzes.exams || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700">Sessions:</span>
                  <span className="font-semibold text-purple-900">{stats?.quizzes.sessions || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700">Score moyen:</span>
                  <span className="font-semibold text-green-600">{stats?.quizzes.avgScore || 0}%</span>
                </div>
              </div>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <MdQuiz className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Content Overview */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-800 uppercase tracking-wide">Contenu</h3>
              <p className="text-3xl font-bold text-green-900">{stats?.content.modules || 0}</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Années d'étude:</span>
                  <span className="font-semibold text-green-900">{stats?.content.studyYears || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Semestres:</span>
                  <span className="font-semibold text-green-900">{stats?.content.semesters || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Leçons:</span>
                  <span className="font-semibold text-green-900">{stats?.content.lessons || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Questions:</span>
                  <span className="font-semibold text-green-900">{stats?.content.questionBank || 0}</span>
                </div>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <MdMenuBook className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Revenue & Licenses */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-orange-800 uppercase tracking-wide">Licences</h3>
              <p className="text-3xl font-bold text-orange-900">{stats?.licenses.active || 0}</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700">Total:</span>
                  <span className="font-semibold text-orange-900">{stats?.licenses.total || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700">Expirées:</span>
                  <span className="font-semibold text-red-600">{stats?.licenses.expired || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700">Revenus:</span>
                  <span className="font-semibold text-green-600">{stats?.licenses.revenue || 0}€</span>
                </div>
              </div>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <MdCardMembership className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Quizzes */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MdBarChart className="w-5 h-5 mr-2 text-blue-600" />
              Performance des Quiz
            </h3>
          </div>
          <div className="p-6">
            {quizPerformance.length > 0 ? (
              <div className="space-y-4">
                {quizPerformance.slice(0, 5).map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">{quiz.quizTitle}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{quiz.attempts} tentatives</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{quiz.avgScore}%</div>
                      <div className="text-sm text-gray-600">{quiz.completionRate}% completion</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune donnée de performance disponible</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MdTimeline className="w-5 h-5 mr-2 text-purple-600" />
              Activité Récente
            </h3>
          </div>
          <div className="p-6">
            {stats?.activity.recentActivity && stats.activity.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.activity.recentActivity.slice(0, 6).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'quiz_attempt' ? 'bg-blue-100' :
                      activity.type === 'user_registration' ? 'bg-green-100' :
                      activity.type === 'license_purchase' ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'quiz_attempt' ? (
                        <MdQuiz className="w-4 h-4 text-blue-600" />
                      ) : activity.type === 'user_registration' ? (
                        <MdPerson className="w-4 h-4 text-green-600" />
                      ) : activity.type === 'license_purchase' ? (
                        <MdCardMembership className="w-4 h-4 text-orange-600" />
                      ) : (
                        <MdEventNote className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      {activity.user && (
                        <p className="text-xs text-gray-500">Par: {activity.user}</p>
                      )}
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MdSpeed className="w-5 h-5 mr-2 text-green-600" />
            Activité Quotidienne - Tentatives de Quiz
          </h3>
        </div>
        <div className="p-6">
          {stats?.activity.dailyAttempts && stats.activity.dailyAttempts.length > 0 ? (
            <div className="flex items-end justify-between space-x-2 h-32">
              {stats.activity.dailyAttempts.slice(-7).map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-blue-500 rounded-t w-full min-h-[4px]"
                    style={{ height: `${Math.max(4, (day.count / Math.max(...stats.activity.dailyAttempts.map(d => d.count)) * 100))}%` }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2 text-center">
                    <div className="font-medium">{day.count}</div>
                    <div>{new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MdBarChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Aucune donnée d'activité disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MdTrendingUp className="w-5 h-5 mr-2 text-yellow-600" />
            Top Performers
          </h3>
        </div>
        <div className="p-6">
          {stats?.activity.topPerformers && stats.activity.topPerformers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.activity.topPerformers.slice(0, 6).map((performer, index) => (
                <div key={index} className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{performer.name}</h4>
                      <p className="text-sm text-gray-600">{performer.university}</p>
                      <div className="flex items-center mt-1">
                        <MdSpeed className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-green-600">{performer.avgScore}% moyenne</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun performer à afficher</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Actions Rapides</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button variant="secondary" fullWidth className="flex items-center justify-center space-x-2 h-12">
                <MdPerson className="w-5 h-5" />
                <span>Gérer Utilisateurs</span>
              </Button>
            </Link>
            <Link href="/admin/universities">
              <Button variant="secondary" fullWidth className="flex items-center justify-center space-x-2 h-12">
                <MdBusiness className="w-5 h-5" />
                <span>Universités</span>
              </Button>
            </Link>
            <Link href="/admin/modules">
              <Button variant="secondary" fullWidth className="flex items-center justify-center space-x-2 h-12">
                <MdMenuBook className="w-5 h-5" />
                <span>Modules</span>
              </Button>
            </Link>
            <Link href="/admin/licenses">
              <Button variant="secondary" fullWidth className="flex items-center justify-center space-x-2 h-12">
                <MdCardMembership className="w-5 h-5" />
                <span>Licences</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}