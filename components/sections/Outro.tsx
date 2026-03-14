'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Minimal breathing particle field — pure CSS, no Three.js ────────────────
function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.5 + Math.random() * 1.5,
    delay: Math.random() * 4,
    dur: 2 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            background: '#f0f0f0',
            opacity: s.opacity,
            animation: `outroPulse ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes outroPulse {
          0%   { opacity: 0.05; transform: scale(0.8); }
          100% { opacity: 0.5;  transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default function Outro() {
  const sectionRef  = useRef<HTMLElement>(null);
  const lineOneRef  = useRef<HTMLDivElement>(null);
  const lineTwoRef  = useRef<HTMLDivElement>(null);
  const lineThreeRef= useRef<HTMLDivElement>(null);
  const subRef      = useRef<HTMLDivElement>(null);
  const signoffRef  = useRef<HTMLDivElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !sectionRef.current) return;

    const ctx = gsap.context(() => {

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
      });

      // Line in from left
      tl.fromTo(lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: 'expo.out', transformOrigin: 'left center' }
      )
      .fromTo(lineOneRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'expo.out' },
        '-=0.8'
      )
      .fromTo(lineTwoRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'expo.out' },
        '-=0.6'
      )
      .fromTo(lineThreeRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'expo.out' },
        '-=0.6'
      )
      .fromTo(subRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' },
        '-=0.4'
      )
      .fromTo(signoffRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2 },
        '+=0.3'
      );

    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section
      id="outro"
      ref={sectionRef}
      className="section-full"
      style={{
        minHeight: '100vh',
        background: '#000000',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        isolation: 'isolate',
        zIndex: 6,
        position: 'relative',
        marginTop: '-2px',
      }}
    >
      {/* Background gradient — fades from Beyond's pink/violet */}
      <div aria-hidden className="absolute top-0 inset-x-0 pointer-events-none"
        style={{ height: '40vh', zIndex: 0,
          background: 'linear-gradient(to bottom, #06000f 0%, #000000 100%)' }}
      />

      {/* Star field */}
      {mounted && <StarField />}

      {/* Center content */}
      <div
        className="content-layer relative flex flex-col items-center text-center"
        style={{
          zIndex: 2,
          padding: 'clamp(4rem, 10vw, 10rem) clamp(1.5rem, 6vw, 8rem)',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* Expanding line */}
        <div
          ref={lineRef}
          style={{
            width: '100%',
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(240,240,240,0.2), transparent)',
            marginBottom: '4rem',
          }}
        />

        {/* The closing statement — three lines, each its own world */}
        <div
          ref={lineOneRef}
          className="font-display"
          style={{
            opacity: 0,
            fontSize: 'clamp(2rem, 6vw, 7rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 0.9,
            color: 'rgba(240,240,240,0.9)',
            marginBottom: '0.2em',
          }}
        >
          You are the universe
        </div>

        <div
          ref={lineTwoRef}
          className="font-display"
          style={{
            opacity: 0,
            fontSize: 'clamp(2rem, 6vw, 7rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 0.9,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4, #10b981, #f59e0b, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            backgroundSize: '300% auto',
            animation: 'gradientShift 6s linear infinite',
            marginBottom: '0.2em',
          }}
        >
          becoming aware
        </div>

        <div
          ref={lineThreeRef}
          className="font-display"
          style={{
            opacity: 0,
            fontSize: 'clamp(2rem, 6vw, 7rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 0.9,
            color: 'rgba(240,240,240,0.3)',
            marginBottom: '3rem',
          }}
        >
          of itself.
        </div>

        {/* Italic subline */}
        <div
          ref={subRef}
          className="font-serif"
          style={{
            opacity: 0,
            fontSize: 'clamp(0.9rem, 2vw, 1.4rem)',
            fontStyle: 'italic',
            color: 'rgba(240,240,240,0.3)',
            lineHeight: 1.8,
            maxWidth: '520px',
          }}
        >
          Intelligence did not arrive from outside the cosmos.
          <br />
          It was always the cosmos — waiting to know itself.
        </div>

        {/* Expanding line */}
        <div
          style={{
            width: '100%',
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(240,240,240,0.1), transparent)',
            margin: '3.5rem 0',
          }}
        />

        {/* Sign-off */}
        <div
          ref={signoffRef}
          className="font-mono-dm"
          style={{
            opacity: 0,
            fontSize: '0.6rem',
            letterSpacing: '0.4em',
            color: 'rgba(240,240,240,0.2)',
            textTransform: 'uppercase',
            lineHeight: 2.5,
          }}
        >
          <div>THE EVOLUTION OF INTELLIGENCE</div>
          <div style={{ color: 'rgba(124,58,237,0.4)' }}>
            ◈ 06 / 06 — COMPLETE
          </div>
        </div>
      </div>

      {/* Gradient animation */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
      `}</style>
    </section>
  );
}
