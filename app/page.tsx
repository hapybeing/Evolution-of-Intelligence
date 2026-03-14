'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// ── Core scaffold ─────────────────────────────────────────────────────────────
const Loader       = dynamic(() => import('@/components/core/Loader'),       { ssr: false });
const CustomCursor = dynamic(() => import('@/components/core/CustomCursor'), { ssr: false });
const Navigation   = dynamic(() => import('@/components/core/Navigation'),   { ssr: false });
const SmoothScroll = dynamic(() => import('@/components/core/SmoothScroll'), { ssr: false });

// ── All 6 sections ────────────────────────────────────────────────────────────
const Hero          = dynamic(() => import('@/components/sections/Hero'),          { ssr: false });
const LifeEmerges   = dynamic(() => import('@/components/sections/LifeEmerges'),   { ssr: false });
const HumanMind     = dynamic(() => import('@/components/sections/HumanMind'),     { ssr: false });
const ArtificialMind= dynamic(() => import('@/components/sections/ArtificialMind'),{ ssr: false });
const Beyond        = dynamic(() => import('@/components/sections/Beyond'),        { ssr: false });
const Outro         = dynamic(() => import('@/components/sections/Outro'),         { ssr: false });

export default function Home() {
  const [loaderDone, setLoaderDone] = useState(false);

  const handleLoaderComplete = useCallback(() => {
    setLoaderDone(true);
    document.body.style.overflow = '';
  }, []);

  return (
    <>
      <CustomCursor />

      {!loaderDone && <Loader onComplete={handleLoaderComplete} />}

      <Navigation visible={loaderDone} />

      <SmoothScroll paused={!loaderDone}>
        <main>
          {loaderDone && <Hero />}
          {loaderDone && <LifeEmerges />}
          {loaderDone && <HumanMind />}
          {loaderDone && <ArtificialMind />}
          {loaderDone && <Beyond />}
          {loaderDone && <Outro />}
        </main>
      </SmoothScroll>
    </>
  );
}
