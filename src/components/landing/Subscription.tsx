'use client';

import { useState } from 'react';
import { Mail, Gift, Bell, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Subscription() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  const benefits = [
    "Nouvelles questions exclusives chaque semaine",
    "Conseils d'étude personnalisés",
    "Accès prioritaire aux nouvelles fonctionnalités",
    "Webinaires gratuits avec des experts",
    "Ressources pédagogiques exclusives"
  ];

  return (
    <motion.section 
      className="py-20 bg-gradient-to-br from-pharmapedia-primary-50 via-white to-pharmapedia-secondary-50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-pharmapedia-primary-600 to-pharmapedia-secondary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Gift className="w-4 h-4" />
              <span>Newsletter Exclusive</span>
            </motion.div>
            
            <motion.h2 
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Restez informé de nos dernières nouveautés
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              Rejoignez notre newsletter et recevez chaque semaine des conseils d&apos;étude, 
              des nouvelles questions et des ressources exclusives pour réussir vos examens
            </motion.p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Side - Benefits */}
              <div className="p-8 lg:p-12 bg-gradient-to-br from-pharmapedia-primary-600 to-pharmapedia-secondary-700 text-white">
                <div className="flex items-center space-x-3 mb-6">
                  <Bell className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Avantages exclusifs</h3>
                </div>
                
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                      <span className="text-pharmapedia-primary-100">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-gradient-to-r from-pharmapedia-accent-400 to-pharmapedia-accent-600 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                        >
                          {String.fromCharCode(65 + i - 1)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="font-semibold">+5,000 abonnés</div>
                      <div className="text-pharmapedia-secondary-200 text-xs">nous font déjà confiance</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="p-8 lg:p-12">
                {!isSubscribed ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="votre@email.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pharmapedia-primary-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full bg-gradient-to-r from-pharmapedia-primary-600 to-pharmapedia-secondary-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-pharmapedia-primary-700 hover:to-pharmapedia-secondary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Inscription en cours...</span>
                        </div>
                      ) : (
                        'S\'inscrire à la newsletter'
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      En vous inscrivant, vous acceptez de recevoir nos emails. 
                      Vous pouvez vous désinscrire à tout moment.
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Inscription réussie !
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Merci de vous être inscrit à notre newsletter. 
                      Vous recevrez bientôt votre premier email avec des ressources exclusives.
                    </p>
                    <button
                      onClick={() => setIsSubscribed(false)}
                      className="text-pharmapedia-primary-600 hover:text-pharmapedia-primary-700 font-medium"
                    >
                      Inscrire une autre adresse
                    </button>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Pas de spam</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Données sécurisées</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Désabonnement facile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}