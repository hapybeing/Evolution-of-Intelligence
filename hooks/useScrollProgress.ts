'use client';

import { useState, useEffect, useRef } from 'react';

interface ScrollProgress {
  /** 0 → 1 across the entire page */
  progress: number;
  /** Current scroll Y in pixels */
  scrollY: number;
  /** Scroll velocity (-1 → 1 normalized) */
  velocity: number;
  /** true when scrolling downward */
  isScrollingDown: boolean;
}

export function useScrollProgress(): ScrollProgress {
  const [state, setState] = useState<ScrollProgress>({
    progress: 0,
    scrollY: 0,
    velocity: 0,
    isScrollingDown: true,
  });

  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      const rawVelocity = scrollY - lastScrollY.current;
      const velocity = Math.max(-1, Math.min(1, rawVelocity / 50));

      setState({
        progress: Math.max(0, Math.min(1, progress)),
        scrollY,
        velocity,
        isScrollingDown: rawVelocity >= 0,
      });

      lastScrollY.current = scrollY;
    };

    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // initial read

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return state;
}
