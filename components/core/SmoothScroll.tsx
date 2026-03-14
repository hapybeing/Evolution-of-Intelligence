'use client';

import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LenisContext } from '@/hooks/useLenis';

// Register ScrollTrigger once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProps {
  children: React.ReactNode;
  /** Pause smooth scroll (e.g. during loader) */
  paused?: boolean;
}

export default function SmoothScroll({ children, paused = false }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef   = useRef<number | null>(null);

  const initLenis = useCallback(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Prevent GSAP ticker lag from affecting scroll
    gsap.ticker.lagSmoothing(0);

    return lenis;
  }, []);

  useEffect(() => {
    const lenis = initLenis();

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [initLenis]);

  // Pause/resume when loader is active
  useEffect(() => {
    if (!lenisRef.current) return;
    if (paused) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [paused]);

  return (
    <LenisContext.Provider value={lenisRef}>
      {children}
    </LenisContext.Provider>
  );
}
