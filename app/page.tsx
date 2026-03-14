'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// ── Core scaffold (all client-side, no SSR needed) ────────────────────────
const Loader       = dynamic(() => import('@/components/core/Loader'),       { ssr: false });
const CustomCursor = dynamic(() => import('@/components/core/CustomCursor'), { ssr: false });
const Navigation   = dynamic(() => import('@/components/core/Navigation'),   { ssr: false });
const SmoothScroll = dynamic(() => import('@/components/core/SmoothScroll'), { ssr: false });

// ── Sections (imported as built) ─────────────────────────────────────────
// const Hero          = dynamic(() => import('@/components/sections/Hero'),          { ssr: false });
// const LifeEmerges   = dynamic(() => import('@/components/sections/LifeEmerges'),   { ssr: false });
// const HumanMind     = dynamic(() => import('@/components/sections/HumanMind'),     { ssr: false });
// const ArtificialMind= dynamic(() => import('@/components/sections/ArtificialMind'),{ ssr: false });
// const Beyond        = dynamic(() => import('@/components/sections/Beyond'),        { ssr: false });
// const Outro         = dynamic(() => import('@/components/sections/Outro'),         { ssr: false });

export default function Home() {
  const [loaderDone, setLoaderDone] = useState(false);

  const handleLoaderComplete = useCallback(() => {
    setLoaderDone(true);
    // Restore scroll after loader
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

          {/* Sections slot in here one by one */}
          {/* <Hero />           */}
          {/* <LifeEmerges />    */}
          {/* <HumanMind />      */}
          {/* <ArtificialMind /> */}
          {/* <Beyond />         */}
          {/* <Outro />          */}

          {/* ── Temporary scaffold placeholder ────────────────────────── */}
          {loaderDone && (
            <div
              style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                gap: '1rem',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(124, 58, 237, 0.6)',
                }}
              >
                Scaffold ready — Hero section loading next
              </p>
              <div
                style={{
                  width: '1px',
                  height: '60px',
                  background: 'linear-gradient(to bottom, #7c3aed, transparent)',
                }}
              />
            </div>
          )}

        </main>
      </SmoothScroll>
    </>
  );
}
