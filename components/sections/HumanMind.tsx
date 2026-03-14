'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TransitionPanel from '@/components/core/TransitionPanel';

const KnowledgeCanvas = dynamic(
  () => import('@/components/canvas/KnowledgeCanvas'),
  { ssr: false }
);

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Scrolling word wall — civilization milestones ────────────────────────────
const WORD_ROWS = [
  ['FIRE', 'WHEEL', 'WRITING', 'MATHEMATICS', 'PHILOSOPHY', 'ASTRONOMY'],
  ['AGRICULTURE', 'CITIES', 'LAW', 'MEDICINE', 'METALLURGY', 'TRADE'],
  ['PRINTING', 'DEMOCRACY', 'SCIENCE', 'CALCULUS', 'STEAM', 'ELECTRICITY'],
  ['RELATIVITY', 'EVOLUTION', 'DNA', 'COMPUTING', 'INTERNET', 'AI'],
];

// ─── Timeline milestones ──────────────────────────────────────────────────────
const MILESTONES = [
  { year: '70,000 BC',  event: 'Cognitive revolution — symbolic thought' },
  { year: '40,000 BC',  event: 'Cave art — abstract representation' },
  { year: '10,000 BC',  event: 'Agriculture — mastery of nature' },
  { year: '3,500 BC',   event: 'Writing — externalizing memory' },
  { year: '500 BC',     event: 'Philosophy — questioning existence' },
  { year: '1543 AD',    event: 'Scientific revolution begins' },
  { year: '1945 AD',    event: 'First programmable computer' },
];

export default function HumanMind() {
  const sectionRef    = useRef<HTMLElement>(null);
  const headlineRef   = useRef<HTMLDivElement>(null);
  const bodyRef       = useRef<HTMLDivElement>(null);
  const labelRef      = useRef<HTMLDivElement>(null);
  const timelineRef   = useRef<HTMLDivElement>(null);
  const wordWallRef   = useRef<HTMLDivElement>(null);
  const statsRef      = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ── GSAP scroll-triggered animations ─────────────────────────────────────
  useEffect(() => {
    if (!mounted || !sectionRef.current) return;

    const ctx = gsap.context(() => {

      // Track canvas scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => { scrollProgress.current = self.progress; },
      });

      // Label
      gsap.fromTo(labelRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      );

      // Headline
      const words = headlineRef.current?.querySelectorAll('.h-word');
      if (words?.length) {
        gsap.fromTo(words,
          { opacity: 0, y: 70, rotateX: -35 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' } }
        );
      }

      // Body
      gsap.fromTo(bodyRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 55%' } }
      );

      // Stats row
      const stats = statsRef.current?.querySelectorAll('.stat-item');
      if (stats?.length) {
        gsap.fromTo(stats,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'expo.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 50%' } }
        );
      }

      // Timeline items stagger in
      const items = timelineRef.current?.querySelectorAll('.t-item');
      if (items?.length) {
        gsap.fromTo(items,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'expo.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 45%' } }
        );
      }

      // Word wall rows — alternate directions
      const rows = wordWallRef.current?.querySelectorAll('.word-row');
      rows?.forEach((row, i) => {
        const dir = i % 2 === 0 ? '-10%' : '10%';
        gsap.fromTo(row,
          { x: dir, opacity: 0 },
          { x: '0%', opacity: 1, duration: 1.2, ease: 'expo.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 60%',
              onLeaveBack: () => gsap.set(row, { x: dir, opacity: 0 }) }
          }
        );

        // Continuous drift on scroll
        gsap.to(row, {
          x: i % 2 === 0 ? '-8%' : '8%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      });

      // Headline exits on scroll out
      gsap.to(headlineRef.current, {
        y: '-18vh', opacity: 0, ease: 'none',
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
      id="human"
      ref={sectionRef}
      className="section-full"
      style={{
        minHeight: '160vh',
        background: '#03080f',
        alignItems: 'flex-start',
        flexDirection: 'column',
        isolation: 'isolate',
        zIndex: 3,
        position: 'relative',
        marginTop: '-2px',
      }}
    >
      {/* Sticky viewport */}
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'clip' }}>

        {/* Canvas */}
        <div className="canvas-layer" style={{ background: '#03080f' }}>
          {mounted && <KnowledgeCanvas scrollProgress={scrollProgress} />}
        </div>

        {/* Vignette */}
        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 2, background: 'radial-gradient(ellipse at 60% 50%, transparent 25%, rgba(3,8,15,0.9) 100%)' }}
        />

        {/* Bridge from Life Emerges */}
        <div aria-hidden className="absolute top-0 inset-x-0 pointer-events-none"
          style={{ zIndex: 2, height: '30vh',
            background: 'linear-gradient(to bottom, #000d07 0%, #03080f 100%)' }}
        />

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div className="content-layer absolute inset-0 flex" style={{ zIndex: 3 }}>

          {/* ── Left column ────────────────────────────────────────────────── */}
          <div className="flex flex-col justify-center"
            style={{
              paddingLeft: 'clamp(1.5rem, 5vw, 5rem)',
              paddingRight: '2rem',
              width: '52%',
              paddingTop: '3rem',
            }}
          >
            {/* Label */}
            <div ref={labelRef} className="font-mono-dm mb-6"
              style={{ opacity: 0, fontSize: '0.6rem', letterSpacing: '0.35em',
                color: '#06b6d4', textTransform: 'uppercase' }}
            >
              ◈ CHAPTER III — HUMAN CONSCIOUSNESS
            </div>

            {/* Headline */}
            <div ref={headlineRef} className="font-display overflow-hidden"
              style={{ fontSize: 'clamp(3rem, 9vw, 10rem)', fontWeight: 800,
                lineHeight: 0.88, letterSpacing: '-0.04em', perspective: '800px' }}
            >
              {[
                { text: 'THE',    color: '#f0f0f0' },
                { text: 'CON-',   color: '#f0f0f0' },
                { text: 'SCIOUS', gradient: true },
                { text: 'MIND',   color: 'rgba(240,240,240,0.35)' },
              ].map(({ text, color, gradient }, i) => (
                <div key={i} className="h-word block" style={{
                  opacity: 0,
                  paddingLeft: i === 2 ? '2vw' : i === 3 ? '5vw' : 0,
                  ...(gradient ? {
                    background: 'linear-gradient(135deg, #06b6d4 0%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  } : { color }),
                }}>
                  {text}
                </div>
              ))}
            </div>

            {/* Body */}
            <div ref={bodyRef} className="font-serif mt-7"
              style={{ opacity: 0, fontSize: 'clamp(0.9rem, 1.7vw, 1.2rem)',
                fontStyle: 'italic', color: 'rgba(240,240,240,0.4)',
                lineHeight: 1.75, maxWidth: '400px' }}
            >
              Humans became the first species to externalize their minds —
              storing knowledge outside the skull. Language. Writing. Printing.
              The internet. Each leap multiplied intelligence.
            </div>

            {/* Stats */}
            <div ref={statsRef} className="font-mono-dm mt-8 flex gap-6"
              style={{ fontSize: '0.6rem', letterSpacing: '0.15em' }}
            >
              {[
                { v: '7,000+', l: 'LANGUAGES' },
                { v: '130M+',  l: 'BOOKS WRITTEN' },
                { v: '5B',     l: 'INTERNET USERS' },
              ].map(({ v, l }) => (
                <div key={l} className="stat-item flex flex-col gap-1" style={{ opacity: 0 }}>
                  <span style={{ color: '#06b6d4', fontSize: '1.1rem',
                    letterSpacing: '-0.02em', fontWeight: 400 }}>{v}</span>
                  <span style={{ color: 'rgba(240,240,240,0.25)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: timeline ─────────────────────────────────────── */}
          <div ref={timelineRef}
            className="absolute font-mono-dm"
            style={{ right: '4vw', top: '50%', transform: 'translateY(-50%)',
              width: 'clamp(180px, 22vw, 280px)' }}
          >
            {/* Timeline connector line */}
            <div style={{ position: 'absolute', left: '5px', top: 0, bottom: 0,
              width: '1px', background: 'linear-gradient(to bottom, transparent, #06b6d4, transparent)' }}
            />

            {MILESTONES.map(({ year, event }, i) => (
              <div key={year} className="t-item flex items-start gap-4 mb-5"
                style={{ opacity: 0, paddingLeft: '20px', position: 'relative' }}
              >
                {/* Node on timeline */}
                <div style={{ position: 'absolute', left: '1px', top: '4px',
                  width: '9px', height: '9px', borderRadius: '50%',
                  background: i === MILESTONES.length - 1 ? '#f59e0b' : '#06b6d4',
                  boxShadow: `0 0 8px ${i === MILESTONES.length - 1 ? '#f59e0b' : '#06b6d4'}`,
                  transform: 'translateX(-4px)',
                }} />
                <div>
                  <div style={{ fontSize: '0.55rem', color: '#f59e0b',
                    letterSpacing: '0.2em', marginBottom: '3px' }}>{year}</div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(240,240,240,0.55)',
                    lineHeight: 1.5, letterSpacing: '0.05em' }}>{event}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Word wall (bottom strip) ────────────────────────────────────── */}
          <div ref={wordWallRef}
            className="absolute bottom-0 inset-x-0 overflow-hidden"
            style={{ zIndex: 4, paddingBottom: '2.5rem' }}
          >
            {WORD_ROWS.map((row, ri) => (
              <div key={ri} className="word-row flex gap-6 mb-1"
                style={{
                  opacity: 0,
                  whiteSpace: 'nowrap',
                  paddingLeft: ri % 2 === 0 ? '0' : '3rem',
                }}
              >
                {row.map((word) => (
                  <span key={word} className="font-display no-select"
                    style={{
                      fontSize: 'clamp(0.7rem, 1.4vw, 1.1rem)',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: ri === 3
                        ? 'rgba(245,158,11,0.25)'
                        : 'rgba(6,182,212,0.15)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* ── Floating graph label ───────────────────────────────────────── */}
          <div className="absolute font-mono-dm"
            style={{ top: '2rem', right: '2.5rem', textAlign: 'right',
              fontSize: '0.55rem', letterSpacing: '0.2em',
              color: 'rgba(6,182,212,0.35)', textTransform: 'uppercase' }}
          >
            <div>15 CONCEPTS</div>
            <div style={{ color: 'rgba(245,158,11,0.35)', marginTop: '4px' }}>
              28 CONNECTIONS
            </div>
          </div>

          {/* ── Section marker ─────────────────────────────────────────────── */}
          <div className="absolute font-mono-dm"
            style={{ bottom: '2rem', left: '2.5rem', fontSize: '0.55rem',
              letterSpacing: '0.3em', color: 'rgba(240,240,240,0.15)', textTransform: 'uppercase' }}
          >
            THE EVOLUTION OF INTELLIGENCE — 03 / 06
          </div>
          <div className="absolute font-mono-dm"
            style={{ bottom: '2rem', right: '2.5rem', fontSize: '0.55rem',
              letterSpacing: '0.25em', color: 'rgba(6,182,212,0.35)', textTransform: 'uppercase' }}
          >
            HOMO SAPIENS SAPIENS
          </div>

        </div>
      </div>

      {/* ── Transition panel ─────────────────────────────────────────────── */}
      <TransitionPanel
        chapter="III"
        label="Human Consciousness — the universe becoming aware of itself"
        statement="For the first time in 13.8 billion years, the cosmos opened its eyes."
        accent="opened its eyes"
        annotation="Human consciousness is not separate from the universe — it is the universe reflecting on its own existence. We are the mechanism by which matter contemplates matter."
        color="#06b6d4"
        bg="#03080f"
      />
    </section>
  );
}
