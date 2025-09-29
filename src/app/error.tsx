'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Oups ! Une erreur s'est produite
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Une erreur inattendue s'est produite lors du chargement de cette page. 
          Nous nous excusons pour ce désagrément.
        </p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Détails de l'erreur :</h3>
            <p className="text-sm text-gray-600 font-mono">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={reset}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => window.location.href = '/'}
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-6">
          Si le problème persiste, veuillez contacter l'assistance technique.
        </p>
      </div>
    </div>
  )
}
