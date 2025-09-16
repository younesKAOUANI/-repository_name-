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
          <span className="text-pharmapedia-secondary bg-pharmapedia-secondary/20 p-2 rounded-lg">
            Plateforme #1 pour la préparation
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mt-6">
            Teste. Progresse. Réussis
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            La plateforme incontournable pour réussir vos examens en médecine,
            pharmacie et sciences de la santé.
          </p>
          <div className="mt-6 flex gap-4">
            <Link
              className="inline-block bg-pharmapedia-primary text-white px-6 py-3 rounded-full shadow"
              href="#pricing"
            >
              Commencer ma révision
            </Link>
            <Link
              className="inline-block border px-6 py-3 rounded-full"
              href="#features"
            >
              Découvrir
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 text-gray-700 text-xl">
            <div className="flex flex-col pl-4 border-l-4 border-pharmapedia-primary">
              <strong className="text-5xl text-pharmapedia-primary">20+</strong>{" "}
              Expérience
            </div>
            <div className="flex flex-col pl-4 border-l-4 border-pharmapedia-primary">
              <strong className="text-5xl text-pharmapedia-primary">
                10K+
              </strong>{" "}
              Étudiants
            </div>
          </div>
        </div>

        <div
          className="flex-1 w-full max-w-md overflow-hidden bg-pharmapedia-secondary relative"
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
