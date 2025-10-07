'use client';

import { motion } from 'framer-motion';
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
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Accueil", href: "/" },
    { name: "À propos", href: "/#about" },
    { name: "Fonctionnalités", href: "/#features" },
    { name: "Tarifs", href: "/#pricing" },
    { name: "Contact", href: "/#contact" }
  ];

  const platformLinks = [
    { name: "Tableau de bord étudiant", href: "/student/dashboard" },
    { name: "Quiz & Examens", href: "/student/quizzes" },
    { name: "Révisions personnalisées", href: "/student/revision-quiz" },
    { name: "Suivi des progrès", href: "/student/profile" },
    { name: "Espace enseignant", href: "/teacher/dashboard" }
  ];

  const resourceLinks = [
    { name: "Centre d'aide", href: "/help" },
    { name: "Guides d'utilisation", href: "/guides" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog pédagogique", href: "/blog" },
    { name: "Webinaires", href: "/webinars" }
  ];

  const legalLinks = [
    { name: "Conditions d'utilisation", href: "/legal/terms" },
    { name: "Politique de confidentialité", href: "/legal/privacy" },
    { name: "Mentions légales", href: "/legal/mentions" },
    { name: "RGPD", href: "/legal/gdpr" },
    { name: "Cookies", href: "/legal/cookies" }
  ];

  const socialLinks = [
    { 
      name: "Facebook", 
      href: "https://facebook.com/pharmapedia", 
      icon: <Facebook className="w-5 h-5" />,
      color: "hover:text-blue-600"
    },
    { 
      name: "Twitter", 
      href: "https://twitter.com/pharmapedia", 
      icon: <Twitter className="w-5 h-5" />,
      color: "hover:text-sky-500"
    },
    { 
      name: "Instagram", 
      href: "https://instagram.com/pharmapedia", 
      icon: <Instagram className="w-5 h-5" />,
      color: "hover:text-pink-600"
    },
    { 
      name: "LinkedIn", 
      href: "https://linkedin.com/company/pharmapedia", 
      icon: <Linkedin className="w-5 h-5" />,
      color: "hover:text-blue-700"
    }
  ];

  return (
    <motion.footer 
      className="bg-gray-900 text-gray-300"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-blue-600 rounded-lg p-2">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Pharmapedia</span>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              La plateforme d&apos;apprentissage de référence pour les étudiants en médecine 
              et pharmacie. Réussissez vos examens avec confiance.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm">123 Avenue des Sciences, 75005 Paris</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-sm">+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm">contact@pharmapedia.fr</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className={`p-2 bg-gray-800 rounded-lg transition-colors duration-300 ${social.color}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Navigation</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links */}
          <div>
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
          </div>

          {/* Resources & Legal */}
          <div>
            <h3 className="text-white font-semibold mb-6">Ressources</h3>
            <ul className="space-y-3 mb-8">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold mb-6">Légal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Stats Section */}
        <div className="border-t border-gray-800 pt-12 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">10,000+</div>
                <div className="text-gray-400 text-sm">Étudiants actifs</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <BookOpen className="w-8 h-8 text-sky-400" />
              <div>
                <div className="text-2xl font-bold text-white">50,000+</div>
                <div className="text-gray-400 text-sm">Questions disponibles</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Shield className="w-8 h-8 text-amber-400" />
              <div>
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-gray-400 text-sm">Taux de réussite</div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 pt-12 mt-12">
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
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Pharmapedia. Tous droits réservés.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Données sécurisées</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Service disponible</span>
              </div>
              <Link href="/status" className="hover:text-white transition-colors duration-300">
                Statut des services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}