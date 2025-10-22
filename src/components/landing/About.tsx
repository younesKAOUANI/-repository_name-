'use client';
import { CheckCheck } from "lucide-react";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const About: React.FC = () => (
  <motion.section
    id="about"
    className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-16 items-center"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
  >
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <Image
        src="/images/team.png"
        alt="Equipe"
        width={800}
        height={540}
        className="rounded-2xl shadow-lg"
      />
    </motion.div>
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      viewport={{ once: true }}
    >
        <motion.span 
          className="uppercase text-pharmapedia-primary-600 font-semibold"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          À propos
        </motion.span>
      <motion.h2 
        className="text-4xl leading-normal font-bold mt-4 text-gray-900"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        viewport={{ once: true }}
      >
        Nous accompagnons les étudiants vers la
        réussite
      </motion.h2>
      <motion.p 
        className="mt-6 text-lg text-gray-600 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        viewport={{ once: true }}
      >
        Engagés à offrir un accompagnement pédagogique efficace, personnalisé et
        de haute qualité.
      </motion.p>
    <motion.div 
      className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      viewport={{ once: true }}
    >
      {[
        "Parcours de révision structuré",
        "Suivi de progression détaillé", 
        "QCM et sujets par année d'étude",
        "Accompagnement personnalisé"
      ].map((item, index) => (
        <motion.div 
          key={index} 
          className="flex items-center space-x-3 text-gray-700"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
          viewport={{ once: true }}
        >
          <CheckCheck className="w-5 h-5 text-pharmapedia-primary-600 flex-shrink-0" />
          <span className="text-sm md:text-base">{item}</span>
        </motion.div>
      ))}
    </motion.div>
      <motion.a 
        href="#features" 
        className="mt-8 inline-flex items-center text-pharmapedia-primary-600 font-semibold hover:text-pharmapedia-primary-700 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        viewport={{ once: true }}
        whileHover={{ x: 5 }}
      >
        En savoir plus
        <span className="ml-2">→</span>
      </motion.a>
    </motion.div>
  </motion.section>
);

export default React.memo(About);
