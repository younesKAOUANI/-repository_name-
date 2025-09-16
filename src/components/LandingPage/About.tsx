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
        <span className="uppercase text-pharmapedia-primary">À propos</span>
      <h2 className="text-4xl leading-normal font-bold mt-4">
        Depuis plusieurs années, nous accompagnons les étudiants vers la
        réussite
      </h2>
      <p className="mt-4 text-gray-600">
        Engagés à offrir un accompagnement pédagogique efficace, personnalisé et
        de haute qualité.
      </p>
    <div className="mt-6 grid grid-cols-2 gap-4">
      {[
        "Parcours de révision structuré",
        "Suivi de progression détaillé", 
        "QCM et sujets par spécialité",
        "Accompagnement personnalisé"
      ].map((item, index) => (
        <div key={index} className="flex items-center space-x-2 text-gray-700">
          <CheckCheck className="w-5 h-5 text-pharmapedia-primary flex-shrink-0" />
          <span>{item}</span>
        </div>
      ))}
    </div>
      <a href="#features" className="mt-6 inline-block text-pharmapedia-primary underline">
        En savoir plus
      </a>
    </div>
  </section>
);

export default React.memo(About);
