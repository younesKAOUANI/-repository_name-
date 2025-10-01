'use client';

// Force dynamic rendering to avoid prerendering issues with event handlers
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface VerificationResult {
  success: boolean;
  message: string;
  verified?: boolean;
  alreadyVerified?: boolean;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setResult({
          success: false,
          message: "Token de vérification manquant dans l'URL",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data: VerificationResult = await response.json();
        setResult(data);
      } catch (error) {
        console.error('Verification error:', error);
        setResult({
          success: false,
          message: "Erreur lors de la vérification de l'adresse e-mail",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Vérification en cours...
            </h1>
            <p className="text-gray-600">
              Nous vérifions votre adresse e-mail, veuillez patienter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = result?.success && (result?.verified || result?.alreadyVerified);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          {isSuccess ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          )}
          
          <h1 className={`text-2xl font-bold mb-4 ${
            isSuccess ? 'text-green-700' : 'text-red-700'
          }`}>
            {isSuccess ? 'Vérification réussie !' : 'Vérification échouée'}
          </h1>
          
          <p className={`text-lg mb-6 ${
            isSuccess ? 'text-green-600' : 'text-red-600'
          }`}>
            {result?.message}
          </p>

          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700 text-sm">
                  Votre compte est maintenant activé et vous pouvez vous connecter.
                </p>
              </div>
            </div>
          )}

          {!isSuccess && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-700 mb-2">
                Que pouvez-vous faire ?
              </h3>
              <ul className="text-red-600 text-sm space-y-1">
                <li>• Vérifiez que le lien est complet et non tronqué</li>
                <li>• Le lien peut avoir expiré (24h de validité)</li>
                <li>• Demandez un nouveau lien de vérification</li>
              </ul>
            </div>
          )}

          <div className="space-y-3">
            {isSuccess ? (
              <Link href="/auth/sign-in">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Se connecter maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/sign-up">
                <Button variant="secondary" className="w-full">
                  Créer un nouveau compte
                </Button>
              </Link>
            )}
            
            <Link href="/">
              <Button variant="ghost" className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              Pharmapedia
            </div>
            <p className="text-gray-500 text-sm">
              Plateforme d'apprentissage en pharmacie
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}