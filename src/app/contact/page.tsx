import ContactForm from "@/components/landing/ContactForm";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Contact - Pharmapedia",
  description: "Contactez l'équipe Pharmapedia pour toute question concernant notre plateforme d'apprentissage médical. Nous sommes là pour vous aider dans votre parcours éducatif.",
  keywords: [
    'contact pharmapedia',
    'support étudiant',
    'aide plateforme',
    'contact support',
    'assistance étudiants',
    'service client pharmapedia'
  ],
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}