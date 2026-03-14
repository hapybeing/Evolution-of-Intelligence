'use client';

import { useState, useEffect, useRef } from 'react';

interface MousePosition {
  /** Raw pixel position */
  x: number;
  y: number;
  /** Normalized -1 → 1 from screen center */
  nx: number;
  ny: number;
  /** Is the mouse over the document */
  isActive: boolean;
}

export function useMousePosition(): MousePosition {
  const [pos, setPos] = useState<MousePosition>({
    x: 0, y: 0, nx: 0, ny: 0, isActive: false,
  });

  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth)  * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        setPos({ x: e.clientX, y: e.clientY, nx, ny, isActive: true });
      });
    };

    const onLeave = () => setPos(p => ({ ...p, isActive: false }));
    const onEnter = () => setPos(p => ({ ...p, isActive: true }));

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return pos;
}
