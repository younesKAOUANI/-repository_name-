import Image from "next/image";
import Link from "next/link";
import React from "react";
import BackgroundGradient from "../ui/BackgroundGradient";

const Hero: React.FC = () => {
  return (
    <section>
      <BackgroundGradient centerX={30} centerY={70} size="xl" intensity={0.4} />
      <div className="relative max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1">
          <span className="text-pharmapedia-primary-600 bg-pharmapedia-primary-50 px-4 py-2 rounded-full text-sm font-semibold">
            Plateforme #1 pour la préparation
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mt-6 text-gray-900">
            Teste. Progresse. <span className="text-pharmapedia-primary-600">Réussis</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            La plateforme incontournable pour réussir vos examens en médecine,
            pharmacie et sciences de la santé.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              className="inline-flex items-center justify-center bg-pharmapedia-primary-600 hover:bg-pharmapedia-primary-700 text-white px-8 py-4 rounded-lg shadow-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              href="/auth/sign-up"
            >
              Commencer ma révision
            </Link>
            <Link
              className="inline-flex items-center justify-center border-2 border-pharmapedia-primary-600 text-pharmapedia-primary-600 hover:bg-pharmapedia-primary-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
              href="#features"
            >
              Découvrir
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 text-gray-700">
            <div className="flex flex-col pl-6 border-l-4 border-pharmapedia-primary-600">
              <strong className="text-4xl font-bold text-pharmapedia-primary-600 mb-1">20+</strong>
              <span className="text-gray-600">Années d'expérience</span>
            </div>
            <div className="flex flex-col pl-6 border-l-4 border-pharmapedia-primary-600">
              <strong className="text-4xl font-bold text-pharmapedia-primary-600 mb-1">10K+</strong>
              <span className="text-gray-600">Étudiants actifs</span>
            </div>
          </div>
        </div>

        <div
          className="flex-1 w-full max-w-md overflow-hidden bg-gradient-bl from-blue-200 to-blue-600Ä relative"
          style={{ borderRadius: "15rem 2rem 15rem 2rem" }}
        >
          <div>
            <Image
              src="/images/Doctor-Image-Home.png"
              alt="Doctor"
              width={400}
              height={600}
              priority
              className="relative"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Hero);
