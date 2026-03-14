'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Epilogue() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const els = contentRef.current?.querySelectorAll('.ep-item');
      if (els?.length) {
        gsap.fromTo(els,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.14,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
          }
        );
      }

      gsap.fromTo(lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.4, ease: 'expo.out', transformOrigin: 'left center',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('gaurangk.inbox@gmail.com').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section
      ref={sectionRef}
      id="epilogue"
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 7,
        padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 6vw, 6rem)',
      }}
    >
      {/* Top gradient from Outro */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, insetInline: 0, height: '30vh',
        background: 'linear-gradient(to bottom, #000000, transparent)',
        pointerEvents: 'none',
      }} />

      <div
        ref={contentRef}
        style={{ maxWidth: '720px', width: '100%', position: 'relative', zIndex: 1 }}
      >
        {/* Expanding line */}
        <div ref={lineRef} className="ep-item" style={{
          height: '1px',
          background: 'linear-gradient(to right, #7c3aed, #06b6d4, transparent)',
          marginBottom: '3rem',
          transformOrigin: 'left center',
        }} />

        {/* Epilogue label */}
        <div className="ep-item font-mono-dm" style={{
          opacity: 0,
          fontSize: '0.6rem', letterSpacing: '0.4em',
          color: 'rgba(240,240,240,0.3)', textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}>
          Epilogue
        </div>

        {/* Main statement */}
        <h2 className="ep-item font-display" style={{
          opacity: 0,
          fontSize: 'clamp(1.8rem, 4vw, 3.8rem)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          color: '#f0f0f0',
          marginBottom: '2rem',
        }}>
          This story has no ending.
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            You are writing it now.
          </span>
        </h2>

        {/* Body */}
        <p className="ep-item font-serif" style={{
          opacity: 0,
          fontSize: 'clamp(0.9rem, 1.6vw, 1.15rem)',
          fontStyle: 'italic',
          color: 'rgba(240,240,240,0.35)',
          lineHeight: 1.85,
          maxWidth: '560px',
          marginBottom: '3.5rem',
        }}>
          Every generation inherits the intelligence of those before it and
          leaves something greater behind. The question is not what intelligence
          will become — but what you will do with yours.
        </p>

        {/* Divider */}
        <div className="ep-item" style={{
          opacity: 0,
          height: '1px',
          background: 'rgba(240,240,240,0.06)',
          marginBottom: '3rem',
        }} />

        {/* Contact */}
        <div className="ep-item" style={{ opacity: 0 }}>
          <div className="font-mono-dm" style={{
            fontSize: '0.55rem', letterSpacing: '0.35em',
            color: 'rgba(240,240,240,0.25)', textTransform: 'uppercase',
            marginBottom: '0.8rem',
          }}>
            Built by Gaurang — reach out
          </div>

          <button
            onClick={handleCopy}
            data-cursor="hover"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.7rem',
              padding: '0.7rem 1.4rem',
              border: '1px solid rgba(124,58,237,0.35)',
              borderRadius: '100px',
              background: 'rgba(124,58,237,0.08)',
              cursor: 'none',
              transition: 'all 0.3s ease',
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: copied ? '#10b981' : 'rgba(240,240,240,0.7)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.7)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.35)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.08)';
            }}
          >
            <span style={{ fontSize: '0.8rem' }}>{copied ? '✓' : '◈'}</span>
            {copied ? 'Copied!' : 'gaurangk.inbox@gmail.com'}
          </button>
        </div>

        {/* Bottom signature */}
        <div className="ep-item font-mono-dm" style={{
          opacity: 0,
          marginTop: '4rem',
          fontSize: '0.5rem',
          letterSpacing: '0.3em',
          color: 'rgba(240,240,240,0.12)',
          textTransform: 'uppercase',
          lineHeight: 2.5,
        }}>
          <div>The Evolution of Intelligence</div>
          <div>An Interactive Digital Experience</div>
          <div style={{ color: 'rgba(124,58,237,0.3)', marginTop: '0.3rem' }}>
            ◈ Built with Three.js · GSAP · Next.js
          </div>
        </div>
      </div>
    </section>
  );
}
