'use client';
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import BackgroundGradient from "../ui/BackgroundGradient";

const Hero: React.FC = () => {
  return (
    <section>
      <BackgroundGradient centerX={30} centerY={70} size="xl" intensity={0.4} />
      <motion.div 
        className="relative max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center gap-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.span 
            className="text-pharmapedia-primary-600 bg-pharmapedia-primary-50 px-4 py-2 rounded-full text-sm font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Plateforme #1 pour la préparation
          </motion.span>
          <motion.h1 
            className="text-4xl md:text-6xl font-extrabold leading-tight mt-6 text-gray-900"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Teste.
            </motion.span>{" "}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              Progresse.
            </motion.span>{" "}
            <motion.span 
              className="text-pharmapedia-primary-600"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Réussis
            </motion.span>
          </motion.h1>
          <motion.p 
            className="mt-6 text-xl text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            La plateforme incontournable pour réussir vos examens en pharmacie.
          </motion.p>
          <motion.div 
            className="mt-8 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                className="inline-flex items-center justify-center bg-pharmapedia-primary-600 hover:bg-pharmapedia-primary-700 text-white px-8 py-4 rounded-lg shadow-lg font-semibold text-lg transition-all duration-300"
                href="/auth/sign-up"
              >
                Commencer ma révision
              </Link>
            </motion.div>
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 2.0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                className="inline-flex items-center justify-center border-2 border-pharmapedia-primary-600 text-pharmapedia-primary-600 hover:bg-pharmapedia-primary-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
                href="#features"
              >
                Découvrir
              </Link>
            </motion.div> */}
          </motion.div>
          <motion.div 
            className="mt-12 grid grid-cols-2 gap-8 text-gray-700"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2 }}
          >
            <motion.div 
              className="flex flex-col pl-6 border-l-4 border-pharmapedia-primary-600"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 2.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.strong 
                className="text-4xl font-bold text-pharmapedia-primary-600 mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 2.6, type: "spring", stiffness: 200 }}
              >
                20+
              </motion.strong>
              <span className="text-gray-600">Questions</span>
            </motion.div>
            <motion.div 
              className="flex flex-col pl-6 border-l-4 border-pharmapedia-primary-600"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 2.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.strong 
                className="text-4xl font-bold text-pharmapedia-primary-600 mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 2.7, type: "spring", stiffness: 200 }}
              >
                1K+
              </motion.strong>
              <span className="text-gray-600">Examens</span>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex-1 w-full max-w-md overflow-hidden bg-gradient-bl from-blue-200 to-blue-600Ä relative"
          style={{ borderRadius: "15rem 2rem 15rem 2rem" }}
          initial={{ opacity: 0, x: 50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              <Image
                src="/images/Doctor-Image-Home.png"
                alt="Doctor"
                width={400}
                height={600}
                priority
                className="relative"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default React.memo(Hero);
