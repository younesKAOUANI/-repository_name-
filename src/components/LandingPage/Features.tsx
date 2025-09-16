import React from "react";
import { BookOpen, Calendar, TrendingUp, Stethoscope } from "lucide-react";
import BackgroundGradient from "../ui/BackgroundGradient";
const features = [
    { title: "Révision Rapide", desc: "Cours résumés et QCM", icon: BookOpen },
    { title: "QCM Quotidiens", desc: "Exercices journaliers", icon: Calendar },
    { title: "Suivi de progression", desc: "Stats et courbes", icon: TrendingUp },
    { title: "Sujets par spécialité", desc: "Contenu ciblé", icon: Stethoscope },
];

const Features: React.FC = () => (
  <section id="features" className="max-w-7xl mx-auto px-6 py-16 relative overflow-hidden rounded-2xl text-white bg-gradient-to-t from-pharmapedia-primary to-pharmapedia-accent">
    <div className="text-center">
      <h3 className="text-3xl font-bold">Des outils pédagogiques de qualité</h3>
      <p className="mt-3 text-gray-100">
        Pour tous les futurs professionnels de santé
      </p>
    </div>
    <div className="mt-10 flex flex-col lg:flex-row gap-8 items-center">
        <div className="lg:w-1/2">
            <img 
                src="Doctor3.png" 
                alt="Pharmapedia platform preview" 
                className="rounded-lg w-full h-auto"
            />
        </div>
        <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => {
                const IconComponent = f.icon;
                return (
                    <div key={f.title} className="card-glass text-center">
                        <h4 className="font-semibold text-xl text-black">{f.title}</h4>
                        <IconComponent className="w-16 h-16 bg-pharmapedia-primary p-2 rounded-md my-6 mx-auto shadow-pharmapedia-primary shadow-2xl" />
                        <p className="mt-2 text-sm text-gray-800">{f.desc}</p>
                    </div>
                );
            })}
        </div>
    </div>
  </section>
);

export default React.memo(Features);
