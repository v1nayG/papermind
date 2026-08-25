import React, { useState, Suspense, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './AuthPage.css';
import { ArrowLeft } from 'lucide-react';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isLoginMode, setIsLoginMode] = useState(searchParams.get('mode') !== 'signup');
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLoginMode(searchParams.get('mode') !== 'signup');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = isLoginMode 
        ? await api.login(email, password)
        : await api.register(email, password);
        
      if (data.error) { 
        setError(data.error); 
        return; 
      }
      
      login(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
      navigate('/');
    } catch {
      setError(`${isLoginMode ? 'Login' : 'Registration'} failed. The server may be waking up — please try again in 30 seconds.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError('');
    setIsLoginMode(!isLoginMode);
  };

  const formVariants = {
    hidden: { opacity: 0, x: isLoginMode ? -20 : 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: isLoginMode ? 20 : -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sora bg-hero-bg text-foreground overflow-hidden">
      
      {/* Background Spline 3D */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
          <Spline
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
            className="w-full h-full"
          />
        </Suspense>
        <div className="absolute inset-0 bg-black/40 z-[1] pointer-events-none"></div>
      </div>

      {/* FLOATING BACK BUTTON */}
      <button 
        onClick={() => navigate('/')} 
        className="fixed top-6 left-6 md:left-12 z-50 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white hover:brightness-110 transition-all cursor-pointer opacity-0 animate-fade-in"
        style={{ animationDelay: '0.2s' }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>

      <main className="relative z-10 flex-1 w-full flex items-end justify-start p-6 md:p-10 pb-10 md:pb-10 pt-32 pointer-events-none">
        <div 
          className="w-full max-w-[90%] sm:max-w-md pointer-events-auto opacity-0 animate-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="mb-6 md:mb-8">
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold mb-2 text-foreground tracking-tight uppercase leading-none">
              {isLoginMode ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </h1>
            <p className="text-muted-foreground text-sm font-light">
              {isLoginMode ? 'Sign in to continue your research.' : 'Join the platform today.'}
            </p>
          </div>

          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.form 
                key={isLoginMode ? 'login' : 'signup'}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute w-full flex flex-col gap-4" 
                onSubmit={handleSubmit}
              >
                {error && <div className="bg-destructive text-destructive-foreground p-3 rounded-sm text-xs font-semibold">{error}</div>}

                {!isLoginMode && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest" htmlFor="name">Full Name</label>
                    <input 
                      id="name"
                      type="text" 
                      className="w-full bg-input/50 border border-border/50 rounded-sm px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:bg-input transition-colors text-sm font-light backdrop-blur-md"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      required 
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest" htmlFor="email">Email</label>
                  <input 
                    id="email"
                    type="email" 
                    className="w-full bg-input/50 border border-border/50 rounded-sm px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:bg-input transition-colors text-sm font-light backdrop-blur-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest" htmlFor="password">Password</label>
                  <input 
                    id="password"
                    type="password" 
                    className="w-full bg-input/50 border border-border/50 rounded-sm px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:bg-input transition-colors text-sm font-light backdrop-blur-md"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required 
                    minLength="6"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground font-semibold rounded-sm py-4 text-sm hover:brightness-110 active:scale-[0.98] transition-all mt-2 flex items-center justify-center cursor-pointer uppercase tracking-widest" 
                  disabled={loading}
                >
                  {loading ? <div className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div> : (isLoginMode ? 'CONTINUE' : 'CREATE ACCOUNT')}
                </button>
              </motion.form>
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-4 text-xs text-muted-foreground font-light flex items-center gap-2">
            <span>{isLoginMode ? "Don't have an account?" : "Already have an account?"}</span>
            <button type="button" onClick={toggleMode} className="text-primary hover:brightness-125 transition-colors font-semibold uppercase tracking-widest cursor-pointer">
              {isLoginMode ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
