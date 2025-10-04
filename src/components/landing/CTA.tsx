'use client';

import { ArrowRight, CheckCircle, Users, Trophy, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  const benefits = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      text: "Accès à plus de 50,000 questions"
    },
    {
      icon: <Users className="w-6 h-6" />,
      text: "Rejoignez 10,000+ étudiants"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      text: "95% de taux de réussite"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      text: "Suivi personnalisé de vos progrès"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-pharmapedia-primary-600 via-pharmapedia-primary-700 to-pharmapedia-secondary-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à transformer votre
            <span className="block bg-gradient-to-r from-pharmapedia-accent-300 to-pharmapedia-accent-500 bg-clip-text text-transparent">
              apprentissage médical ?
            </span>
          </h2>

          <p className="text-xl text-pharmapedia-secondary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Rejoignez la communauté d&apos;étudiants qui réussissent leurs examens 
            grâce à notre plateforme d&apos;apprentissage personnalisée
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 text-white">
                <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                  {benefit.icon}
                </div>
                <span className="text-sm md:text-base">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link 
              href="/auth/sign-up"
              className="group bg-white text-pharmapedia-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <Link 
              href="/auth/sign-in"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-pharmapedia-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Se connecter
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-pharmapedia-secondary-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="text-sm">Essai gratuit de 14 jours</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="text-sm">Aucune carte bancaire requise</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="text-sm">Annulation à tout moment</span>
            </div>
          </div>

          {/* Urgency Element */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
            <p className="text-white text-sm">
              🔥 <strong>Offre limitée:</strong> Les 100 premiers inscrits bénéficient 
              d&apos;un accès premium gratuit pendant 1 mois !
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}