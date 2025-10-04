'use client';

import { Star, Quote } from 'lucide-react';

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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos étudiants
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les témoignages de milliers d&apos;étudiants qui ont transformé 
            leur apprentissage avec Pharmapedia
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-pharmapedia-primary-600 mb-2">4.9/5</div>
            <div className="text-gray-600">Note moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pharmapedia-primary-600 mb-2">10k+</div>
            <div className="text-gray-600">Étudiants actifs</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pharmapedia-primary-600 mb-2">95%</div>
            <div className="text-gray-600">Taux de réussite</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pharmapedia-primary-600 mb-2">50k+</div>
            <div className="text-gray-600">Questions disponibles</div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Rejoignez des milliers d&apos;étudiants qui font confiance à Pharmapedia
          </p>
          <button className="bg-pharmapedia-primary-600 hover:bg-pharmapedia-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
            Commencer gratuitement
          </button>
        </div>
      </div>
    </section>
  );
}