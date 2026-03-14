'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

// ─── Nebula glow (large soft spheres of light) ────────────────────────────

function NebulaGlow() {
  const glows = useMemo(() => [
    { pos: [-2.5, 0.5, -2] as [number, number, number], color: '#7c3aed', size: 3.5, opacity: 0.06 },
    { pos: [2.0, -0.5, -3] as [number, number, number], color: '#06b6d4', size: 3.0, opacity: 0.05 },
    { pos: [0.0, 1.5, -4]  as [number, number, number], color: '#ec4899', size: 2.5, opacity: 0.04 },
  ], []);

  return (
    <>
      {glows.map((g, i) => (
        <mesh key={i} position={g.pos}>
          <sphereGeometry args={[g.size, 16, 16]} />
          <meshBasicMaterial
            color={g.color}
            transparent
            opacity={g.opacity}
            side={THREE.BackSide}
            depthWrite={false}
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
    <Canvas
      camera={{
        position: [0, 0, 8],
        fov: 60,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: false,   // Off for perf with 80k particles
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'transparent',
      }}
    >
      <NebulaGlow />
      <Particles
        count={80000}
        scrollProgress={scrollProgress}
        mousePos={mousePos}
      />
    </Canvas>
  );
}
