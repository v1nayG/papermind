import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowRight, Search, MessageSquare } from 'lucide-react';
import AboutSection from '../components/landing/AboutSection';
import FeaturedVideoSection from '../components/landing/FeaturedVideoSection';
import PhilosophySection from '../components/landing/PhilosophySection';
import FeaturesSection from '../components/landing/FeaturesSection';
import './HeroPage.css'; // Contains body resets

export default function HeroPage() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let fadeAnimation;

    const animateOpacity = (start, end, duration) => {
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutQuad)
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        
        if (video) {
          video.style.opacity = start + (end - start) * easeProgress;
        }

        if (progress < 1) {
          fadeAnimation = requestAnimationFrame(animate);
        }
      };
      
      cancelAnimationFrame(fadeAnimation);
      fadeAnimation = requestAnimationFrame(animate);
    };

    const handleCanPlay = () => {
      video.play().catch(e => console.log("Autoplay prevented:", e));
      animateOpacity(0, 1, 500);
    };

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime) {
        const remaining = video.duration - video.currentTime;
        // Start fading out 550ms before the end
        if (remaining <= 0.55 && video.style.opacity > 0.5) {
          animateOpacity(1, 0, 500);
        }
      }
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(e => console.log("Autoplay prevented:", e));
        animateOpacity(0, 1, 500);
      }, 100);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      cancelAnimationFrame(fadeAnimation);
    };
  }, []);

  return (
    <div className="bg-black text-white font-['Inter']">
      {/* SECTION 1: HERO */}
      <section className="min-h-screen relative flex flex-col overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-bottom"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
          muted
          playsInline
          preload="auto"
          style={{ opacity: 0 }}
        />

        {/* Navbar */}
        <nav className="relative z-20 px-6 py-6 w-full max-w-5xl mx-auto">
          <div className="liquid-glass rounded-full px-6 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-white">
                <Globe className="w-6 h-6" />
                <span className="font-semibold text-lg tracking-tight">PaperMind</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-8 ml-8">
                <a href="#about" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Features</a>
                <a href="#engine" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Architecture</a>
                <a href="#manifesto" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Manifesto</a>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/register" className="text-white text-sm font-medium hover:text-white/80 transition-colors">
                Sign Up
              </Link>
              <Link to="/login" className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                Login
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[10%] md:-translate-y-[20%]">
          <h1 className="text-7xl md:text-8xl lg:text-9xl text-white tracking-tight whitespace-nowrap mb-12">
            Research it then <em className="font-['Instrument_Serif'] italic">all</em>.
          </h1>

          <div className="max-w-xl w-full mx-auto mb-8">
            <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-base"
              />
              <button className="bg-white rounded-full p-3 text-black hover:scale-105 transition-transform">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-white text-sm md:text-base leading-relaxed px-4 max-w-md mx-auto mb-10">
            Skip the endless tabs and manual synthesis. Join the waitlist for the most advanced multi-agent research pipeline ever built.
          </p>

          <Link to="/login" className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors">
            Try PaperMind Engine
          </Link>
        </div>

        {/* Social Icons Footer */}
        <div className="relative z-10 flex justify-center gap-4 pb-12 mt-auto">
          <button className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
            <Search className="w-5 h-5" />
          </button>
          <button className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
            <Globe className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: ABOUT */}
      <div id="about">
        <AboutSection />
      </div>

      {/* SECTION 3: FEATURED VIDEO */}
      <div id="engine">
        <FeaturedVideoSection />
      </div>

      {/* SECTION 4: PHILOSOPHY */}
      <div id="manifesto">
        <PhilosophySection />
      </div>

      {/* SECTION 5: FEATURES (SERVICES) */}
      <FeaturesSection />

    </div>
  );
}
