'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface LoaderProps {
  onComplete: () => void;
}

// Rotating status messages — feel like a universe booting up
const BOOT_MESSAGES = [
  'CALIBRATING SPACETIME',
  'INITIALIZING COSMOS',
  'ASSEMBLING QUARKS',
  'IGNITING FIRST STARS',
  'SEEDING ORGANIC MATTER',
  'EVOLVING COMPLEXITY',
  'AWAKENING CONSCIOUSNESS',
  'LOADING INTELLIGENCE',
];

export default function Loader({ onComplete }: LoaderProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const counterRef    = useRef<HTMLDivElement>(null);
  const lineRef       = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<HTMLDivElement>(null);
  const titleRef      = useRef<HTMLDivElement>(null);
  const subtitleRef   = useRef<HTMLDivElement>(null);
  const statusRef     = useRef<HTMLDivElement>(null);
  const overlayRef    = useRef<HTMLDivElement>(null);
  const curtainTopRef = useRef<HTMLDivElement>(null);
  const curtainBotRef = useRef<HTMLDivElement>(null);

  const [count, setCount]       = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container  = containerRef.current;
    const counter    = counterRef.current;
    const line       = lineRef.current;
    const progress   = progressRef.current;
    const title      = titleRef.current;
    const subtitle   = subtitleRef.current;
    const status     = statusRef.current;
    const curtainTop = curtainTopRef.current;
    const curtainBot = curtainBotRef.current;

    if (!container || !counter || !line || !progress || !title || !subtitle || !status) return;

    // ── Master GSAP timeline ──────────────────────────────────────────────
    const tl = gsap.timeline({
      defaults: { ease: 'expo.out' },
      onComplete: () => {
        // After curtains open, unmount loader
        onComplete();
      },
    });

    // Phase 1 — Immediate: show the scan line and counter
    tl
      .set(container, { opacity: 1 })
      .fromTo(line,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: 'expo.out', transformOrigin: 'left center' }
      )
      .fromTo(status,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.4'
      );

    // Phase 2 — Count from 0 → 100 while cycling messages
    const counter_obj = { value: 0 };

    tl.to(counter_obj, {
      value: 100,
      duration: 2.4,
      ease: 'none',
      onUpdate: () => {
        const v = Math.round(counter_obj.value);
        setCount(v);
        // Cycle messages roughly every 12%
        setMsgIndex(Math.floor(v / 12.5) % BOOT_MESSAGES.length);
        // Drive the progress bar width
        if (progress) {
          progress.style.width = `${v}%`;
        }
      },
    }, '-=0.2');

    // Phase 3 — Title reveal (staggered letter split)
    tl
      .fromTo(title,
        { opacity: 0, y: 24, letterSpacing: '0.5em' },
        { opacity: 1, y: 0, letterSpacing: '-0.04em', duration: 1, ease: 'expo.out' },
        '-=0.6'
      )
      .fromTo(subtitle,
        { opacity: 0, y: 12 },
        { opacity: 0.45, y: 0, duration: 0.7 },
        '-=0.5'
      );

    // Phase 4 — Brief hold so the user reads the title
    tl.to({}, { duration: 0.8 });

    // Phase 5 — Curtain reveal (top and bottom panels split open)
    tl
      .to(status, { opacity: 0, y: -8, duration: 0.3 })
      .to(counter, { opacity: 0, y: -8, duration: 0.3 }, '<')
      .to(line, { opacity: 0, duration: 0.3 }, '<')
      .to([curtainTop, curtainBot], {
        scaleY: 0,
        duration: 1.0,
        ease: 'expo.inOut',
        stagger: 0,
      }, '-=0.1')
      .to(title, {
        y: -30,
        opacity: 0,
        duration: 0.5,
        ease: 'expo.in',
      }, '<+0.1')
      .to(subtitle, {
        opacity: 0,
        duration: 0.3,
      }, '<')
      .set(container, { display: 'none' });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[var(--z-loader)] bg-void flex flex-col items-center justify-center no-select"
      style={{ opacity: 0 }}
      aria-label="Loading experience"
      role="status"
    >
      {/* ── Top curtain ──────────────────────────────────────────────────── */}
      <div
        ref={curtainTopRef}
        className="absolute inset-x-0 top-0 bg-void"
        style={{
          height: '50%',
          transformOrigin: 'top center',
          zIndex: 2,
        }}
      />

      {/* ── Bottom curtain ───────────────────────────────────────────────── */}
      <div
        ref={curtainBotRef}
        className="absolute inset-x-0 bottom-0 bg-void"
        style={{
          height: '50%',
          transformOrigin: 'bottom center',
          zIndex: 2,
        }}
      />

      {/* ── Content layer (behind curtains) ──────────────────────────────── */}
      <div className="relative z-[1] w-full flex flex-col items-center px-8">

        {/* Counter */}
        <div
          ref={counterRef}
          className="font-mono-dm text-ghost"
          style={{
            fontSize: 'clamp(5rem, 18vw, 14rem)',
            lineHeight: 1,
            fontWeight: 300,
            letterSpacing: '-0.04em',
            fontVariantNumeric: 'tabular-nums',
            opacity: 0.12,
            userSelect: 'none',
          }}
        >
          {String(count).padStart(3, '0')}
        </div>

        {/* Horizontal scan line + progress bar */}
        <div className="relative w-full max-w-xl mt-6" style={{ height: '1px' }}>
          {/* Background line */}
          <div
            ref={lineRef}
            className="absolute inset-0"
            style={{
              background: 'rgba(240,240,240,0.1)',
              transformOrigin: 'left center',
            }}
          />
          {/* Active progress fill */}
          <div
            ref={progressRef}
            className="absolute inset-y-0 left-0"
            style={{
              width: '0%',
              background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
              boxShadow: '0 0 12px #7c3aed, 0 0 24px #06b6d4',
              transition: 'width 0.05s linear',
            }}
          />
        </div>

        {/* Status message */}
        <div
          ref={statusRef}
          className="mt-5 text-sub"
          style={{ color: 'rgba(240,240,240,0.35)', letterSpacing: '0.3em', opacity: 0 }}
        >
          {BOOT_MESSAGES[msgIndex]}
        </div>

        {/* Title — appears near end of load */}
        <div className="mt-16 text-center" style={{ opacity: 0 }} ref={titleRef}>
          <h1
            className="font-display text-ghost"
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 4.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            THE EVOLUTION
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 50%, #f0f0f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              OF INTELLIGENCE
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div
          ref={subtitleRef}
          className="mt-4 text-sub text-center"
          style={{ opacity: 0, letterSpacing: '0.35em', color: 'rgba(240,240,240,0.45)' }}
        >
          AN INTERACTIVE JOURNEY
        </div>

      </div>

      {/* ── Noise grain on loader ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  );
}
