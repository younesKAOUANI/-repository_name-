import { Metadata } from 'next';

/**
 * Base SEO configuration for Pharmapedia
 */
export const BASE_SEO = {
  siteName: 'Pharmapedia',
  siteUrl: 'https://pharmapedia.com', // Update with your actual domain
  defaultTitle: 'Pharmapedia - Plateforme d\'apprentissage pharmaceutique',
  defaultDescription: 'La plateforme incontournable pour réussir vos examens en médecine, pharmacie et sciences de la santé. Quiz, cours et formations professionnelles.',
  defaultImage: '/pharmapedia-logo.png',
  twitterHandle: '@pharmapedia', // Update with your Twitter handle if applicable
};

/**
 * Interface for page-specific metadata
 */
export interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

/**
 * Generates comprehensive metadata for pages
 * @param pageData - Page-specific metadata
 * @returns Next.js Metadata object
 */
export function generateMetadata(pageData: PageMetadata = {}): Metadata {
  const {
    title,
    description = BASE_SEO.defaultDescription,
    keywords = [],
    image = BASE_SEO.defaultImage,
    noIndex = false,
    canonicalUrl,
  } = pageData;

  // Construct the full title
  const fullTitle = title 
    ? `${title} - ${BASE_SEO.siteName}`
    : BASE_SEO.defaultTitle;

  // Base keywords for all pages
  const baseKeywords = [
    'pharmapedia',
    'pharmacie',
    'médecine',
    'sciences de la santé',
    'quiz',
    'examen',
    'révision',
    'étudiant',
    'formation',
    'apprentissage'
  ];

  // Combine base keywords with page-specific keywords
  const allKeywords = [...baseKeywords, ...keywords].join(', ');

  // Construct image URL (make absolute if relative)
  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `${BASE_SEO.siteUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    
    // Open Graph metadata
    openGraph: {
      title: fullTitle,
      description,
      siteName: BASE_SEO.siteName,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title || BASE_SEO.defaultTitle,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
      ...(canonicalUrl && { url: canonicalUrl }),
    },

    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImageUrl],
      ...(BASE_SEO.twitterHandle && { creator: BASE_SEO.twitterHandle }),
    },

    // Additional metadata
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },

    // Canonical URL
    ...(canonicalUrl && { 
      alternates: { 
        canonical: canonicalUrl 
      } 
    }),

    // Additional meta tags
    other: {
      'application-name': BASE_SEO.siteName,
      'apple-mobile-web-app-title': BASE_SEO.siteName,
      'theme-color': '#3B82F6', // Blue theme color
    },
  };
}

/**
 * Pre-configured metadata for common page types
 */
export const COMMON_METADATA = {
  // Authentication pages
  auth: {
    signIn: generateMetadata({
      title: 'Connexion',
      description: 'Connectez-vous à votre compte Pharmapedia pour accéder à vos quiz et cours.',
      keywords: ['connexion', 'login', 'authentification'],
    }),
    signUp: generateMetadata({
      title: 'Inscription',
      description: 'Créez votre compte Pharmapedia et commencez votre parcours d\'apprentissage.',
      keywords: ['inscription', 'register', 'créer un compte'],
    }),
    verifyEmail: generateMetadata({
      title: 'Vérification Email',
      description: 'Vérifiez votre adresse email pour activer votre compte Pharmapedia.',
      keywords: ['vérification', 'email', 'activation'],
    }),
  },

  // Student pages
  student: {
    dashboard: generateMetadata({
      title: 'Tableau de Bord Étudiant',
      description: 'Accédez à vos quiz, examens et suivez votre progression sur Pharmapedia.',
      keywords: ['tableau de bord', 'étudiant', 'progression'],
    }),
    profile: generateMetadata({
      title: 'Profil Étudiant',
      description: 'Gérez votre profil, vos informations personnelles et vos statistiques.',
      keywords: ['profil', 'informations personnelles', 'statistiques'],
    }),
    quizzes: generateMetadata({
      title: 'Quiz de Cours',
      description: 'Testez vos connaissances avec nos quiz de cours en pharmacie et médecine.',
      keywords: ['quiz', 'cours', 'test', 'connaissances'],
    }),
    exams: generateMetadata({
      title: 'Examens',
      description: 'Passez vos examens officiels et consultez vos résultats.',
      keywords: ['examens', 'évaluation', 'résultats', 'officiel'],
    }),
    revisionQuiz: generateMetadata({
      title: 'Quiz de Révision',
      description: 'Créez et passez des quiz de révision personnalisés pour optimiser vos révisions.',
      keywords: ['révision', 'quiz personnalisé', 'préparation'],
    }),
  },

  // Teacher pages
  teacher: {
    dashboard: generateMetadata({
      title: 'Tableau de Bord Enseignant',
      description: 'Gérez vos cours, quiz et suivez la progression de vos étudiants.',
      keywords: ['enseignant', 'professeur', 'gestion', 'cours'],
    }),
    modules: generateMetadata({
      title: 'Gestion des Modules',
      description: 'Créez et gérez vos modules de cours pour vos étudiants.',
      keywords: ['modules', 'cours', 'gestion', 'enseignement'],
    }),
    quizzes: generateMetadata({
      title: 'Gestion des Quiz',
      description: 'Créez, modifiez et gérez tous vos quiz d\'enseignement.',
      keywords: ['quiz', 'création', 'gestion', 'évaluation'],
    }),
  },

  // Admin pages
  admin: {
    dashboard: generateMetadata({
      title: 'Administration',
      description: 'Panneau d\'administration pour gérer la plateforme Pharmapedia.',
      keywords: ['administration', 'gestion', 'panneau', 'contrôle'],
    }),
    users: generateMetadata({
      title: 'Gestion des Utilisateurs',
      description: 'Gérez tous les utilisateurs de la plateforme Pharmapedia.',
      keywords: ['utilisateurs', 'gestion', 'comptes', 'administration'],
    }),
    modules: generateMetadata({
      title: 'Gestion des Modules',
      description: 'Administration globale des modules et contenus pédagogiques.',
      keywords: ['modules', 'contenu', 'administration', 'pédagogie'],
    }),
    licenses: generateMetadata({
      title: 'Gestion des Licences',
      description: 'Gérez les licences et abonnements des utilisateurs.',
      keywords: ['licences', 'abonnements', 'gestion', 'facturation'],
    }),
  },

  // Error pages
  notFound: generateMetadata({
    title: 'Page Introuvable',
    description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    keywords: ['erreur', '404', 'page introuvable'],
    noIndex: true,
  }),
};

/**
 * Utility function to create metadata for dynamic pages
 */
export function createDynamicMetadata({
  baseTitle,
  dynamicValue,
  description,
  keywords = [],
}: {
  baseTitle: string;
  dynamicValue: string;
  description?: string;
  keywords?: string[];
}): Metadata {
  return generateMetadata({
    title: `${baseTitle} - ${dynamicValue}`,
    description: description || `${baseTitle} pour ${dynamicValue} sur Pharmapedia.`,
    keywords,
  });
}