'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Dynamically load the heavy WebGL canvas — never SSR
const CosmicCanvas = dynamic(
  () => import('@/components/canvas/CosmicCanvas'),
  { ssr: false }
);

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const sectionRef    = useRef<HTMLElement>(null);
  const headlineRef   = useRef<HTMLDivElement>(null);
  const sublineRef    = useRef<HTMLDivElement>(null);
  const taglineRef    = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const counterRef    = useRef<HTMLDivElement>(null);
  const overlayRef    = useRef<HTMLDivElement>(null);

  // Shared refs passed into Three.js (avoids React re-renders in the loop)
  const scrollProgress = useRef(0);
  const mousePos       = useRef({ x: 0, y: 0 });

  const [mounted, setMounted] = useState(false);

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Mouse tracking → passed to canvas ───────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth)  * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ── GSAP entrance animations ─────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // 1. Overlay fades away to reveal the canvas
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 1.8,
        ease: 'power2.out',
      });

      // 2. Counter ticks up — cosmic scale number
      const obj = { val: 0 };
      tl.to(obj, {
        val: 13.8,
        duration: 2.0,
        ease: 'expo.out',
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = obj.val.toFixed(1);
          }
        },
      }, '-=1.4');

      // 3. Tagline slides in
      tl.fromTo(taglineRef.current,
        { opacity: 0, y: 16, letterSpacing: '0.6em' },
        { opacity: 1, y: 0, letterSpacing: '0.35em', duration: 1.0, ease: 'expo.out' },
        '-=1.2'
      );

      // 4. Main headline — each word staggers in
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words?.length) {
        tl.fromTo(words,
          { opacity: 0, y: 80, rotateX: -40, transformOrigin: 'top center' },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.2,
            ease: 'expo.out',
            stagger: 0.12,
          },
          '-=0.6'
        );
      }

      // 5. Subline + scroll hint
      tl.fromTo(sublineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' },
        '-=0.7'
      )
      .fromTo(scrollHintRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.3'
      );

    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  // ── GSAP ScrollTrigger — section parallax + scroll progress for canvas ──
  useEffect(() => {
    if (!mounted || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Track scroll ratio for the WebGL canvas
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
        },
      });

      // Headline parallax — drifts up at 40% scroll speed
      gsap.to(headlineRef.current, {
        y: '-25vh',
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '60% top',
          scrub: 1.2,
        },
      });

      // Subline parallax — slightly faster
      gsap.to(sublineRef.current, {
        y: '-18vh',
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '50% top',
          scrub: 0.8,
        },
      });

      // Counter fades out early
      gsap.to(counterRef.current?.parentElement ?? {}, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '30% top',
          scrub: true,
        },
      });

      // Scroll hint fades out immediately on scroll
      gsap.to(scrollHintRef.current, {
        opacity: 0,
        y: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '15% top',
          scrub: true,
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="section-full"
      style={{
        minHeight: '220vh',
        background: 'radial-gradient(ellipse at 50% 40%, #1a0533 0%, #0a0015 45%, #000000 100%)',
        alignItems: 'flex-start',
        isolation: 'isolate',
        zIndex: 1,
        position: 'relative',
      }}
    >
      {/* ── Sticky viewport so canvas + text scroll together ─────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Canvas layer — dark bg guaranteed even before WebGL loads */}
        <div className="canvas-layer" style={{ background: '#000000' }}>
          {mounted && (
            <CosmicCanvas
              scrollProgress={scrollProgress}
              mousePos={mousePos}
            />
          )}
        </div>

        {/* Initial dark overlay (fades out on entrance) */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-void"
          style={{ zIndex: 1, pointerEvents: 'none' }}
        />

        {/* ── Vignette edges ──────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
          }}
        />

        {/* ── Content layer ───────────────────────────────────────────── */}
        <div
          className="content-layer absolute inset-0 flex flex-col"
          style={{ zIndex: 3 }}
        >
          {/* ── Top-left: cosmic clock ─────────────────────────────────── */}
          <div
            className="absolute font-mono-dm"
            style={{
              top: '2rem',
              left: '2.5rem',
              opacity: 0.35,
            }}
          >
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(240,240,240,0.5)', marginBottom: '0.3rem' }}>
              UNIVERSE AGE
            </div>
            <div
              ref={counterRef}
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                color: '#06b6d4',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              0.0
            </div>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.25em', color: 'rgba(240,240,240,0.3)', marginTop: '0.2rem' }}>
              BILLION YEARS
            </div>
          </div>

          {/* ── Top-right: coordinates ─────────────────────────────────── */}
          <div
            className="absolute font-mono-dm"
            style={{
              top: '2rem',
              right: '2.5rem',
              textAlign: 'right',
              opacity: 0.25,
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              lineHeight: 2,
              color: 'rgba(240,240,240,0.5)',
            }}
          >
            <div>RA  00h 00m 00s</div>
            <div>DEC +00° 00′ 00″</div>
            <div style={{ color: '#7c3aed', marginTop: '0.3rem' }}>◈ ORIGIN</div>
          </div>

          {/* ── Center content ─────────────────────────────────────────── */}
          <div
            className="flex flex-col items-center justify-center"
            style={{
              flex: 1,
              paddingTop: '4rem',
              perspective: '800px',
            }}
          >
            {/* Tagline */}
            <div
              ref={taglineRef}
              className="text-sub mb-8"
              style={{
                opacity: 0,
                color: 'rgba(240,240,240,0.4)',
                letterSpacing: '0.35em',
              }}
            >
              CHAPTER I
            </div>

            {/* Main headline */}
            <div
              ref={headlineRef}
              className="font-display text-center no-select"
              style={{
                fontSize: 'clamp(3.5rem, 11vw, 13rem)',
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
                perspective: '1000px',
              }}
            >
              {['IN THE', 'BEGIN-', 'NING'].map((word, i) => (
                <div
                  key={i}
                  className="word block"
                  style={{
                    opacity: 0,
                    display: 'block',
                    // Alternating indent for cinematic composition
                    paddingLeft: i === 1 ? '3vw' : i === 2 ? '8vw' : '0',
                    // Gradient on specific words
                    ...(i === 2 ? {
                      background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 60%, #f0f0f0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    } : {
                      color: '#f0f0f0',
                    }),
                  }}
                >
                  {word}
                </div>
              ))}
            </div>

            {/* Subline */}
            <div
              ref={sublineRef}
              className="font-serif text-center mt-10"
              style={{
                opacity: 0,
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                fontStyle: 'italic',
                color: 'rgba(240,240,240,0.5)',
                letterSpacing: '0.02em',
                maxWidth: '500px',
                lineHeight: 1.6,
              }}
            >
              Everything that exists emerged from a single
              <br />
              point of infinite density and infinite possibility.
            </div>

            {/* Glowing separator line */}
            <div
              style={{
                marginTop: '3rem',
                width: '1px',
                height: '40px',
                background: 'linear-gradient(to bottom, rgba(124,58,237,0.8), transparent)',
              }}
            />
          </div>

          {/* ── Bottom: scroll hint ────────────────────────────────────── */}
          <div
            ref={scrollHintRef}
            className="absolute bottom-8 left-1/2 flex flex-col items-center gap-3"
            style={{
              transform: 'translateX(-50%)',
              opacity: 0,
            }}
          >
            <span
              className="font-mono-dm"
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.3em',
                color: 'rgba(240,240,240,0.3)',
                textTransform: 'uppercase',
              }}
            >
              Scroll to continue
            </span>
            {/* Animated drop line */}
            <div style={{ width: '1px', height: '50px', overflow: 'hidden', position: 'relative' }}>
              <div className="scroll-line" style={{ position: 'absolute', inset: 0 }} />
            </div>
          </div>

          {/* ── Bottom-left: section label ─────────────────────────────── */}
          <div
            className="absolute font-mono-dm"
            style={{
              bottom: '2rem',
              left: '2.5rem',
              fontSize: '0.55rem',
              letterSpacing: '0.3em',
              color: 'rgba(240,240,240,0.2)',
              textTransform: 'uppercase',
            }}
          >
            THE EVOLUTION OF INTELLIGENCE — 01 / 06
          </div>

          {/* ── Bottom-right: particle count ──────────────────────────── */}
          <div
            className="absolute font-mono-dm"
            style={{
              bottom: '2rem',
              right: '2.5rem',
              fontSize: '0.55rem',
              letterSpacing: '0.25em',
              color: 'rgba(124,58,237,0.4)',
              textTransform: 'uppercase',
            }}
          >
            80,000 PARTICLES
          </div>
        </div>
      </div>
    </section>
  );
}
