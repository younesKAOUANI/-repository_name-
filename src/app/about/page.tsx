'use client';

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import About from "@/components/landing/About";
import { motion } from "framer-motion";
import { CheckCircle, Users, Award, BookOpen, Target, Heart, Lightbulb } from "lucide-react";
import Image from "next/image";

const teamMembers = [
  {
    name: "Dr. Sarah Benali",
    role: "Fondatrice & Directrice Pédagogique",
    image: "/api/placeholder/300/300",
    description: "Docteur en Pharmacie avec 15 ans d'expérience dans l'enseignement médical.",
    linkedin: "#"
  },
  {
    name: "Prof. Ahmed Khelil",
    role: "Directeur Scientifique",
    image: "/api/placeholder/300/300", 
    description: "Professeur de médecine, spécialiste en pédagogie numérique.",
    linkedin: "#"
  },
  {
    name: "Dr. Leila Mansouri",
    role: "Responsable Contenu",
    image: "/api/placeholder/300/300",
    description: "Experte en création de contenu pédagogique et évaluation.",
    linkedin: "#"
  },
  {
    name: "Youcef Tadjer",
    role: "Directeur Technique",
    image: "/api/placeholder/300/300",
    description: "Ingénieur spécialisé dans les plateformes éducatives.",
    linkedin: "#"
  }
];

const values = [
  {
    icon: <Target className="w-8 h-8" />,
    title: "Excellence Pédagogique",
    description: "Nous nous engageons à fournir un contenu de la plus haute qualité, conçu par des experts du domaine médical."
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Bienveillance",
    description: "Nous accompagnons chaque étudiant avec empathie et compréhension dans son parcours d'apprentissage."
  },
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: "Innovation",
    description: "Nous utilisons les dernières technologies pour créer des expériences d'apprentissage engageantes et efficaces."
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Collaboration",
    description: "Nous croyons en la force de la communauté et favorisons les échanges entre étudiants et professionnels."
  }
];

const stats = [
  { value: "10,000+", label: "Étudiants actifs" },
  { value: "50,000+", label: "Questions disponibles" },
  { value: "95%", label: "Taux de réussite" },
  { value: "4.9/5", label: "Note satisfaction" }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <motion.section 
          className="py-20 bg-gradient-to-br from-pharmapedia-primary-50 via-white to-pharmapedia-secondary-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              À propos de{" "}
              <span className="bg-gradient-to-r from-pharmapedia-primary-600 to-pharmapedia-secondary-600 bg-clip-text text-transparent">
                Pharmapedia
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Depuis notre création, nous nous consacrons à révolutionner l'apprentissage médical 
              en Algérie. Notre mission est d'accompagner chaque étudiant vers la réussite grâce 
              à une plateforme innovante et des outils pédagogiques de qualité.
            </motion.p>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="py-16 bg-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-pharmapedia-primary-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section 
          className="py-20 bg-gray-50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Notre Mission
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Nous croyons que chaque étudiant mérite d'avoir accès aux meilleurs outils 
                  d'apprentissage. C'est pourquoi nous avons créé Pharmapedia : une plateforme 
                  qui allie excellence pédagogique, innovation technologique et accompagnement personnalisé.
                </p>
                
                <div className="space-y-4">
                  {[
                    "Démocratiser l'accès à l'éducation médicale de qualité",
                    "Accompagner les étudiants dans leur réussite académique", 
                    "Créer une communauté d'apprentissage collaborative",
                    "Innover constamment pour améliorer l'expérience étudiante"
                  ].map((mission, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className="w-6 h-6 text-pharmapedia-primary-600 flex-shrink-0" />
                      <span className="text-gray-700">{mission}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Image
                  src="/images/team.png"
                  alt="Notre mission"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl"
                />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section 
          className="py-20 bg-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Nos Valeurs
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Les principes qui guident notre action au quotidien
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="text-center p-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-pharmapedia-primary-100 text-pharmapedia-primary-600 rounded-full mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section 
          className="py-20 bg-gray-50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Notre Équipe
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Des experts passionnés au service de votre réussite
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  className="bg-white rounded-xl p-6 shadow-lg text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-pharmapedia-primary-600 to-pharmapedia-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-pharmapedia-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="py-20 bg-gradient-to-r from-pharmapedia-primary-600 to-pharmapedia-secondary-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              className="text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Rejoignez la révolution de l'apprentissage médical
            </motion.h2>
            
            <motion.p 
              className="text-xl text-pharmapedia-secondary-100 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Faites partie de la communauté d'étudiants qui transforment leur avenir professionnel
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <a 
                href="/auth/sign-up"
                className="inline-flex items-center bg-white text-pharmapedia-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Commencer gratuitement
              </a>
            </motion.div>
          </div>
        </motion.section>
      </main>
      
      <Footer />
    </div>
  );
}