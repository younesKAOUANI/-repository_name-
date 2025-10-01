'use client';

import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* 404 Illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="text-8xl font-bold text-blue-100 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Page introuvable
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
          Vérifiez l'URL ou retournez à l'accueil.
        </p>

        {/* Suggested Actions */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">Que pouvez-vous faire ?</h3>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li>• Vérifier l'orthographe de l'URL</li>
            <li>• Retourner à la page précédente</li>
            <li>• Aller à la page d'accueil</li>
            <li>• Utiliser la navigation du site</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => window.history.back()}
            variant="secondary"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          
          <Link href="/" className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Liens rapides :</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/student/dashboard" className="text-blue-600 hover:text-blue-800">
              Tableau de bord étudiant
            </Link>
            <Link href="/student/exams" className="text-blue-600 hover:text-blue-800">
              Examens
            </Link>
            <Link href="/student/quizzes" className="text-blue-600 hover:text-blue-800">
              Quiz
            </Link>
            <Link href="/profile" className="text-blue-600 hover:text-blue-800">
              Profil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic';
