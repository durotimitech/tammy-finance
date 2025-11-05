'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';

export default function AnimatedLayout({ children }: { children: React.ReactNode }) {
  // Respect user reduced motion preference - check client-side only to avoid hydration mismatch
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setShouldReduceMotion(mediaQuery.matches);

      // Listen for changes
      const handleChange = (e: MediaQueryListEvent) => {
        setShouldReduceMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? {} : { opacity: 0, y: -24 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ minHeight: '100vh' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
