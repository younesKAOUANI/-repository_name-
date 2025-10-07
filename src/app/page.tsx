// Force dynamic rendering to avoid prerendering issues with event handlers
export const dynamic = 'force-dynamic';

import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Reviews from "@/components/landing/Reviews";
import CTA from "@/components/landing/CTA";
import Subscription from "@/components/landing/Subscription";
import Footer from "@/components/landing/Footer";
import { generateMetadata } from "@/lib/metadata";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import Pricing from "@/components/landing/Pricing";

// Export metadata for the landing page
export const metadata = generateMetadata({
  title: undefined, // Use default title from BASE_SEO
  description: undefined, // Use default description from BASE_SEO
  keywords: [
    'plateforme apprentissage',
    'éducation médicale',
    'formation pharmaceutique',
    'quiz médecine',
    'révision pharmacie',
    'examens blancs',
    'étudiants santé'
  ],
});

export default function Home() {
  return (
    <div className="relative">
      {/* Animated background with many particles */}
      <AnimatedBackground
        particleCount={200}
        colors={['bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-violet-400', 'bg-cyan-400', 'bg-emerald-400', 'bg-yellow-400']}
      />
      
      {/* Page content */}
      <div className="relative z-10">
        <Header />
        <Hero />
        <About />
        <Features />
        <Reviews />
        <Pricing />
        <CTA />
        <Subscription />
        <Footer />
      </div>
    </div>
  );
}
