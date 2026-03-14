'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface TransitionPanelProps {
  /** Large pull-quote or statement */
  statement: string;
  /** Small label above the statement */
  label: string;
  /** Highlighted word/phrase within statement — wrapped in accent color */
  accent?: string;
  /** Bottom annotation */
  annotation?: string;
  /** Accent color hex */
  color?: string;
  /** Background color */
  bg?: string;
  /** Chapter number shown large in background */
  chapter?: string;
}

export default function TransitionPanel({
  statement,
  label,
  accent,
  annotation,
  color = '#7c3aed',
  bg = '#000000',
  chapter,
}: TransitionPanelProps) {
  const panelRef     = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const labelRef     = useRef<HTMLDivElement>(null);
  const lineRef      = useRef<HTMLDivElement>(null);
  const annotRef     = useRef<HTMLDivElement>(null);
  const chapterRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;

    const ctx = gsap.context(() => {
      // Chapter number drifts up
      if (chapterRef.current) {
        gsap.fromTo(chapterRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out',
            scrollTrigger: { trigger: panelRef.current, start: 'top 80%' } }
        );
      }

      // Label
      gsap.fromTo(labelRef.current,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'expo.out',
          scrollTrigger: { trigger: panelRef.current, start: 'top 72%' } }
      );

      // Line expands
      gsap.fromTo(lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.0, ease: 'expo.out', transformOrigin: 'left center',
          scrollTrigger: { trigger: panelRef.current, start: 'top 70%' } }
      );

      // Statement words stagger
      const words = statementRef.current?.querySelectorAll('.tp-word');
      if (words?.length) {
        gsap.fromTo(words,
          { opacity: 0, y: 50, rotateX: -25 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1.0, ease: 'expo.out', stagger: 0.04,
            scrollTrigger: { trigger: panelRef.current, start: 'top 65%' } }
        );
      }

      // Annotation
      if (annotRef.current) {
        gsap.fromTo(annotRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
            scrollTrigger: { trigger: panelRef.current, start: 'top 55%' } }
        );
      }
    }, panelRef);

    return () => ctx.revert();
  }, []);

  // Split statement into words, highlighting the accent phrase
  const renderStatement = () => {
    if (!accent) {
      return statement.split(' ').map((word, i) => (
        <span key={i} className="tp-word"
          style={{ opacity: 0, display: 'inline-block', marginRight: '0.28em' }}>
          {word}
        </span>
      ));
    }

    const parts = statement.split(accent);
    return parts.map((part, i) => (
      <span key={i}>
        {part.split(' ').filter(Boolean).map((word, j) => (
          <span key={j} className="tp-word"
            style={{ opacity: 0, display: 'inline-block', marginRight: '0.28em' }}>
            {word}
          </span>
        ))}
        {i < parts.length - 1 && (
          <span className="tp-word"
            style={{
              opacity: 0,
              display: 'inline-block',
              marginRight: '0.28em',
              color,
              textShadow: `0 0 30px ${color}80`,
            }}>
            {accent}
          </span>
        )}
      </span>
    ));
  };

  return (
    <div
      ref={panelRef}
      style={{
        width: '100%',
        minHeight: '50vh',
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(2rem, 5vw, 5rem) clamp(1.5rem, 6vw, 8rem)',
      }}
    >
      {/* Oversized chapter number in background */}
      {chapter && (
        <div
          ref={chapterRef}
          className="font-display absolute no-select pointer-events-none"
          style={{
            opacity: 0,
            fontSize: 'clamp(8rem, 25vw, 22rem)',
            fontWeight: 800,
            letterSpacing: '-0.06em',
            color: 'transparent',
            WebkitTextStroke: `1px ${color}18`,
            right: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            lineHeight: 1,
            userSelect: 'none',
            overflow: 'hidden',
            maxWidth: '45vw',
          }}
        >
          {chapter}
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', width: '100%' }}>

        {/* Label + line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div
            ref={labelRef}
            className="font-mono-dm"
            style={{
              opacity: 0,
              fontSize: '0.6rem',
              letterSpacing: '0.35em',
              color: `${color}`,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
          <div
            ref={lineRef}
            style={{
              flex: 1,
              height: '1px',
              background: `linear-gradient(to right, ${color}60, transparent)`,
              transformOrigin: 'left center',
            }}
          />
        </div>

        {/* Statement */}
        <div
          ref={statementRef}
          className="font-display"
          style={{
            fontSize: 'clamp(2rem, 5.5vw, 5.5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'rgba(240,240,240,0.88)',
            perspective: '600px',
          }}
        >
          {renderStatement()}
        </div>

        {/* Annotation */}
        {annotation && (
          <div
            ref={annotRef}
            className="font-serif mt-8"
            style={{
              opacity: 0,
              fontSize: 'clamp(0.85rem, 1.6vw, 1.1rem)',
              fontStyle: 'italic',
              color: 'rgba(240,240,240,0.3)',
              lineHeight: 1.7,
              maxWidth: '560px',
            }}
          >
            {annotation}
          </div>
        )}

      </div>

      {/* Bottom gradient fade to next section */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: `linear-gradient(to bottom, transparent, ${bg})`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
