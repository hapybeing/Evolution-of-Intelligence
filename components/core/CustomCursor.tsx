'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth  / 2;
    let mouseY = window.innerHeight / 2;
    let ringX  = mouseX;
    let ringY  = mouseY;
    let rafId: number;

    // ── Fast dot follows cursor exactly ──────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(dot, { x: mouseX, y: mouseY });
    };

    // ── Lagging ring with lerp ────────────────────────────────────────────
    const animate = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      gsap.set(ring, { x: ringX, y: ringY });
      rafId = requestAnimationFrame(animate);
    };

    // ── Hover states ──────────────────────────────────────────────────────
    const onEnterLink = () => {
      gsap.to(ring, {
        width: 56,
        height: 56,
        borderColor: 'rgba(124, 58, 237, 0.9)',
        duration: 0.35,
        ease: 'expo.out',
      });
      gsap.to(dot, {
        scale: 0,
        duration: 0.2,
        ease: 'expo.out',
      });
    };

    const onLeaveLink = () => {
      gsap.to(ring, {
        width: 36,
        height: 36,
        borderColor: 'rgba(240, 240, 240, 0.5)',
        duration: 0.35,
        ease: 'expo.out',
      });
      gsap.to(dot, {
        scale: 1,
        duration: 0.2,
        ease: 'expo.out',
      });
    };

    const onMouseDown = () => {
      gsap.to(ring, { scale: 0.85, duration: 0.15 });
    };

    const onMouseUp = () => {
      gsap.to(ring, { scale: 1, duration: 0.25, ease: 'back.out' });
    };

    // Show cursor on first move (hidden by default to prevent flash)
    const onFirstMove = () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.4 });
      window.removeEventListener('mousemove', onFirstMove);
    };

    // ── Delegate hover to all interactive elements ────────────────────────
    const addHoverListeners = () => {
      document.querySelectorAll('a, button, [data-cursor="hover"]').forEach(el => {
        el.addEventListener('mouseenter', onEnterLink);
        el.addEventListener('mouseleave', onLeaveLink);
      });
    };

    // MutationObserver to catch dynamically added elements
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    // ── Init ──────────────────────────────────────────────────────────────
    gsap.set([dot, ring], { opacity: 0, xPercent: -50, yPercent: -50 });
    window.addEventListener('mousemove', onFirstMove);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    addHoverListeners();
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onFirstMove);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Fast dot */}
      <div
        ref={dotRef}
        className="cursor-dot"
        aria-hidden="true"
        style={{ opacity: 0 }}
      />
      {/* Lagging ring */}
      <div
        ref={ringRef}
        className="cursor-ring"
        aria-hidden="true"
        style={{ opacity: 0 }}
      />
    </>
  );
}
