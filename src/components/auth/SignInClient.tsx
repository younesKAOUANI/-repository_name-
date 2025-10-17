'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@/hooks/useForm';
import { Mail, Lock, Eye, Github } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import BackgroundGradient from '@/components/ui/BackgroundGradient';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInClient() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string>('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [cooldownInterval, setCooldownInterval] = useState<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownInterval) {
        clearInterval(cooldownInterval);
      }
    };
  }, [cooldownInterval]);

  const startCooldown = () => {
    setResendCooldown(1); // 5 minutes = 300 seconds
    
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCooldownInterval(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setCooldownInterval(interval);
  };

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
          // Check if error is about email verification
          if (result.error.includes('vérifier votre e-mail')) {
            setShowResendVerification(true);
          }
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

  const handleResendVerification = async () => {
    if (!values.email) {
      setAuthError('Veuillez entrer votre adresse e-mail');
      return;
    }

    if (resendCooldown > 0) {
      setAuthError(`Veuillez attendre ${formatCooldownTime(resendCooldown)} avant de renvoyer l'e-mail`);
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (data.success) {
        setResendSuccess(true);
        setAuthError('');
        setShowResendVerification(false);
        startCooldown(); // Start the 5-minute cooldown
      } else {
        setAuthError(data.message || 'Erreur lors de l\'envoi de l\'e-mail');
      }
    } catch (error) {
      setAuthError('Erreur lors de l\'envoi de l\'e-mail de vérification');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-300 to-indigo-100 flex items-center justify-center p-4">
      <AnimatedBackground
        particleCount={200}
        colors={[
          "bg-blue-400",
          "bg-purple-400",
          "bg-pink-400",
          "bg-indigo-400",
          "bg-violet-400",
          "bg-cyan-400",
          "bg-emerald-400",
          "bg-yellow-400",
        ]}
      />
      <BackgroundGradient />
      <div className="max-w-md w-full relative z-20">
        
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 relative z-20">
          <div className="mx-auto  flex items-center justify-center mb-4 p-2">
           <Image
             src="/pharmapedia-logo.png"
             alt="Pharmapedia Logo"
             width={300}
             height={150}
             className="object-contain"
           />
          </div>
          <h1 className="text-3xl font-bold text-white">Bon retour</h1>
          <p className="text-gray-100 mt-2">Connectez-vous à votre compte Pharmapedia</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 relative z-20">
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{authError}</p>
              {showResendVerification && (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleResendVerification}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-sm"
                  >
                    {resendLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Renvoyer dans ${formatCooldownTime(resendCooldown)}`
                    ) : (
                      'Renvoyer l\'e-mail de vérification'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                E-mail de vérification envoyé avec succès ! Vérifiez votre boîte de réception.
              </p>
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

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-white relative z-20">
          <p>
            En vous connectant, vous acceptez nos{' '}
            <Link href="/terms" className="text-white hover:text-gray-200 underline">
              Conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="text-white hover:text-gray-200 underline">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}