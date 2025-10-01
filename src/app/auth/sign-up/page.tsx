'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@/hooks/useForm';
import { Mail, Lock, User, GraduationCap, Building } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import BackgroundGradient from '@/components/ui/BackgroundGradient';
import { useRouter } from 'next/navigation';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  year: string;
  university: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    values,
    errors,
    isSubmitting,
    isValid,
    handleSubmit,
    getFieldProps,
    setValue,
  } = useForm<SignUpFormData>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      year: '',
      university: '',
    },
    validationRules: {
      name: {
        required: true,
        minLength: 2,
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
      password: {
        required: true,
        minLength: 8,
      },
      confirmPassword: {
        required: true,
        custom: (value) => {
          if (value !== values.password) {
            return 'Les mots de passe ne correspondent pas';
          }
          return null;
        },
      },
      year: {
        required: true,
      },
      university: {
        required: true,
        minLength: 2,
      },
    },
    onSubmit: async (formData) => {
      setAuthError('');
      
      try {
        const response = await fetch('/api/auth/sign-up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            year: formData.year,
            university: formData.university,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setAuthError(result.message || 'Erreur lors de la création du compte');
          return;
        }

        setIsSuccess(true);
        setSuccessMessage(result.message);
        // Redirect to sign-in after successful registration
        setTimeout(() => {
          router.push('/auth/sign-in?message=Vérifiez votre e-mail pour activer votre compte');
        }, 3000);
      } catch (error) {
        setAuthError('Erreur de réseau. Veuillez réessayer.');
        console.error('Sign up error:', error);
      }
    },
  });

  if (isSuccess) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-green-300 to-emerald-100 flex items-center justify-center p-4">
        <BackgroundGradient />
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Compte créé avec succès !</h1>
              <p className="text-gray-600 mt-2 mb-4">
                {successMessage}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-700 text-sm">
                  📧 Vérifiez votre boîte e-mail et cliquez sur le lien de vérification pour activer votre compte.
                </p>
              </div>
              <p className="text-gray-500 text-sm">
                Vous allez être redirigé vers la page de connexion...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-purple-300 to-indigo-100 flex items-center justify-center p-4">
      <BackgroundGradient />
      <div className="max-w-md w-full">
        
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center mb-4 backdrop-blur-xl rounded-lg p-2">
            <Image
              src="/pharmapedia-logo.png"
              alt="Pharmapedia Logo"
              width={300}
              height={150}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Rejoignez Pharmapedia</h1>
          <p className="text-gray-600 mt-2">Créez votre compte et commencez votre apprentissage</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{authError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <Input
              variant="default"
              type="text"
              label="Nom complet"
              placeholder="Entrez votre nom complet"
              leftIcon={<User className="h-4 w-4" />}
              {...getFieldProps('name')}
              success={Boolean(values.name && !errors.name)}
            />

            <Input
              variant="default"
              type="email"
              label="Adresse e-mail"
              placeholder="Entrez votre e-mail"
              leftIcon={<Mail className="h-4 w-4" />}
              {...getFieldProps('email')}
              success={Boolean(values.email && !errors.email)}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Année d'études
              </label>
              <select
                value={values.year}
                onChange={(e) => setValue('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner</option>
                <option value="1ère année Pharmacie">1ère année Pharmacie</option>
                <option value="2ème année Pharmacie">2ème année Pharmacie</option>
                <option value="3ème année Pharmacie">3ème année Pharmacie</option>
                <option value="4ème année Pharmacie">4ème année Pharmacie</option>
                <option value="5ème année Pharmacie">5ème année Pharmacie</option>
                <option value="6ème année Pharmacie">6ème année Pharmacie</option>
                <option value="Résidanat">Résidanat</option>
                <option value="Docteur en Pharmacie">Docteur en Pharmacie</option>
              </select>
              {errors.year && (
                <p className="text-sm text-red-600">{errors.year}</p>
              )}
            </div>

            <Input
              variant="default"
              type="text"
              label="Université"
              placeholder="Nom de votre université"
              leftIcon={<Building className="h-4 w-4" />}
              {...getFieldProps('university')}
              success={Boolean(values.university && !errors.university)}
            />

            <Input
              variant="default"
              type="password"
              label="Mot de passe"
              placeholder="Créez un mot de passe (min. 8 caractères)"
              leftIcon={<Lock className="h-4 w-4" />}
              showPasswordToggle
              {...getFieldProps('password')}
            />

            <Input
              variant="default"
              type="password"
              label="Confirmer le mot de passe"
              placeholder="Confirmez votre mot de passe"
              leftIcon={<Lock className="h-4 w-4" />}
              showPasswordToggle
              {...getFieldProps('confirmPassword')}
            />

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-600">
                  J'accepte les{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                    conditions d'utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                    politique de confidentialité
                  </Link>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Création du compte...' : 'Créer mon compte'}
            </Button>

          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link 
                href="/auth/sign-in" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              En créant un compte, vous rejoignez une communauté d'étudiants en pharmacie 
              et accédez à des ressources pédagogiques de qualité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering to avoid prerendering issues with event handlers
export const dynamic = 'force-dynamic';