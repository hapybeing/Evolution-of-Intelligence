'use client';

/**
 * page.tsx — Main assembler
 * Sections are imported here as they get built.
 * Nothing renders yet except a black screen — that's correct.
 * We'll add sections one by one.
 */

export default function Home() {
  return (
    <main>
      {/* ── SECTIONS WILL BE ASSEMBLED HERE ─────────────────────────────
       *
       *  <Loader />           ← cinematic loading screen
       *  <CustomCursor />     ← magnetic cursor
       *  <Navigation />       ← floating progress nav
       *  <SmoothScroll>
       *    <Hero />           ← Section 1: Cosmic Birth
       *    <LifeEmerges />    ← Section 2: Biological Complexity
       *    <HumanMind />      ← Section 3: Civilization & Knowledge
       *    <ArtificialMind /> ← Section 4: Neural Networks
       *    <Beyond />         ← Section 5: Speculative Future
       *    <Outro />          ← Section 6: Closing Message
       *  </SmoothScroll>
       *
       * ──────────────────────────────────────────────────────────────── */}

      {/* Temporary: confirm the app renders */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#7c3aed',
          fontFamily: 'var(--font-syne, sans-serif)',
          fontSize: '0.75rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          opacity: 0.4,
        }}
      >
        Foundation Ready — Building…
      </div>
    </main>
  );
}
