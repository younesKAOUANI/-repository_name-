'use client';

import { ArrowRight, CheckCircle, Users, Trophy, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CTA() {
  const benefits = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      text: "Accès à plus de 20,000 questions"
    },
    // {
    //   icon: <Users className="w-6 h-6" />,
    //   text: "Rejoignez 10,000+ étudiants"
    // },
    // {
    //   icon: <Trophy className="w-6 h-6" />,
    //   text: "95% de taux de réussite"
    // },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      text: "Suivi de vos progrès"
    }
  ];

  return (
    <motion.section 
      className="py-20 bg-gradient-to-r from-pharmapedia-primary-600 via-pharmapedia-primary-700 to-pharmapedia-secondary-600 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"
          animate={{ 
            x: [0, 10, -5, 0],
            y: [0, -5, 10, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div 
          className="absolute top-20 right-10 w-32 h-32 bg-white rounded-full"
          animate={{ 
            x: [0, -8, 12, 0],
            y: [0, 8, -6, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-10 left-1/4 w-24 h-24 bg-white rounded-full"
          animate={{ 
            x: [0, 15, -10, 0],
            y: [0, -12, 8, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24"
          animate={{ 
            x: [24, 14, 34, 24],
            y: [24, 34, 14, 24],
            scale: [1, 0.95, 1.05, 1]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div className="text-center">
          {/* Main Heading */}
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Prêt à transformer votre
            <motion.span 
              className="block bg-gradient-to-r from-pharmapedia-accent-300 to-pharmapedia-accent-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              apprentissage?
            </motion.span>
          </motion.h2>

          <motion.p 
            className="text-xl text-pharmapedia-secondary-100 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            Rejoignez la communauté d&apos;étudiants qui réussissent leurs examens 
            grâce à notre plateforme d&apos;apprentissage personnalisée
          </motion.p>

          {/* Benefits Grid */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index} 
                className="flex items-center space-x-3 text-white"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="bg-white/20 rounded-full p-2 flex-shrink-0"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {benefit.icon}
                </motion.div>
                <span className="text-sm md:text-base text-left">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 sm:gap-4 justify-center items-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/auth/sign-up"
                className="group bg-white text-pharmapedia-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 2.0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/auth/sign-in"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-pharmapedia-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Se connecter
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          {/* <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-pharmapedia-secondary-100">
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
          </div> */}

          {/* Urgency Element */}
          {/* <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
            <p className="text-white text-sm">
              🔥 <strong>Offre limitée:</strong> Les 100 premiers inscrits bénéficient 
              d&apos;un accès premium gratuit pendant 1 mois !
            </p>
          </div> */}
        </div>
      </motion.div>
    </motion.section>
  );
}