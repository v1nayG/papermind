import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

// Lazy load the Spline component to prevent blocking the initial render
const Spline = React.lazy(() => import('@splinetool/react-spline'));

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-5">
      <div className="text-foreground text-xl font-semibold tracking-tight">
        PAPERMIND
      </div>

      <div className="hidden md:flex items-center gap-8" />

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
    <section className="relative h-screen flex items-end overflow-hidden">
      {/* Spline 3D Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
          <Spline
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
            className="w-full h-full"
          />
        </Suspense>
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      {/* Main content */}
      <div className="relative z-10 pointer-events-none w-full max-w-[90%] sm:max-w-md lg:max-w-2xl px-6 md:px-10 pb-10 pt-32">
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
          Autonomous Multi-Agent AI Research Platform
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

      {/* GitHub link — bottom right corner, no scroll needed */}
      <a
        href="https://github.com/v1nayG/papermind"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 right-8 z-20 text-[11px] uppercase tracking-widest text-muted-foreground/50 hover:text-white transition-colors font-semibold"
      >
        GitHub
      </a>
    </section>
  );
}

export default function HeroPage() {
  return (
    <div className="bg-hero-bg h-screen overflow-hidden">
      <Navbar />
      <HeroSection />
    </div>
  );
}
