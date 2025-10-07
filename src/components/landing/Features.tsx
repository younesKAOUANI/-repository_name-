'use client';
import React from "react";
import { BookOpen, Calendar, TrendingUp, Stethoscope } from "lucide-react";
import BackgroundGradient from "../ui/BackgroundGradient";
import { motion } from "framer-motion";
const features = [
    { title: "Révision Rapide", desc: "Cours résumés et QCM", icon: BookOpen },
    { title: "QCM Quotidiens", desc: "Exercices journaliers", icon: Calendar },
    { title: "Suivi de progression", desc: "Stats et courbes", icon: TrendingUp },
    { title: "Sujets par spécialité", desc: "Contenu ciblé", icon: Stethoscope },
];

const Features: React.FC = () => (
  <motion.section 
    id="features" 
    className="max-w-7xl mx-auto px-6 py-20 relative overflow-hidden rounded-2xl text-white bg-gradient-to-r from-pharmapedia-primary-600 to-pharmapedia-secondary-600"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
  >
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <motion.h3 
        className="text-4xl font-bold"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        Des outils pédagogiques de qualité
      </motion.h3>
      <motion.p 
        className="mt-4 text-xl text-pharmapedia-secondary-100"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        viewport={{ once: true }}
      >
        Pour tous les futurs professionnels de santé
      </motion.p>
    </motion.div>
    <motion.div 
      className="mt-12 flex flex-col lg:flex-row gap-12 items-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      viewport={{ once: true }}
    >
        <motion.div 
          className="lg:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          viewport={{ once: true }}
        >
            <img 
                src="Doctor3.png" 
                alt="Pharmapedia platform preview" 
                className="rounded-lg w-full h-auto"
            />
        </motion.div>
        <motion.div 
          className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          viewport={{ once: true }}
        >
            {features.map((f, index) => {
                const IconComponent = f.icon;
                return (
                    <motion.div 
                      key={f.title} 
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <IconComponent className="w-12 h-12 text-pharmapedia-accent-400 mx-auto mb-4" />
                        </motion.div>
                        <h4 className="font-semibold text-xl text-white mb-2">{f.title}</h4>
                        <p className="text-pharmapedia-secondary-100 text-sm">{f.desc}</p>
                    </motion.div>
                );
            })}
        </motion.div>
    </motion.div>
  </motion.section>
);

export default React.memo(Features);
