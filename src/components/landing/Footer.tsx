"use client";

import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Users,
  Shield,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Accueil", href: "/" },
    { name: "À propos", href: "/about" },
    // { name: "Fonctionnalités", href: "/#features" },
    // { name: "Tarifs", href: "/#pricing" },
    { name: "Contact", href: "/contact" },
  ];

  const platformLinks = [
    { name: "Tableau de bord étudiant", href: "/student/dashboard" },
    { name: "Quiz & Examens", href: "/student/quizzes" },
    { name: "Révisions personnalisées", href: "/student/revision-quiz" },
    { name: "Suivi des progrès", href: "/student/profile" },
    { name: "Espace enseignant", href: "/teacher/dashboard" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com/pharmapedia",
      icon: <Facebook className="w-5 h-5" />,
      color: "hover:text-blue-600",
    },
    {
      name: "Instagram",
      href: "https://instagram.com/pharmapedia",
      icon: <Instagram className="w-5 h-5" />,
      color: "hover:text-pink-600",
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/pharmapedia",
      icon: <Linkedin className="w-5 h-5" />,
      color: "hover:text-blue-700",
    },
  ];

  return (
    <motion.footer
      className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-700"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Company Info */}
          <div className="lg:col-span-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-6">
<Image src="/pharmapedia-logo.png" alt="Pharmapedia Logo" width={280} height={60} className="h-auto" />
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed font-medium">
              La plateforme d&apos;apprentissage de référence pour les étudiants
              en pharmacie. Réussissez vos examens avec confiance.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  Alger, 16000 Algérie
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">+213 21 23 45 67</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">contact@pharmapedia-dz.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center md:justify-start space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className={`p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${social.color}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-gray-900 font-bold text-lg mb-6">Navigation</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm font-medium hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links */}
          {/* <div>
            <h3 className="text-white font-semibold mb-6">Plateforme</h3>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center space-x-1"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}
        </motion.div>

        {/* Newsletter Signup */}
        {/* <div className="border-t border-gray-800 pt-12 mt-12">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-white font-semibold mb-4">
              Restez informé de nos actualités
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300">
                S&apos;inscrire
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0 font-medium text-center md:text-left">
              © {currentYear} Pharmapedia. Tous droits réservés.
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Données sécurisées</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Service disponible</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
