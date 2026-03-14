'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const SECTIONS = [
  { id: 'hero',      label: 'Cosmic Birth',    color: '#7c3aed' },
  { id: 'life',      label: 'Life Emerges',    color: '#10b981' },
  { id: 'human',     label: 'Human Mind',      color: '#06b6d4' },
  { id: 'ai',        label: 'Artificial Mind', color: '#f59e0b' },
  { id: 'beyond',    label: 'Beyond',          color: '#ec4899' },
  { id: 'outro',     label: 'The Unknown',     color: '#f0f0f0' },
];

interface NavigationProps {
  visible?: boolean;
}

export default function Navigation({ visible = true }: NavigationProps) {
  const navRef    = useRef<HTMLElement>(null);
  const [active, setActive]     = useState(0);
  const [hovered, setHovered]   = useState<number | null>(null);
  const [labelVisible, setLabelVisible] = useState(false);

  // ── Track which section is in view ───────────────────────────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }, i) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(i);
        },
        { threshold: 0.4 }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  // ── Fade nav in after loader ──────────────────────────────────────────────
  useEffect(() => {
    if (!navRef.current) return;
    gsap.to(navRef.current, {
      opacity: visible ? 1 : 0,
      x:       visible ? 0 : 10,
      duration: 0.6,
      ease: 'expo.out',
    });
  }, [visible]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      ref={navRef}
      className="fixed right-6 top-1/2 z-[var(--z-nav)] flex flex-col items-center gap-4"
      style={{
        transform: 'translateY(-50%)',
        opacity: 0,
      }}
      aria-label="Section navigation"
    >
      {SECTIONS.map(({ id, label, color }, i) => {
        const isActive  = active === i;
        const isHovered = hovered === i;

        return (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            onMouseEnter={() => { setHovered(i); setLabelVisible(true); }}
            onMouseLeave={() => { setHovered(null); setLabelVisible(false); }}
            aria-label={`Go to ${label}`}
            data-cursor="hover"
            className="relative flex items-center justify-end gap-3 group"
            style={{ background: 'none', border: 'none', cursor: 'none', padding: '4px 0' }}
          >
            {/* Label (appears on hover) */}
            <span
              className="font-mono-dm text-ghost whitespace-nowrap"
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                opacity: isHovered ? 0.7 : 0,
                transform: `translateX(${isHovered ? '0px' : '8px'})`,
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                pointerEvents: 'none',
              }}
            >
              {label}
            </span>

            {/* Dot */}
            <div
              style={{
                width:         isActive  ? '10px' : isHovered ? '8px' : '5px',
                height:        isActive  ? '10px' : isHovered ? '8px' : '5px',
                borderRadius:  '50%',
                backgroundColor: isActive || isHovered ? color : 'rgba(240,240,240,0.25)',
                boxShadow:     isActive
                  ? `0 0 10px ${color}, 0 0 20px ${color}60`
                  : 'none',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </button>
        );
      })}

      {/* Vertical connector line */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-[6px] w-px"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(240,240,240,0.08), transparent)',
          zIndex: -1,
        }}
      />
    </nav>
  );
}
