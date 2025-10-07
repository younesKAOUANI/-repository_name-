'use client';

import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
  university: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Dubois",
    role: "Étudiante en Pharmacie - 3ème année",
    avatar: "/api/placeholder/60/60",
    rating: 5,
    comment: "Pharmapedia a révolutionné ma façon d'étudier. Les quiz interactifs et les examens blancs m'ont permis d'améliorer considérablement mes résultats.",
    university: "Université de Lyon"
  },
  {
    id: 2,
    name: "Antoine Martin",
    role: "Étudiant en Médecine - 4ème année",
    avatar: "/api/placeholder/60/60",
    rating: 5,
    comment: "Une plateforme exceptionnelle ! Les questions sont de haute qualité et couvrent parfaitement le programme. Je recommande vivement.",
    university: "Université Paris Descartes"
  },
  {
    id: 3,
    name: "Marine Lefevre",
    role: "Étudiante en Pharmacie - 5ème année",
    avatar: "/api/placeholder/60/60",
    rating: 5,
    comment: "Grâce à Pharmapedia, j'ai pu identifier mes lacunes et m'améliorer rapidement. L'interface est intuitive et le contenu est excellent.",
    university: "Université de Bordeaux"
  },
  {
    id: 4,
    name: "Thomas Bernard",
    role: "Étudiant en Médecine - 6ème année",
    avatar: "/api/placeholder/60/60",
    rating: 5,
    comment: "Les statistiques détaillées et le suivi de progression sont fantastiques. Cela m'a aidé à me préparer efficacement pour mes examens.",
    university: "Université de Marseille"
  },
  {
    id: 5,
    name: "Julie Moreau",
    role: "Étudiante en Pharmacie - 4ème année",
    avatar: "/api/placeholder/60/60",
    rating: 5,
    comment: "Une ressource indispensable pour tout étudiant en santé. La variété des questions et la qualité pédagogique sont remarquables.",
    university: "Université de Lille"
  },
  {
    id: 6,
    name: "Nicolas Petit",
    role: "Étudiant en Médecine - 5ème année",
    avatar: "/api/placeholder/60/60",
    rating: 5,
    comment: "J'adore la fonction de révision personnalisée. Elle s'adapte parfaitement à mon rythme d'apprentissage et à mes besoins spécifiques.",
    university: "Université de Strasbourg"
  }
];

export default function Reviews() {
  return (
    <motion.section 
      className="py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Ce que disent nos étudiants
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            Découvrez les témoignages de milliers d&apos;étudiants qui ont transformé 
            leur apprentissage avec Pharmapedia
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {[
            { value: "4.9/5", label: "Note moyenne" },
            { value: "10k+", label: "Étudiants actifs" },
            { value: "95%", label: "Taux de réussite" },
            { value: "50k+", label: "Questions disponibles" }
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="text-4xl font-bold text-pharmapedia-primary-600 mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
                viewport={{ once: true }}
              >
                {stat.value}
              </motion.div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Reviews Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          viewport={{ once: true }}
        >
          {reviews.map((review, index) => (
            <motion.div 
              key={review.id} 
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              {/* Quote Icon */}
              <div className="flex items-center justify-between mb-4">
                <Quote className="w-8 h-8 text-pharmapedia-primary-600 opacity-50" />
                <div className="flex items-center space-x-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-pharmapedia-accent-500 fill-current" />
                  ))}
                </div>
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                &quot;{review.comment}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-pharmapedia-primary-600 to-pharmapedia-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">{review.name}</div>
                  <div className="text-sm text-gray-600">{review.role}</div>
                  <div className="text-xs text-pharmapedia-primary-600">{review.university}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.4 }}
          viewport={{ once: true }}
        >
          <motion.p 
            className="text-gray-600 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.6 }}
            viewport={{ once: true }}
          >
            Rejoignez des milliers d&apos;étudiants qui font confiance à Pharmapedia
          </motion.p>
          <motion.button 
            className="bg-pharmapedia-primary-600 hover:bg-pharmapedia-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.8 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Commencer gratuitement
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
}