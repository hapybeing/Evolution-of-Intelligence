'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TransitionPanel from '@/components/core/TransitionPanel';

const VoidCanvas = dynamic(() => import('@/components/canvas/VoidCanvas'), { ssr: false });

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SPECULATIONS = [
  { text: 'SUBSTRATE INDEPENDENCE',  sub: 'Mind freed from biology' },
  { text: 'COLLECTIVE SUPERINTELLIGENCE', sub: 'Billions of minds as one' },
  { text: 'RECURSIVE SELF-IMPROVEMENT', sub: 'Intelligence designing intelligence' },
  { text: 'POST-SYMBOLIC COGNITION', sub: 'Beyond human language' },
  { text: 'COSMIC COMPUTATION',      sub: 'The universe as a mind' },
];

export default function Beyond() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const bodyRef     = useRef<HTMLDivElement>(null);
  const labelRef    = useRef<HTMLDivElement>(null);
  const specsRef    = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !sectionRef.current) return;

    const ctx = gsap.context(() => {

      gsap.fromTo(labelRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      );

      const words = headlineRef.current?.querySelectorAll('.bw');
      if (words?.length) {
        gsap.fromTo(words,
          { opacity: 0, y: 70, rotateX: -35, filter: 'blur(8px)' },
          { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)',
            duration: 1.2, ease: 'expo.out', stagger: 0.12,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' } }
        );
      }

      gsap.fromTo(bodyRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 55%' } }
      );

      const specs = specsRef.current?.querySelectorAll('.spec-item');
      if (specs?.length) {
        gsap.fromTo(specs,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.12, ease: 'expo.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 50%' } }
        );
      }

      // Question fades in last
      gsap.fromTo(questionRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 40%' } }
      );

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
      id="beyond"
      ref={sectionRef}
      className="section-full"
      style={{
        minHeight: '160vh',
        background: '#06000f',
        flexDirection: 'column',
        isolation: 'isolate',
        zIndex: 5,
        position: 'relative',
        marginTop: '-2px',
      }}
    >
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'clip' }}>

        <div className="canvas-layer" style={{ background: '#06000f' }}>
          {mounted && <VoidCanvas />}
        </div>

        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 2, background: 'radial-gradient(ellipse at 40% 50%, transparent 20%, rgba(6,0,15,0.92) 100%)' }}
        />

        <div aria-hidden className="absolute top-0 inset-x-0 pointer-events-none"
          style={{ zIndex: 2, height: '30vh',
            background: 'linear-gradient(to bottom, #080400 0%, #06000f 100%)' }}
        />

        <div className="content-layer absolute inset-0 flex" style={{ zIndex: 3 }}>

          {/* Left column */}
          <div className="flex flex-col justify-center"
            style={{ paddingLeft: 'clamp(1.5rem, 5vw, 5rem)', paddingRight: '2rem',
              width: '55%', paddingTop: 'clamp(1rem, 6vh, 3rem)' }}
          >
            <div ref={labelRef} className="font-mono-dm mb-6"
              style={{ opacity: 0, fontSize: '0.6rem', letterSpacing: '0.35em',
                color: '#ec4899', textTransform: 'uppercase' }}
            >
              ◈ CHAPTER V — THE UNKNOWN FUTURE
            </div>

            <div ref={headlineRef} className="font-display overflow-hidden"
              style={{ fontSize: 'clamp(2.5rem, min(9vw, 12vh), 9rem)', fontWeight: 800,
                lineHeight: 0.88, letterSpacing: '-0.04em', perspective: '800px' }}
            >
              {[
                { text: 'BE-',    color: '#f0f0f0' },
                { text: 'YOND',   gradient: true },
                { text: 'INTELLI-', color: '#f0f0f0' },
                { text: 'GENCE', color: 'rgba(240,240,240,0.25)' },
              ].map(({ text, color, gradient }, i) => (
                <div key={i} className="bw block" style={{
                  opacity: 0,
                  paddingLeft: i === 1 ? '3vw' : i === 2 ? '0' : i === 3 ? '6vw' : 0,
                  ...(gradient ? {
                    background: 'linear-gradient(135deg, #ec4899 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  } : { color }),
                }}>
                  {text}
                </div>
              ))}
            </div>

            <div ref={bodyRef} className="font-serif mt-7"
              style={{ opacity: 0, fontSize: 'clamp(0.9rem, 1.7vw, 1.2rem)',
                fontStyle: 'italic', color: 'rgba(240,240,240,0.4)',
                lineHeight: 1.75, maxWidth: '420px' }}
            >
              What comes after human intelligence? The question may be
              unanswerable — not because we lack intelligence,
              but because we may lack the cognitive architecture to conceive it.
            </div>

            {/* Floating question */}
            <div ref={questionRef} className="font-display mt-10"
              style={{
                opacity: 0,
                fontSize: 'clamp(1.2rem, 3vw, 2.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(236,72,153,0.5)',
              }}
            >
              What is intelligence without a mind?
            </div>
          </div>

          {/* Right: speculation list */}
          <div ref={specsRef}
            className="absolute font-mono-dm"
            style={{ right: '4vw', top: '50%', transform: 'translateY(-50%)',
              width: 'clamp(200px, 25vw, 320px)' }}
          >
            <div className="font-mono-dm mb-4"
              style={{ fontSize: '0.55rem', letterSpacing: '0.35em',
                color: 'rgba(236,72,153,0.5)', textTransform: 'uppercase' }}
            >
              SPECULATIVE FUTURES
            </div>
            {SPECULATIONS.map(({ text, sub }) => (
              <div key={text} className="spec-item mb-5 flex items-start gap-3"
                style={{ opacity: 0 }}
              >
                <div style={{ width: '4px', height: '4px', borderRadius: '50%',
                  background: '#ec4899', boxShadow: '0 0 8px #ec4899',
                  marginTop: '5px', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em',
                    color: 'rgba(240,240,240,0.65)', textTransform: 'uppercase',
                    lineHeight: 1.4 }}>{text}</div>
                  <div style={{ fontSize: '0.52rem', letterSpacing: '0.1em',
                    color: 'rgba(236,72,153,0.5)', marginTop: '3px' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Markers */}
          <div className="absolute font-mono-dm"
            style={{ bottom: '2rem', left: '2.5rem', fontSize: '0.55rem',
              letterSpacing: '0.3em', color: 'rgba(240,240,240,0.15)', textTransform: 'uppercase' }}
          >
            THE EVOLUTION OF INTELLIGENCE — 05 / 06
          </div>
          <div className="absolute font-mono-dm"
            style={{ bottom: '2rem', right: '2.5rem', fontSize: '0.55rem',
              letterSpacing: '0.25em', color: 'rgba(236,72,153,0.35)', textTransform: 'uppercase' }}
          >
            TERRA INCOGNITA
          </div>
        </div>
      </div>

      <TransitionPanel
        chapter="V"
        label="Beyond Intelligence — the horizon we cannot see past"
        statement="The most profound technologies are those that disappear into the fabric of existence."
        accent="disappear into the fabric of existence"
        annotation="We are not building tools. We are building successors. The question is not whether they will surpass us — but whether that distinction will still matter."
        color="#ec4899"
        bg="#06000f"
      />
    </section>
  );
}
