'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, User, Key, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface University {
  id: string;
  name: string;
}

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
}

interface QuizAttempt {
  id: string;
  score?: number;
  maxScore?: number;
  percentage?: number;
  completedAt?: string;
  quiz: {
    title?: string;
    module: {
      name?: string;
    };
  };
}

interface StudentStats {
  totalQuizzes?: number;
  averageScore?: number;
  bestScore?: number;
  totalStudyTime?: number;
  currentStreak?: number;
  totalModulesAccessed?: number;
}

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    year?: number;
    university?: string;
    createdAt: string;
  };
  licenses: License[];
  recentQuizAttempts?: QuizAttempt[];
  stats?: StudentStats;
  universities: University[];
}

export default function StudentProfileClient() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    year: '',
    universityId: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'authenticated') {
      loadProfileData();
    }
  }, [status]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/profile');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du profil');
      }
      
      const data = await response.json();
      setProfileData(data);
      
      // Initialize form data
      // Find the university ID that matches the university name
      const matchingUniversity = data.universities?.find(
        (uni: University) => uni.name === data.user.university
      );
      
      setProfileForm({
        name: data.user.name || '',
        year: data.user.year?.toString() || '',
        universityId: matchingUniversity?.id || '',
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileForm.name,
          year: profileForm.year ? parseInt(profileForm.year) : null,
          universityId: profileForm.universityId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      await loadProfileData(); // Reload data
      alert('Profil mis à jour avec succès !');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du changement de mot de passe');
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      alert('Mot de passe mis à jour avec succès !');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h1>
          <p className="text-gray-600">Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadProfileData}>Réessayer</Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  const activeLicense = profileData.licenses.find(l => l.isActive);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et consultez vos statistiques</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}



        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gray-50/50">
              <TabsList className="w-full justify-start p-0 bg-transparent h-auto flex ">
                <TabsTrigger 
                  value="profile" 
                  className="flex items-center gap-3 px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 hover:bg-white/50 transition-all duration-200"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Informations personnelles</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex items-center gap-3 px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 hover:bg-white/50 transition-all duration-200"
                >
                  <Key className="h-5 w-5" />
                  <span className="font-medium">Sécurité</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="subscription" 
                  className="flex items-center gap-3 px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 hover:bg-white/50 transition-all duration-200"
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Abonnement</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profile Tab */}
            <TabsContent value="profile" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Informations personnelles</h3>
                  <p className="text-gray-600 text-sm">Mettez à jour vos informations de profil</p>
                </div>
                
                {/* Current Information Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Informations actuelles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nom :</span>
                      <p className="font-medium text-gray-900">{profileData?.user.name || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Année d'étude :</span>
                      <p className="font-medium text-gray-900">
                        {profileData?.user.year ? `${profileData.user.year}ème année` : 'Non spécifiée'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Université :</span>
                      <p className="font-medium text-gray-900">
                        {profileData?.user.university || 'Non spécifiée'}
                      </p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Votre nom complet"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profileData.user.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Année d'étude</Label>
                      <select
                        id="year"
                        value={profileForm.year}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner une année</option>
                        {[1, 2, 3, 4, 5, 6].map(year => (
                          <option key={year} value={year}>{year}ème année</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="university">Université</Label>
                      <select
                        id="university"
                        value={profileForm.universityId}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, universityId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner une université</option>
                        {profileData?.universities?.map(university => (
                          <option key={university.id} value={university.id}>
                            {university.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                      {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Changer le mot de passe</h3>
                  <p className="text-gray-600 text-sm">Mettez à jour votre mot de passe pour sécuriser votre compte</p>
                </div>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Votre mot de passe actuel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Minimum 8 caractères"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirmer votre nouveau mot de passe"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                      {saving ? 'Mise à jour...' : 'Changer le mot de passe'}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Abonnement actuel</h3>
                  <p className="text-gray-600 text-sm">Gérez votre abonnement et consultez l'historique</p>
                </div>
                {activeLicense ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-900">{activeLicense.plan.name}</h4>
                          <p className="text-green-700">{activeLicense.plan.planType.name}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Actif</Badge>
                      </div>
                      <div className="mt-3 text-sm text-green-700">
                        <p>Début: {formatDate(activeLicense.startDate)}</p>
                        <p>Fin: {formatDate(activeLicense.endDate)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Aucun abonnement actif</p>
                    <Button>Voir les plans d'abonnement</Button>
                  </div>
                )}

                {/* License History */}
                {profileData.licenses.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Historique des licences</h4>
                    <div className="space-y-2">
                      {profileData.licenses.map((license) => (
                        <div key={license.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{license.plan.name}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(license.startDate)} - {formatDate(license.endDate)}
                            </p>
                          </div>
                          <Badge variant={license.isActive ? 'default' : 'secondary'}>
                            {license.isActive ? 'Actif' : 'Expiré'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}