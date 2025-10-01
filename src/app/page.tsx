// Force dynamic rendering to avoid prerendering issues with event handlers
export const dynamic = 'force-dynamic';

import About from "@/components/LandingPage/About";
import Features from "@/components/LandingPage/Features";
import Header from "@/components/LandingPage/Header";
import Hero from "@/components/LandingPage/Hero";
import Pricing from "@/components/LandingPage/Pricing";
import BackgroundGradient from "@/components/ui/BackgroundGradient";

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <About />
      <Features />
      {/* <Pricing /> */}
    </div>
  );
}
