import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function FeaturedVideoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-black pt-6 md:pt-10 pb-20 md:pb-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden aspect-video bg-[#0a0a0a]"
        >
          <video
            className="w-full h-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md">
              <div className="text-white/50 text-xs tracking-widest uppercase mb-3 font-medium">Our Engine</div>
              <p className="text-white text-sm md:text-base leading-relaxed">
                We believe in the power of parallel processing. Every query spawns a dedicated agent, cross-referencing sources in real-time to eliminate hallucinations and uncover the truth.
              </p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium whitespace-nowrap shrink-0"
            >
              Explore Architecture
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
