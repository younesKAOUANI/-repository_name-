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
  <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative overflow-hidden rounded-2xl text-white bg-gradient-to-r from-pharmapedia-primary-600 to-pharmapedia-secondary-600">
    <div className="text-center">
      <h3 className="text-4xl font-bold">Des outils pédagogiques de qualité</h3>
      <p className="mt-4 text-xl text-pharmapedia-secondary-100">
        Pour tous les futurs professionnels de santé
      </p>
    </div>
    <div className="mt-12 flex flex-col lg:flex-row gap-12 items-center">
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
                    <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <IconComponent className="w-12 h-12 text-pharmapedia-accent-400 mx-auto mb-4" />
                        <h4 className="font-semibold text-xl text-white mb-2">{f.title}</h4>
                        <p className="text-pharmapedia-secondary-100 text-sm">{f.desc}</p>
                    </div>
                );
            })}
        </div>
    </div>
  </section>
);

export default React.memo(Features);
