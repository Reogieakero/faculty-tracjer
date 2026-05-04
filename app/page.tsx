import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Stats from "../components/landing/Stats";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', gap: '0' }}> {/* Forces zero gap between kids */}
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}