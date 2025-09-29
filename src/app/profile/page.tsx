'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, User, Key, CreditCard, TrendingUp, Calendar, Trophy, Target, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface License {
  id: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  plan: {
    name: string;
    type: string;
    price: number;
    planType: {
      name: string;
    };
  };
  yearScope: {
    studyYear: {
      id: string;
      year: number;
      name: string;
    };
  } | null;
  semScope: {
    semester: {
      studyYear: {
        id: string;
        year: number;
        name: string;
      };
    };
  } | null;
  modScope: {
    module: {
      semester: {
        studyYear: {
          id: string;
          year: number;
          name: string;
        };
      };
    };
  } | null;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  studyYearId: string;
  createdAt: string;
  licenses: License[];
}

interface StudentStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  studyStreak: number;
  recentActivity: Array<{
    id: string;
    score: number;
    finishedAt: string;
    quiz: {
      id: string;
      title: string;
      type: string;
      moduleName: string;
    };
  }>;
  performanceByModule: Array<{
    id: string;
    name: string;
    totalAttempts: number;
    averageScore: number;
  }>;
}

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/student/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
      } else {
        setError('Échec du chargement du profil');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/student/profile/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const updatePersonalInfo = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      if (response.ok) {
        setSuccess('Informations personnelles mises à jour avec succès');
        fetchProfile();
      } else {
        const data = await response.json();
        setError(data.error || 'Échec de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setSuccess('Mot de passe mis à jour avec succès');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        setError(data.error || 'Échec de la mise à jour du mot de passe');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      setError('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (license: License) => {
    const now = new Date();
    const endDate = new Date(license.endDate);
    
    if (!license.isActive) {
      return 'secondary';
    } else if (endDate < now) {
      return 'destructive';
    } else {
      return 'default';
    }
  };

  const getStatusText = (license: License) => {
    const now = new Date();
    const endDate = new Date(license.endDate);
    
    if (!license.isActive) {
      return 'Suspendue';
    } else if (endDate < now) {
      return 'Expirée';
    } else {
      return 'Active';
    }
  };

  const getLicenseScope = (license: License) => {
    if (license.yearScope) {
      return license.yearScope.studyYear.name;
    } else if (license.semScope) {
      return `Semestre - ${license.semScope.semester.studyYear.name}`;
    } else if (license.modScope) {
      return `Module - ${license.modScope.module.semester.studyYear.name}`;
    }
    return 'Portée inconnue';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Impossible de charger le profil utilisateur.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <User className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et vos licences</p>
        </div>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="personal">Informations</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="licenses">Licences</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Complétés</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total des quizzes terminés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageScore || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Moyenne de tous vos quizzes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meilleur Score</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.bestScore || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Votre meilleure performance
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
                <CardDescription>Vos derniers quizzes complétés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{activity.quiz.title}</p>
                        <p className="text-xs text-gray-500">{activity.quiz.moduleName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.score >= 80 ? 'default' : 'secondary'}>
                          {activity.score}%
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(activity.finishedAt)}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">Aucune activité récente</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance par Module</CardTitle>
                <CardDescription>Vos résultats par matière</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.performanceByModule.slice(0, 5).map((module) => (
                    <div key={module.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{module.name}</p>
                        <p className="text-xs text-gray-500">{module.totalAttempts} quizzes</p>
                      </div>
                      <Badge variant={module.averageScore >= 80 ? 'default' : 'secondary'}>
                        {module.averageScore}%
                      </Badge>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom complet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button
                  onClick={updatePersonalInfo}
                  disabled={saving}
                >
                  {saving ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Changer le Mot de Passe</CardTitle>
              <CardDescription>
                Mettez à jour votre mot de passe pour sécuriser votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Votre mot de passe actuel"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le nouveau mot de passe"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={updatePassword}
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                >
                  {saving ? 'Mise à jour...' : 'Changer le mot de passe'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mes Licences</CardTitle>
              <CardDescription>
                Gérez vos licences d'accès aux formations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.licenses.length > 0 ? (
                  profile.licenses.map((license) => (
                    <div key={license.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{license.plan.name}</span>
                        </div>
                        <Badge variant={getStatusBadgeVariant(license)}>
                          {getStatusText(license)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Portée</p>
                          <p>{getLicenseScope(license)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Date d'activation</p>
                          <p>{formatDate(license.startDate)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Date d'expiration</p>
                          <p>{formatDate(license.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune licence active</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Contactez l'administration pour obtenir une licence
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Série d'étude</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.studyStreak || 0}</div>
                <p className="text-xs text-muted-foreground">
                  jours consécutifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Complétés</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
                <p className="text-xs text-muted-foreground">
                  au total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageScore || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  moyenne générale
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meilleur Score</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.bestScore || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  record personnel
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Détaillée par Module</CardTitle>
                <CardDescription>Analyse complète de vos résultats par matière</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.performanceByModule.map((module) => (
                    <div key={module.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{module.name}</h4>
                        <Badge variant={module.averageScore >= 80 ? 'default' : 'secondary'}>
                          {module.averageScore}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            module.averageScore >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${module.averageScore}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {module.totalAttempts} quiz{module.totalAttempts > 1 ? 'zes' : ''} complété{module.totalAttempts > 1 ? 's' : ''}
                      </p>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique Récent</CardTitle>
                <CardDescription>Vos 10 dernières tentatives de quiz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.quiz.title}</p>
                        <p className="text-xs text-gray-500">{activity.quiz.moduleName}</p>
                        <p className="text-xs text-gray-400">{formatDate(activity.finishedAt)}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.score >= 80 ? 'default' : 'secondary'}>
                          {activity.score}%
                        </Badge>
                        <div className="flex items-center gap-1 mt-1">
                          {activity.score >= 90 && <Trophy className="h-3 w-3 text-yellow-500" />}
                          {activity.score >= 80 && activity.score < 90 && <TrendingUp className="h-3 w-3 text-green-500" />}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">Aucune activité récente</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
