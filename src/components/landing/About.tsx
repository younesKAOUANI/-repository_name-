import { CheckCheck } from "lucide-react";
import Image from "next/image";
import React from "react";

const About: React.FC = () => (
  <section
    id="about"
    className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-16 items-center"
  >
    <div>
      <Image
        src="/images/team.png"
        alt="Equipe"
        width={800}
        height={540}
        className="rounded-2xl shadow-lg"
      />
    </div>
    <div>
        <span className="uppercase text-pharmapedia-primary-600 font-semibold">À propos</span>
      <h2 className="text-4xl leading-normal font-bold mt-4 text-gray-900">
        Depuis plusieurs années, nous accompagnons les étudiants vers la
        réussite
      </h2>
      <p className="mt-6 text-lg text-gray-600 leading-relaxed">
        Engagés à offrir un accompagnement pédagogique efficace, personnalisé et
        de haute qualité.
      </p>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        "Parcours de révision structuré",
        "Suivi de progression détaillé", 
        "QCM et sujets par spécialité",
        "Accompagnement personnalisé"
      ].map((item, index) => (
        <div key={index} className="flex items-center space-x-3 text-gray-700">
          <CheckCheck className="w-5 h-5 text-pharmapedia-primary-600 flex-shrink-0" />
          <span className="text-sm md:text-base">{item}</span>
        </div>
      ))}
    </div>
      <a href="#features" className="mt-8 inline-flex items-center text-pharmapedia-primary-600 font-semibold hover:text-pharmapedia-primary-700 transition-colors duration-300">
        En savoir plus
        <span className="ml-2">→</span>
      </a>
    </div>
  </section>
);

export default React.memo(About);
