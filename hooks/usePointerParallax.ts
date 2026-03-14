'use client';

import { useEffect, useRef } from 'react';

/**
 * Returns a ref containing normalized pointer position (-1 to 1).
 * Works for both mouse and touch events.
 */
export function usePointerParallax() {
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      pos.current = {
        x:  (e.clientX / window.innerWidth)  * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      pos.current = {
        x:  (e.touches[0].clientX / window.innerWidth)  * 2 - 1,
        y: -(e.touches[0].clientY / window.innerHeight) * 2 + 1,
      };
    };

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove',  onTouch, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove',  onTouch);
    };
  }, []);

  return pos;
}
