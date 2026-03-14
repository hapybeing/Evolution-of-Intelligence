'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import LazyCanvas from '@/components/core/LazyCanvas';

// ─── Inline GLSL — avoids raw-loader/Vercel build issues entirely ─────────

const VERTEX_SHADER = /* glsl */`
  uniform float uTime;
  uniform float uScroll;
  uniform float uMorphProgress;
  uniform vec2  uMouse;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aRandom;
  attribute vec3  aCosmicPos;
  attribute vec3  aChaosPos;

  varying float vAlpha;
  varying vec3  vColor;
  varying float vRandom;

  // Simplex-style hash noise
  vec3 hash3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.xxy + p.yzz) * p.zyx);
  }

  void main() {
    vRandom = aRandom;

    // Blend between chaos and cosmic formation
    float morph = smoothstep(0.0, 1.0, uMorphProgress);
    vec3 pos = mix(aChaosPos, aCosmicPos, morph);

    // Subtle time-based drift
    float drift = aRandom * 6.28318;
    pos.x += sin(uTime * 0.3 + drift) * 0.08 * (1.0 - morph * 0.6);
    pos.y += cos(uTime * 0.2 + drift * 1.3) * 0.08 * (1.0 - morph * 0.6);
    pos.z += sin(uTime * 0.25 + drift * 0.7) * 0.06;

    // Mouse parallax (subtle depth shift)
    pos.x += uMouse.x * (0.3 + aRandom * 0.4) * (pos.z * 0.1 + 0.5);
    pos.y -= uMouse.y * (0.3 + aRandom * 0.4) * (pos.z * 0.1 + 0.5);

    // Scroll: implode particles toward origin then re-expand
    float scrollPull = uScroll * 2.5;
    pos *= max(0.0, 1.0 - scrollPull * 0.4);
    pos.z -= uScroll * 3.0;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

    // Size — depth-scaled, with scroll reactivity
    float sz = aSize * (1.0 + uScroll * 0.8);
    gl_PointSize = sz * uPixelRatio * (300.0 / -mvPos.z);
    gl_PointSize = clamp(gl_PointSize, 0.5, 12.0);

    gl_Position = projectionMatrix * mvPos;

    // Color gradient: violet → cyan → white based on position
    float t = (pos.y + 4.0) / 8.0;
    vColor = mix(
      mix(vec3(0.486, 0.227, 0.929), vec3(0.024, 0.714, 0.831), t),
      vec3(0.94, 0.94, 0.94),
      smoothstep(0.6, 1.0, t)
    );

    // Alpha: fade far particles, pulse with time
    float pulse = 0.85 + 0.15 * sin(uTime * 1.2 + aRandom * 6.28);
    vAlpha = pulse * (0.4 + 0.6 * morph) * smoothstep(0.0, 1.0, (pos.z + 6.0) / 12.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */`
  varying float vAlpha;
  varying vec3  vColor;
  varying float vRandom;

  void main() {
    // Soft circular point sprite
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Glow falloff
    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;

    // Occasional bright core
    float core = smoothstep(0.15, 0.0, dist) * 0.6 * vRandom;

    gl_FragColor = vec4(vColor + core, alpha);
  }
`;

// ─── Particle System ─────────────────────────────────────────────────────────

interface ParticlesProps {
  count?: number;
  scrollProgress: React.MutableRefObject<number>;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
}

function Particles({ count = 80000, scrollProgress, mousePos }: ParticlesProps) {
  const meshRef     = useRef<THREE.Points>(null);
  const morphRef    = useRef(0);
  const { size }    = useThree();

  // ── Generate particle positions once ──────────────────────────────────
  const { cosmicPositions, chaosPositions, sizes, randoms } = useMemo(() => {
    const cosmicPos = new Float32Array(count * 3);
    const chaosPos  = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);
    const randoms   = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // ── Cosmic: layered galaxy/nebula structure ──────────────────────
      const layer = Math.random();

      if (layer < 0.55) {
        // Spiral arms
        const arm    = Math.floor(Math.random() * 3);
        const radius = Math.pow(Math.random(), 0.5) * 5.5;
        const angle  = (arm / 3) * Math.PI * 2 + radius * 0.6 + Math.random() * 0.4;
        const spread = (1.0 - radius / 5.5) * 0.6 + 0.1;
        cosmicPos[i3]     = Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
        cosmicPos[i3 + 1] = (Math.random() - 0.5) * spread * 0.4;
        cosmicPos[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread;
      } else if (layer < 0.75) {
        // Outer halo / cloud
        const r   = 4.0 + Math.random() * 3.0;
        const phi = Math.acos(2 * Math.random() - 1);
        const th  = Math.random() * Math.PI * 2;
        cosmicPos[i3]     = r * Math.sin(phi) * Math.cos(th);
        cosmicPos[i3 + 1] = r * Math.cos(phi) * 0.35;
        cosmicPos[i3 + 2] = r * Math.sin(phi) * Math.sin(th);
      } else {
        // Background star field
        const r   = 6.0 + Math.random() * 6.0;
        const phi = Math.acos(2 * Math.random() - 1);
        const th  = Math.random() * Math.PI * 2;
        cosmicPos[i3]     = r * Math.sin(phi) * Math.cos(th);
        cosmicPos[i3 + 1] = r * Math.cos(phi);
        cosmicPos[i3 + 2] = r * Math.sin(phi) * Math.sin(th);
      }

      // ── Chaos: pure random scatter ───────────────────────────────────
      const cr = 8.0 + Math.random() * 6.0;
      const cp = Math.acos(2 * Math.random() - 1);
      const ct = Math.random() * Math.PI * 2;
      chaosPos[i3]     = cr * Math.sin(cp) * Math.cos(ct);
      chaosPos[i3 + 1] = cr * Math.cos(cp);
      chaosPos[i3 + 2] = cr * Math.sin(cp) * Math.sin(ct);

      sizes[i]   = 0.5 + Math.random() * 2.5;
      randoms[i] = Math.random();
    }

    return {
      cosmicPositions: cosmicPos,
      chaosPositions:  chaosPos,
      sizes,
      randoms,
    };
  }, [count]);

  // ── Shader material with uniforms ─────────────────────────────────────
  const uniforms = useMemo(() => ({
    uTime:          { value: 0 },
    uScroll:        { value: 0 },
    uMorphProgress: { value: 0 },
    uMouse:         { value: new THREE.Vector2(0, 0) },
    uPixelRatio:    { value: Math.min(window.devicePixelRatio, 2) },
  }), []);

  // ── Animation loop ────────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    uniforms.uTime.value += delta;
    uniforms.uScroll.value = scrollProgress.current;

    // Smooth morph: chaos → cosmos over 2 seconds
    morphRef.current = Math.min(1, morphRef.current + delta * 0.45);
    uniforms.uMorphProgress.value = morphRef.current;

    // Lerp mouse
    const target = mousePos.current;
    const cur    = uniforms.uMouse.value;
    cur.x += (target.x - cur.x) * 0.05;
    cur.y += (target.y - cur.y) * 0.05;

    // Slow rotation
    meshRef.current.rotation.y += delta * 0.015;
    meshRef.current.rotation.x += delta * 0.004;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[chaosPositions, 3]}
        />
        <bufferAttribute
          attach="attributes-aCosmicPos"
          args={[cosmicPositions, 3]}
        />
        <bufferAttribute
          attach="attributes-aChaosPos"
          args={[chaosPositions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          args={[randoms, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={false}
      />
    </points>
  );
}

// ─── Nebula glow (sprite-based soft light blooms — no geometry artifacts) ────

const NEBULA_VERT = /* glsl */`
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NEBULA_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform vec2  uResolution;
  uniform vec3  uCenter;
  uniform mat4  uModelViewMatrix;
  uniform mat4  uProjectionMatrix;
  uniform float uRadius;
  uniform float uOpacity;

  void main() {
    // Soft radial gradient in screen space
    vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
    // Project center to NDC
    vec4 clip = uProjectionMatrix * uModelViewMatrix * vec4(uCenter, 1.0);
    vec2 centerNDC = clip.xy / clip.w;
    float aspect = uResolution.x / uResolution.y;
    vec2 diff = (uv - centerNDC) * vec2(aspect, 1.0);
    float dist = length(diff);
    float falloff = 1.0 - smoothstep(0.0, uRadius, dist);
    falloff = pow(falloff, 3.0);
    gl_FragColor = vec4(uColor, falloff * uOpacity);
  }
`;

function NebulaGlow() {
  // Use simple additive point lights via large transparent planes
  const glows = useMemo(() => [
    { pos: [-3.0, 1.0, -5] as [number, number, number], color: new THREE.Color('#7c3aed'), size: 12, opacity: 0.18 },
    { pos: [ 3.5,-1.0, -6] as [number, number, number], color: new THREE.Color('#06b6d4'), size: 10, opacity: 0.14 },
    { pos: [ 0.0, 2.0, -7] as [number, number, number], color: new THREE.Color('#ec4899'), size: 8,  opacity: 0.10 },
  ], []);

  return (
    <>
      {glows.map((g, i) => (
        <mesh key={i} position={g.pos} renderOrder={-1}>
          <planeGeometry args={[g.size, g.size]} />
          <meshBasicMaterial
            color={g.color}
            transparent
            opacity={g.opacity}
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Main exported canvas component ──────────────────────────────────────────

interface CosmicCanvasProps {
  scrollProgress: React.MutableRefObject<number>;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
}

export default function CosmicCanvas({ scrollProgress, mousePos }: CosmicCanvasProps) {
  return (
    <LazyCanvas bg="#000000" rootMargin="300px">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', inset: 0, background: '#000000' }}
      >
        <NebulaGlow />
        <Particles count={80000} scrollProgress={scrollProgress} mousePos={mousePos} />
      </Canvas>
    </LazyCanvas>
  );
}
