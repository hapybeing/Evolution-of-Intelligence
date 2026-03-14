'use client';

import { useContext, createContext, useRef } from 'react';
import type Lenis from 'lenis';

// Global context so any component can access the Lenis instance
export const LenisContext = createContext<React.MutableRefObject<Lenis | null> | null>(null);

export function useLenis() {
  const ctx = useContext(LenisContext);
  if (!ctx) return null;
  return ctx.current;
}
