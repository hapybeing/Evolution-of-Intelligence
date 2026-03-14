'use client';

import { useEffect, useRef, useState, Component, ReactNode } from 'react';

// ─── Error Boundary — prevents one broken canvas from crashing the whole page ─
interface ErrorBoundaryState { hasError: boolean; }
class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallbackBg?: string },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallbackBg?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          background: this.props.fallbackBg ?? '#000',
        }} />
      );
    }
    return this.props.children;
  }
}

// ─── LazyCanvas ───────────────────────────────────────────────────────────────
// Mounts children only when the trigger element is within `rootMargin` of
// the viewport. Unmounts when far away. Prevents simultaneous WebGL contexts.

interface LazyCanvasProps {
  children: ReactNode;
  /** Background color shown before canvas mounts */
  bg?: string;
  /** How far outside viewport to start mounting (default: 200px) */
  rootMargin?: string;
}

export default function LazyCanvas({
  children,
  bg = '#000000',
  rootMargin = '200px',
}: LazyCanvasProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={triggerRef} style={{ position: 'absolute', inset: 0, background: bg }}>
      {visible && (
        <CanvasErrorBoundary fallbackBg={bg}>
          {children}
        </CanvasErrorBoundary>
      )}
    </div>
  );
}
