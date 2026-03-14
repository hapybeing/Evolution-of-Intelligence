'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function AmbientAudio() {
  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const btnRef       = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const hasStarted   = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create audio element
    const audio = new Audio('/bgm.mp3');
    audio.loop   = true;
    audio.volume = 0;
    audioRef.current = audio;

    // Show button after a short delay
    const timer = setTimeout(() => setVisible(true), 2000);

    // Auto-attempt play on first user interaction
    const onFirstInteraction = () => {
      if (hasStarted.current) return;
      hasStarted.current = true;
      audio.play().then(() => {
        setPlaying(true);
        gsap.to(audio, { volume: 0.35, duration: 3 });
      }).catch(() => {
        // Browser blocked autoplay — user must click the button
      });
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('scroll', onFirstInteraction);
    };

    window.addEventListener('click', onFirstInteraction, { once: true });
    window.addEventListener('touchstart', onFirstInteraction, { once: true });
    window.addEventListener('scroll', onFirstInteraction, { once: true, passive: true });

    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.src = '';
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('scroll', onFirstInteraction);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      gsap.to(audio, {
        volume: 0,
        duration: 1.5,
        onComplete: () => audio.pause(),
      });
      setPlaying(false);
    } else {
      audio.play();
      gsap.to(audio, { volume: 0.35, duration: 1.5 });
      setPlaying(true);
    }
  };

  // Fade button in
  useEffect(() => {
    if (!visible || !btnRef.current) return;
    gsap.fromTo(btnRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }
    );
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={btnRef}
      onClick={toggle}
      data-cursor="hover"
      style={{
        position: 'fixed',
        bottom: '1.8rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.9rem',
        border: '1px solid rgba(240,240,240,0.12)',
        borderRadius: '100px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        cursor: 'none',
        userSelect: 'none',
        opacity: 0,
        transition: 'border-color 0.3s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(240,240,240,0.3)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(240,240,240,0.12)')}
    >
      {/* Animated bars when playing */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '12px' }}>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              width: '2px',
              borderRadius: '1px',
              background: playing ? '#7c3aed' : 'rgba(240,240,240,0.3)',
              height: playing ? `${4 + i * 3}px` : '4px',
              animation: playing ? `audioBar${i} ${0.5 + i * 0.15}s ease-in-out infinite alternate` : 'none',
              transition: 'background 0.3s ease, height 0.3s ease',
            }}
          />
        ))}
      </div>

      <span style={{
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '0.55rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: playing ? 'rgba(240,240,240,0.7)' : 'rgba(240,240,240,0.3)',
        transition: 'color 0.3s ease',
      }}>
        {playing ? 'AMBIENT' : 'MUTED'}
      </span>

      <style>{`
        @keyframes audioBar1 { 0% { height: 4px; } 100% { height: 10px; } }
        @keyframes audioBar2 { 0% { height: 7px; } 100% { height: 4px;  } }
        @keyframes audioBar3 { 0% { height: 4px; } 100% { height: 12px; } }
      `}</style>
    </div>
  );
}
