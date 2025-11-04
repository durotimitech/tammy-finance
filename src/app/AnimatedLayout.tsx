'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

export default function AnimatedLayout({ children }: { children: React.ReactNode }) {
  // Respect user reduced motion preference
  const shouldReduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
