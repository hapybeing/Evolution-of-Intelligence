'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TransitionPanel from '@/components/core/TransitionPanel';

const NeuralCanvas = dynamic(() => import('@/components/canvas/NeuralCanvas'), { ssr: false });

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── AI capability milestones ─────────────────────────────────────────────────
const AI_TIMELINE = [
  { year: '1950', event: 'Turing proposes machine intelligence',   color: '#06b6d4' },
  { year: '1956', event: 'Dartmouth Conference — AI is named',      color: '#06b6d4' },
  { year: '1997', event: 'Deep Blue defeats Kasparov at chess',     color: '#f59e0b' },
  { year: '2012', event: 'AlexNet — deep learning revolution',      color: '#f59e0b' },
  { year: '2017', event: 'Transformer architecture invented',       color: '#f59e0b' },
  { year: '2022', event: 'Large language models reach human parity',color: '#fbbf24' },
  { year: '2025', event: 'AI surpasses PhD-level reasoning',        color: '#fde68a' },
];

// ─── Network layer labels ──────────────────────────────────────────────────────
const LAYERS = [
  { label: 'INPUT',    sub: '6 neurons',  x: '28%' },
  { label: 'HIDDEN 1', sub: '9 neurons',  x: '40%' },
  { label: 'HIDDEN 2', sub: '9 neurons',  x: '52%' },
  { label: 'HIDDEN 3', sub: '9 neurons',  x: '64%' },
  { label: 'OUTPUT',   sub: '4 neurons',  x: '76%' },
];

// ─── Glitch text component ────────────────────────────────────────────────────
function GlitchWord({ text, color }: { text: string; color: string }) {
  return (
    <span
      data-text={text}
      className="glitch"
      style={{ color, display: 'inline-block' }}
    >
      {text}
    </span>
  );
}

export default function ArtificialMind() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const bodyRef     = useRef<HTMLDivElement>(null);
  const labelRef    = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const layerLabels = useRef<HTMLDivElement>(null);
  const metricsRef  = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);

  const [mounted, setMounted]     = useState(false);
  const [glitchOn, setGlitchOn]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Occasional glitch flicker
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setGlitchOn(true);
      setTimeout(() => setGlitchOn(false), 150);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !sectionRef.current) return;

    const ctx = gsap.context(() => {

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
      const words = headlineRef.current?.querySelectorAll('.ai-word');
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

      // Metrics
      const metrics = metricsRef.current?.querySelectorAll('.metric-item');
      if (metrics?.length) {
        gsap.fromTo(metrics,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'expo.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 50%' } }
        );
      }

      // Timeline
      const items = timelineRef.current?.querySelectorAll('.ai-t-item');
      if (items?.length) {
        gsap.fromTo(items,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: 'expo.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 45%' } }
        );
      }

      // Layer labels
      const labels = layerLabels.current?.querySelectorAll('.layer-label');
      if (labels?.length) {
        gsap.fromTo(labels,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'expo.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 50%' } }
        );
      }


    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section
      id="ai"
      ref={sectionRef}
      className="section-full"
      style={{
        minHeight: '160vh',
        background: '#080400',
        alignItems: 'flex-start',
        flexDirection: 'column',
        isolation: 'isolate',
        zIndex: 4,
        position: 'relative',
        marginTop: '-2px',
      }}
    >
      {/* Sticky viewport */}
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'clip' }}>

        {/* Canvas */}
        <div className="canvas-layer" style={{ background: '#080400' }}>
          {mounted && <NeuralCanvas />}
        </div>

        {/* Vignette */}
        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 2, background: 'radial-gradient(ellipse at 65% 50%, transparent 20%, rgba(8,4,0,0.92) 100%)' }}
        />

        {/* Bridge from HumanMind */}
        <div aria-hidden className="absolute top-0 inset-x-0 pointer-events-none"
          style={{ zIndex: 2, height: '30vh',
            background: 'linear-gradient(to bottom, #03080f 0%, #080400 100%)' }}
        />

        {/* Scanline effect over canvas */}
        <div
          aria-hidden
          className="scanlines absolute inset-0 pointer-events-none"
          style={{ zIndex: 2, opacity: 0.4 }}
        />

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div className="content-layer absolute inset-0 flex" style={{ zIndex: 3 }}>

          {/* ── Left column ────────────────────────────────────────────────── */}
          <div className="flex flex-col justify-center"
            style={{
              paddingLeft: 'clamp(1.5rem, 5vw, 5rem)',
              paddingRight: '2rem',
              width: '50%',
              paddingTop: 'clamp(1rem, 6vh, 3rem)',
            }}
          >
            {/* Label */}
            <div ref={labelRef} className="font-mono-dm mb-6"
              style={{ opacity: 0, fontSize: '0.6rem', letterSpacing: '0.35em',
                color: '#f59e0b', textTransform: 'uppercase' }}
            >
              ◈ CHAPTER IV — ARTIFICIAL INTELLIGENCE
            </div>

            {/* Headline */}
            <div
              ref={headlineRef}
              className="font-display overflow-hidden"
              style={{ fontSize: 'clamp(2.5rem, min(9vw, 12vh), 9rem)', fontWeight: 800,
                lineHeight: 0.88, letterSpacing: '-0.04em', perspective: '800px' }}
            >
              {[
                { text: 'THE',      color: '#f0f0f0',               gradient: false },
                { text: 'DIGITAL', color: '#f0f0f0',               gradient: false },
                { text: 'MIND',    color: '',                       gradient: true  },
                { text: 'WAKES',   color: 'rgba(240,240,240,0.3)', gradient: false },
              ].map(({ text, color, gradient }, i) => (
                <div key={i} className="ai-word block" style={{
                  opacity: 0,
                  paddingLeft: i === 2 ? '2vw' : i === 3 ? '5vw' : 0,
                  ...(gradient ? {
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fde68a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: glitchOn ? 'blur(1px)' : 'none',
                    transition: 'filter 0.05s',
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
              Intelligence is no longer exclusively biological.
              We have encoded the architecture of thought into silicon —
              and it is learning faster than we anticipated.
            </div>

            {/* Metrics */}
            <div ref={metricsRef} className="font-mono-dm mt-8 flex gap-6"
              style={{ fontSize: '0.6rem', letterSpacing: '0.15em' }}
            >
              {[
                { v: '1T+',    l: 'PARAMETERS' },
                { v: '100×',   l: 'YOY COMPUTE' },
                { v: '< 2YR',  l: 'TO NEXT LEAP' },
              ].map(({ v, l }) => (
                <div key={l} className="metric-item flex flex-col gap-1" style={{ opacity: 0 }}>
                  <span style={{ color: '#f59e0b', fontSize: '1.1rem',
                    letterSpacing: '-0.02em', fontWeight: 400 }}>{v}</span>
                  <span style={{ color: 'rgba(240,240,240,0.25)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: timeline ────────────────────────────────────────────── */}
          <div ref={timelineRef}
            className="absolute font-mono-dm"
            style={{ right: '4vw', top: '50%', transform: 'translateY(-50%)',
              width: 'clamp(180px, 22vw, 280px)' }}
          >
            <div style={{ position: 'absolute', left: '5px', top: 0, bottom: 0,
              width: '1px', background: 'linear-gradient(to bottom, transparent, #f59e0b, transparent)' }}
            />
            {AI_TIMELINE.map(({ year, event, color }, i) => (
              <div key={year} className="ai-t-item flex items-start gap-4 mb-4"
                style={{ opacity: 0, paddingLeft: '20px', position: 'relative' }}
              >
                <div style={{ position: 'absolute', left: '1px', top: '4px',
                  width: '9px', height: '9px', borderRadius: '50%',
                  background: color, boxShadow: `0 0 8px ${color}`,
                  transform: 'translateX(-4px)',
                }} />
                <div>
                  <div style={{ fontSize: '0.55rem', color: '#f59e0b',
                    letterSpacing: '0.2em', marginBottom: '3px' }}>{year}</div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(240,240,240,0.5)',
                    lineHeight: 1.5 }}>{event}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Network layer labels (bottom of canvas) ────────────────────── */}
          <div ref={layerLabels}
            className="absolute inset-x-0 font-mono-dm"
            style={{ bottom: '6rem', display: 'flex', justifyContent: 'flex-start', gap: 0 }}
          >
            {LAYERS.map(({ label, sub, x }) => (
              <div key={label} className="layer-label absolute text-center"
                style={{ left: x, transform: 'translateX(-50%)', opacity: 0 }}
              >
                <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em',
                  color: 'rgba(245,158,11,0.6)', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '0.45rem', letterSpacing: '0.15em',
                  color: 'rgba(240,240,240,0.2)', marginTop: '2px' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* ── Terminal readout (top right) ───────────────────────────────── */}
          <div className="absolute font-mono-dm"
            style={{ top: '2rem', right: '2.5rem', textAlign: 'right',
              fontSize: '0.55rem', letterSpacing: '0.15em',
              color: 'rgba(245,158,11,0.4)', textTransform: 'uppercase', lineHeight: 2 }}
          >
            <div style={{ color: '#f59e0b' }}>● SYSTEM ACTIVE</div>
            <div>LAYERS: 5</div>
            <div>NEURONS: 37</div>
            <div>FIRING: CONTINUOUS</div>
          </div>

          {/* ── Section marker ─────────────────────────────────────────────── */}
          <div className="absolute font-mono-dm"
            style={{ bottom: '2rem', left: '2.5rem', fontSize: '0.55rem',
              letterSpacing: '0.3em', color: 'rgba(240,240,240,0.15)', textTransform: 'uppercase' }}
          >
            THE EVOLUTION OF INTELLIGENCE — 04 / 06
          </div>
          <div className="absolute font-mono-dm"
            style={{ bottom: '2rem', right: '2.5rem', fontSize: '0.55rem',
              letterSpacing: '0.25em', color: 'rgba(245,158,11,0.35)', textTransform: 'uppercase' }}
          >
            ARTIFICIAL GENERAL INTELLIGENCE
          </div>

        </div>
      </div>

      {/* ── Transition panel ─────────────────────────────────────────────── */}
      <TransitionPanel
        label="Artificial Intelligence — the second genesis of mind"
        statement="We built a mirror to see our own intelligence. The mirror started thinking back."
        accent="started thinking back"
        annotation="For the first time in history, intelligence is not a product of evolution. It is a product of intention — designed, trained, and deployed at scales no biological mind could reach alone."
        color="#f59e0b"
        bg="#080400"
      />
    </section>
  );
}
