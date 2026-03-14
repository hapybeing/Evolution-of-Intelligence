'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TransitionPanel from '@/components/core/TransitionPanel';

const BioCanvas = dynamic(() => import('@/components/canvas/BioCanvas'), { ssr: false });

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Biological taxonomy data displayed as floating labels ────────────────────
const TAXONOMY = [
  { label: 'PROKARYOTA',    sub: '3.8 billion years ago', x: '72%', y: '18%', delay: 0.2 },
  { label: 'EUKARYOTA',     sub: '2.1 billion years ago', x: '78%', y: '38%', delay: 0.4 },
  { label: 'MULTICELLULAR', sub: '600 million years ago', x: '70%', y: '58%', delay: 0.6 },
  { label: 'NERVOUS SYSTEM',sub: '550 million years ago', x: '74%', y: '76%', delay: 0.8 },
];

// ─── DNA base pair labels ──────────────────────────────────────────────────────
const DNA_CHARS = 'ATCGATCGATCGATCGATCG'.split('');

export default function LifeEmerges() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const bodyRef     = useRef<HTMLDivElement>(null);
  const dnaRef      = useRef<HTMLDivElement>(null);
  const taxRef      = useRef<HTMLDivElement>(null);
  const labelRef    = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── Entrance animations via ScrollTrigger ──────────────────────────────────
  useEffect(() => {
    if (!mounted || !sectionRef.current) return;

    const ctx = gsap.context(() => {

      // Section label
      gsap.fromTo(labelRef.current,
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0, duration: 0.8, ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );

      // Headline words stagger in from bottom
      const words = headlineRef.current?.querySelectorAll('.bio-word');
      if (words?.length) {
        gsap.fromTo(words,
          { opacity: 0, y: 60, skewY: 4 },
          {
            opacity: 1, y: 0, skewY: 0,
            duration: 1.0,
            ease: 'expo.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
            },
          }
        );
      }

      // Body text
      gsap.fromTo(bodyRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 55%',
          },
        }
      );

      // DNA ticker
      gsap.fromTo(dnaRef.current,
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
          },
        }
      );

      // Taxonomy labels stagger
      const taxItems = taxRef.current?.querySelectorAll('.tax-item');
      if (taxItems?.length) {
        gsap.fromTo(taxItems,
          { opacity: 0, x: 20 },
          {
            opacity: 1, x: 0,
            duration: 0.7,
            ease: 'expo.out',
            stagger: 0.15,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 45%',
            },
          }
        );
      }

      // Scroll-driven canvas progress
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
        },
      });

      // Parallax: headline drifts up on scroll out
      gsap.to(headlineRef.current, {
        y: '-20vh',
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '70% center',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section
      id="life"
      ref={sectionRef}
      className="section-full"
      style={{
        minHeight: '160vh',
        background: '#000d07',
        alignItems: 'flex-start',
        flexDirection: 'column',
        isolation: 'isolate',
        zIndex: 2,
        position: 'relative',
        marginTop: '-2px',
      }}
    >
      {/* Sticky viewport */}
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'clip' }}>

        {/* Canvas */}
        <div className="canvas-layer" style={{ background: '#000d07' }}>
          {mounted && <BioCanvas scrollProgress={scrollProgress} />}
        </div>

        {/* ── Radial vignette ──────────────────────────────────────────────── */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background: 'radial-gradient(ellipse at 35% 50%, transparent 30%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* ── Cross-section bridge — eliminates blank gap from Hero ────── */}
        <div
          aria-hidden
          className="absolute top-0 inset-x-0 pointer-events-none"
          style={{
            zIndex: 2,
            height: '35vh',
            background: 'linear-gradient(to bottom, #000000 0%, #010f07 60%, transparent 100%)',
          }}
        />

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div
          className="content-layer absolute inset-0 flex"
          style={{ zIndex: 3 }}
        >

          {/* ── Left column: typography ─────────────────────────────────── */}
          <div
            className="flex flex-col justify-center"
            style={{
              paddingLeft: 'clamp(1.5rem, 5vw, 5rem)',
              paddingRight: '2rem',
              width: '55%',
              paddingTop: 'clamp(1rem, 6vh, 3rem)',
            }}
          >
            {/* Chapter label */}
            <div
              ref={labelRef}
              className="font-mono-dm mb-6"
              style={{
                opacity: 0,
                fontSize: '0.6rem',
                letterSpacing: '0.35em',
                color: '#10b981',
                textTransform: 'uppercase',
              }}
            >
              ◈ CHAPTER II — BIOLOGICAL COMPLEXITY
            </div>

            {/* Main headline */}
            <div
              ref={headlineRef}
              className="font-display overflow-hidden"
              style={{
                fontSize: 'clamp(2.5rem, min(9vw, 12vh), 9rem)',
                fontWeight: 800,
                lineHeight: 0.88,
                letterSpacing: '-0.04em',
              }}
            >
              {[
                { text: 'LIFE',     color: '#f0f0f0' },
                { text: 'EM-',      color: '#f0f0f0' },
                { text: 'ERGES',    gradient: true },
              ].map(({ text, color, gradient }, i) => (
                <div
                  key={i}
                  className="bio-word block"
                  style={{
                    opacity: 0,
                    paddingLeft: i === 2 ? '2vw' : 0,
                    ...(gradient ? {
                      background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    } : { color }),
                  }}
                >
                  {text}
                </div>
              ))}
            </div>

            {/* Body */}
            <div
              ref={bodyRef}
              className="font-serif mt-8"
              style={{
                opacity: 0,
                fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)',
                fontStyle: 'italic',
                color: 'rgba(240,240,240,0.45)',
                lineHeight: 1.7,
                maxWidth: '420px',
              }}
            >
              From a single self-replicating molecule emerged four billion years
              of increasing complexity. Chemistry became biology. Biology became
              sensation. Sensation became awareness.
            </div>

            {/* DNA sequence ticker */}
            <div
              ref={dnaRef}
              className="font-mono-dm mt-8 flex items-center gap-3"
              style={{
                opacity: 0,
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
              }}
            >
              <span style={{ color: '#10b981', opacity: 0.5 }}>DNA</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {DNA_CHARS.map((char, i) => (
                  <span
                    key={i}
                    style={{
                      color: char === 'A' ? '#10b981'
                           : char === 'T' ? '#06b6d4'
                           : char === 'C' ? '#7c3aed'
                           :                '#f59e0b',
                      animation: `dnaFlicker ${1.2 + i * 0.08}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div
              className="font-mono-dm mt-10 flex gap-8"
              style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}
            >
              {[
                { value: '3.8B',   label: 'YRS OF LIFE' },
                { value: '8.7M',   label: 'SPECIES' },
                { value: '37T',    label: 'CELLS / HUMAN' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: 400, letterSpacing: '-0.02em' }}>
                    {value}
                  </span>
                  <span style={{ color: 'rgba(240,240,240,0.25)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: taxonomy floating labels ─────────────────── */}
          <div
            ref={taxRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 4 }}
          >
            {TAXONOMY.map(({ label, sub, x, y, delay }) => (
              <div
                key={label}
                className="tax-item absolute font-mono-dm"
                style={{
                  left: x,
                  top: y,
                  opacity: 0,
                  transform: 'translateY(-50%)',
                }}
              >
                {/* Connector dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                    flexShrink: 0,
                  }} />
                  <div style={{
                    width: '30px',
                    height: '1px',
                    background: 'linear-gradient(to right, #10b981, transparent)',
                  }} />
                  <div>
                    <div style={{
                      fontSize: '0.6rem',
                      letterSpacing: '0.25em',
                      color: 'rgba(240,240,240,0.7)',
                      textTransform: 'uppercase',
                    }}>
                      {label}
                    </div>
                    <div style={{
                      fontSize: '0.5rem',
                      letterSpacing: '0.15em',
                      color: '#10b981',
                      opacity: 0.6,
                      marginTop: '2px',
                    }}>
                      {sub}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Bottom: section marker ─────────────────────────────────── */}
          <div
            className="absolute font-mono-dm"
            style={{
              bottom: '2rem',
              left: '2.5rem',
              fontSize: '0.55rem',
              letterSpacing: '0.3em',
              color: 'rgba(240,240,240,0.15)',
              textTransform: 'uppercase',
            }}
          >
            THE EVOLUTION OF INTELLIGENCE — 02 / 06
          </div>

          <div
            className="absolute font-mono-dm"
            style={{
              bottom: '2rem',
              right: '2.5rem',
              fontSize: '0.55rem',
              letterSpacing: '0.25em',
              color: 'rgba(16,185,129,0.35)',
              textTransform: 'uppercase',
            }}
          >
            C₆H₁₂O₆ → COMPLEXITY
          </div>

        </div>
      </div>

      {/* ── Transition panel ─────────────────────────────────────────────── */}
      <TransitionPanel
        chapter="II"
        label="Biological Complexity — 3.8 billion years of evolution"
        statement="Life did not appear. It accumulated — one mutation, one selection, one generation at a time."
        accent="accumulated"
        annotation="Natural selection has no foresight, no goal, no intelligence. Yet from purely mechanical processes emerged eyes, brains, emotions, and eventually the capacity to ask why."
        color="#10b981"
        bg="#000d07"
      />

      {/* DNA flicker animation */}
      <style jsx>{`
        @keyframes dnaFlicker {
          0%   { opacity: 0.3; }
          100% { opacity: 1.0; }
        }
      `}</style>
    </section>
  );
}
