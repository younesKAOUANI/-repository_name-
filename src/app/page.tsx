// Force dynamic rendering to avoid prerendering issues with event handlers
export const dynamic = 'force-dynamic';

import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Reviews from "@/components/landing/Reviews";
import CTA from "@/components/landing/CTA";
import Subscription from "@/components/landing/Subscription";
import ContactForm from "@/components/landing/ContactForm";
import Footer from "@/components/landing/Footer";
import Pricing from "@/components/landing/Pricing";
import BackgroundGradient from "@/components/ui/BackgroundGradient";
import { generateMetadata } from "@/lib/metadata";

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
    <div>
      <Header />
      <Hero />
      <About />
      <Features />
      <Reviews />
      {/* <Pricing /> */}
      <CTA />
      <Subscription />
      <ContactForm />
      <Footer />
    </div>
  );
}
