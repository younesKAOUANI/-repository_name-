'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@/hooks/useForm';
import { Mail, Lock, Eye, Github } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import BackgroundGradient from '@/components/ui/BackgroundGradient';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string>('');

  const {
    values,
    errors,
    isSubmitting,
    isValid,
    handleSubmit,
    getFieldProps,
  } = useForm<SignInFormData>({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules: {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
      password: {
        required: true,
        minLength: 1, // Less strict for sign-in
      },
    },
    onSubmit: async (formData) => {
      setAuthError('');
      
      try {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setAuthError(result.error);
          return;
        }

        if (result?.ok) {
          // Get the session to check user role and redirect accordingly
          const session = await getSession();
          const userRole = session?.user?.role;

          // Redirect based on user role
          switch (userRole) {
            case 'ADMIN':
              router.push('/admin/dashboard');
              break;
            case 'INSTRUCTOR':
              router.push('/teacher/dashboard');
              break;
            case 'STUDENT':
            default:
              router.push('/student/dashboard');
              break;
          }
        }
      } catch (error) {
        setAuthError('Erreur de connexion. Veuillez réessayer.');
        console.error('Sign in error:', error);
      }
    },
  });

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-300 to-indigo-100 flex items-center justify-center p-4">
      <BackgroundGradient />
      <div className="max-w-md w-full">
        
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="mx-auto  flex items-center justify-center mb-4 backdrop-blur-xl rounded-lg p-2">
           <Image
             src="/pharmapedia-logo.png"
             alt="Pharmapedia Logo"
             width={300}
             height={150}
             className="object-contain"
           />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bon retour</h1>
          <p className="text-gray-600 mt-2">Connectez-vous à votre compte Pharmapedia</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{authError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <Input
              variant="default"
              type="email"
              label="Adresse e-mail"
              placeholder="Entrez votre e-mail"
              leftIcon={<Mail className="h-4 w-4" />}
              {...getFieldProps('email')}
              success={Boolean(values.email && !errors.email)}
            />

            <Input
              variant="default"
              type="password"
              label="Mot de passe"
              placeholder="Entrez votre mot de passe"
              leftIcon={<Lock className="h-4 w-4" />}
              showPasswordToggle
              {...getFieldProps('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-600">Se souvenir de moi</span>
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </Button>

          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">Ou continuer avec</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Sign In */}
          <div className="space-y-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => signIn('google')}
              leftIcon={<svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>}
            >
              Continuer avec Google
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link 
                href="/auth/sign-up" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-3">Comptes de test disponibles</h3>
          <div className="text-xs text-blue-700 space-y-2">
            <div className="bg-white p-2 rounded border">
              <p><strong>👑 Administrateur:</strong></p>
              <p>E-mail: admin@pharmapedia.com</p>
              <p>Mot de passe: password123</p>
            </div>
            <div className="bg-white p-2 rounded border">
              <p><strong>👨‍🏫 Enseignant:</strong></p>
              <p>E-mail: teacher@pharmapedia.com</p>
              <p>Mot de passe: password123</p>
            </div>
            <div className="bg-white p-2 rounded border">
              <p><strong>👨‍🎓 Étudiant:</strong></p>
              <p>E-mail: student1@pharmapedia.com</p>
              <p>Mot de passe: password123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            En vous connectant, vous acceptez nos{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700">
              Conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
