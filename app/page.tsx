'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// ── Core scaffold (all client-side, no SSR needed) ────────────────────────
const Loader       = dynamic(() => import('@/components/core/Loader'),       { ssr: false });
const CustomCursor = dynamic(() => import('@/components/core/CustomCursor'), { ssr: false });
const Navigation   = dynamic(() => import('@/components/core/Navigation'),   { ssr: false });
const SmoothScroll = dynamic(() => import('@/components/core/SmoothScroll'), { ssr: false });

// ── Sections (uncomment as they are built) ────────────────────────────────
const Hero          = dynamic(() => import('@/components/sections/Hero'),          { ssr: false });
const LifeEmerges   = dynamic(() => import('@/components/sections/LifeEmerges'),   { ssr: false });
// const HumanMind     = dynamic(() => import('@/components/sections/HumanMind'),     { ssr: false });
// const ArtificialMind= dynamic(() => import('@/components/sections/ArtificialMind'),{ ssr: false });
// const Beyond        = dynamic(() => import('@/components/sections/Beyond'),        { ssr: false });
// const Outro         = dynamic(() => import('@/components/sections/Outro'),         { ssr: false });

export default function Home() {
  const [loaderDone, setLoaderDone] = useState(false);

  const handleLoaderComplete = useCallback(() => {
    setLoaderDone(true);
    document.body.style.overflow = '';
  }, []);

  return (
    <>
      {/* ── Custom cursor (always on top) ─────────────────────────────── */}
      <CustomCursor />

      {/* ── Cinematic loader ──────────────────────────────────────────── */}
      {!loaderDone && (
        <Loader onComplete={handleLoaderComplete} />
      )}

      {/* ── Floating section nav ──────────────────────────────────────── */}
      <Navigation visible={loaderDone} />

      {/* ── Main experience ───────────────────────────────────────────── */}
      <SmoothScroll paused={!loaderDone}>
        <main>

          {/* Sections uncommented one by one as they are built */}
          {loaderDone && <Hero />}
          {loaderDone && <LifeEmerges />}
          {/* <HumanMind />      */}
          {/* <ArtificialMind /> */}
          {/* <Beyond />         */}
          {/* <Outro />          */}

        </main>
      </SmoothScroll>
    </>
  );
}
