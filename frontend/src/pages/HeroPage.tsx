import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

// Lazy load the Spline component to prevent blocking the initial render
const Spline = React.lazy(() => import('@splinetool/react-spline'));

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-5">
      {/* Left: Logo text */}
      <div className="text-foreground text-xl font-semibold tracking-tight">
        PAPERMIND
      </div>

      {/* Center: Nav removed to clean up dead links */}
      <div className="hidden md:flex items-center gap-8">
      </div>

      {/* Right: Get Quote Button */}
      <Button
        variant="navCta"
        size="lg"
        onClick={() => navigate('/auth')}
        className="hidden md:inline-flex rounded-lg uppercase text-xs tracking-widest px-6"
      >
        LOGIN
      </Button>
    </nav>
  );
}

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-end bg-hero-bg overflow-hidden">
      {/* Spline 3D Background */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
          <Spline
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />

      {/* Content container */}
      <div className="relative z-10 pointer-events-none w-full max-w-[90%] sm:max-w-md lg:max-w-2xl px-6 md:px-10 pb-10 md:pb-10 pt-32">
        
        <h1 
          className="text-[clamp(3rem,8vw,6rem)] font-bold leading-[1.05] tracking-[-0.05em] text-foreground mb-2 md:mb-4 uppercase opacity-0 animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          PAPERMIND
          <span className="text-primary"> AI</span>
        </h1>

        <p 
          className="text-foreground/80 text-[clamp(1.125rem,2.5vw,1.875rem)] font-light mb-3 md:mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          We implement autonomous research correctly.
        </p>

        <p 
          className="text-muted-foreground text-[clamp(0.875rem,1.5vw,1.25rem)] font-light mb-4 md:mb-8 opacity-0 animate-fade-up max-w-[90%]"
          style={{ animationDelay: '0.55s' }}
        >
          An intelligent research assistant that autonomously searches, reads, and synthesizes the web. Built with a concurrent multi-agent architecture to generate deeply cited, comprehensive reports in seconds.
        </p>

        <div 
          className="flex flex-wrap gap-3 font-bold opacity-0 animate-fade-up"
          style={{ animationDelay: '0.7s' }}
        >
          <button 
            onClick={() => navigate('/auth')}
            className="pointer-events-auto bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-110 transition-all active:scale-[0.97]"
          >
            Start Research
          </button>
        </div>

      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-hero-bg py-8">
      <div className="max-w-[90%] md:max-w-6xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground/60 font-light tracking-wide">
          © 2026 PaperMind AI. Built by Vinay.
        </div>
        
        <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-widest">
          <a 
            href="https://github.com/v1nayG" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground/60 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground/60 hover:text-white transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function HeroPage() {
  return (
    <div className="bg-hero-bg min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <HeroSection />
      </div>
      <Footer />
    </div>
  );
}
