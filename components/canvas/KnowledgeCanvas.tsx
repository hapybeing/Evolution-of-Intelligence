'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── GLSL ─────────────────────────────────────────────────────────────────────

const NODE_VERT = /* glsl */`
  uniform float uTime;
  attribute float aPhase;
  attribute float aSize;
  varying float   vPulse;
  varying float   vPhase;

  void main() {
    vPhase = aPhase;
    vPulse = 0.7 + 0.3 * sin(uTime * 1.8 + aPhase);

    vec4 mvPos     = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize   = aSize * vPulse * (280.0 / -mvPos.z);
    gl_PointSize   = clamp(gl_PointSize, 2.0, 18.0);
    gl_Position    = projectionMatrix * mvPos;
  }
`;

const NODE_FRAG = /* glsl */`
  varying float vPulse;
  varying float vPhase;
  uniform vec3  uColorA;
  uniform vec3  uColorB;

  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    float core  = smoothstep(0.5, 0.0, dist);
    float glow  = smoothstep(0.5, 0.1, dist) * 0.4;
    float t     = fract(vPhase / 6.28318);
    vec3  color = mix(uColorA, uColorB, t);

    gl_FragColor = vec4(color, (core + glow) * vPulse);
  }
`;

const EDGE_VERT = /* glsl */`
  uniform float uTime;
  attribute float aEdgePhase;
  varying float   vAlpha;

  void main() {
    vAlpha      = 0.15 + 0.1 * sin(uTime * 0.8 + aEdgePhase);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EDGE_FRAG = /* glsl */`
  varying float vAlpha;
  uniform vec3  uColor;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;

// Data stream particles traveling along edges
const STREAM_VERT = /* glsl */`
  uniform float uTime;
  attribute float aSpeed;
  attribute float aOffset;
  attribute float aSize;
  varying float   vAlpha;

  void main() {
    // Stream particles ping-pong along their path using time
    float t      = fract(uTime * aSpeed + aOffset);
    vAlpha       = sin(t * 3.14159) * 0.9;

    vec4 mvPos   = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (200.0 / -mvPos.z);
    gl_PointSize = clamp(gl_PointSize, 1.5, 8.0);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const STREAM_FRAG = /* glsl */`
  varying float vAlpha;
  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;
    gl_FragColor = vec4(0.984, 0.620, 0.043, smoothstep(0.5, 0.0, dist) * vAlpha);
  }
`;

// ─── Knowledge graph data ─────────────────────────────────────────────────────

const CONCEPTS = [
  // Core central node
  { id: 0, label: 'CONSCIOUSNESS', pos: [0, 0, 0] as [number,number,number], size: 5.0 },
  // Inner ring
  { id: 1,  label: 'LANGUAGE',     pos: [-2.2,  0.8, -0.5] as [number,number,number], size: 3.5 },
  { id: 2,  label: 'MATHEMATICS',  pos: [ 2.0,  1.0, -0.3] as [number,number,number], size: 3.5 },
  { id: 3,  label: 'ART',          pos: [-1.8, -1.2,  0.2] as [number,number,number], size: 3.0 },
  { id: 4,  label: 'SCIENCE',      pos: [ 2.2, -0.8,  0.4] as [number,number,number], size: 3.0 },
  { id: 5,  label: 'PHILOSOPHY',   pos: [ 0.2,  2.2, -0.3] as [number,number,number], size: 2.8 },
  { id: 6,  label: 'MEMORY',       pos: [ 0.3, -2.3,  0.5] as [number,number,number], size: 2.8 },
  // Outer ring
  { id: 7,  label: 'TOOL USE',     pos: [-3.5,  1.5, -1.0] as [number,number,number], size: 2.0 },
  { id: 8,  label: 'CULTURE',      pos: [-3.2, -0.5,  0.8] as [number,number,number], size: 2.0 },
  { id: 9,  label: 'WRITING',      pos: [ 3.4,  1.2, -0.8] as [number,number,number], size: 2.0 },
  { id: 10, label: 'NUMBERS',      pos: [ 3.5, -1.0,  0.6] as [number,number,number], size: 2.0 },
  { id: 11, label: 'MUSIC',        pos: [-1.0,  3.4, -0.5] as [number,number,number], size: 1.8 },
  { id: 12, label: 'MYTH',         pos: [ 1.2,  3.2,  0.4] as [number,number,number], size: 1.8 },
  { id: 13, label: 'EMOTION',      pos: [-1.2, -3.3,  0.3] as [number,number,number], size: 1.8 },
  { id: 14, label: 'REASON',       pos: [ 1.4, -3.1, -0.6] as [number,number,number], size: 1.8 },
];

const EDGES = [
  [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
  [1,7],[1,8],[1,3],[1,5],
  [2,9],[2,10],[2,4],[2,5],
  [3,8],[3,11],[3,13],
  [4,9],[4,10],[4,14],
  [5,11],[5,12],[5,14],
  [6,13],[6,14],[6,8],
  [7,8],[9,10],[11,12],[13,14],
];

// ─── Graph nodes ──────────────────────────────────────────────────────────────

function GraphNodes() {
  const ref      = useRef<THREE.Points>(null);
  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uColorA: { value: new THREE.Color('#06b6d4') },
    uColorB: { value: new THREE.Color('#f59e0b') },
  }), []);

  const { positions, phases, sizes } = useMemo(() => {
    const positions = new Float32Array(CONCEPTS.length * 3);
    const phases    = new Float32Array(CONCEPTS.length);
    const sizes     = new Float32Array(CONCEPTS.length);
    CONCEPTS.forEach(({ pos, size }, i) => {
      positions[i*3]   = pos[0];
      positions[i*3+1] = pos[1];
      positions[i*3+2] = pos[2];
      phases[i] = i * (Math.PI * 2 / CONCEPTS.length);
      sizes[i]  = size;
    });
    return { positions, phases, sizes };
  }, []);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPhase"   args={[phases, 1]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={NODE_VERT}
        fragmentShader={NODE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Graph edges ──────────────────────────────────────────────────────────────

function GraphEdges() {
  const ref      = useRef<THREE.LineSegments>(null);
  const uniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uColor: { value: new THREE.Color('#06b6d4') },
  }), []);

  const { positions, phases } = useMemo(() => {
    const positions: number[] = [];
    const phases: number[]    = [];

    EDGES.forEach(([a, b], i) => {
      const na = CONCEPTS[a], nb = CONCEPTS[b];
      positions.push(...na.pos, ...nb.pos);
      phases.push(i * 0.4, i * 0.4);
    });

    return {
      positions: new Float32Array(positions),
      phases:    new Float32Array(phases),
    };
  }, []);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"    args={[positions, 3]} />
        <bufferAttribute attach="attributes-aEdgePhase"  args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={EDGE_VERT}
        fragmentShader={EDGE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// ─── Data stream particles ────────────────────────────────────────────────────

function DataStreams() {
  const ref      = useRef<THREE.Points>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const COUNT    = 300;

  const { positions, speeds, offsets, sizes } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds    = new Float32Array(COUNT);
    const offsets   = new Float32Array(COUNT);
    const sizes     = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Place each stream particle on a random edge
      const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
      const a    = CONCEPTS[edge[0]].pos;
      const b    = CONCEPTS[edge[1]].pos;
      const t    = Math.random();
      positions[i*3]   = a[0] + (b[0]-a[0]) * t;
      positions[i*3+1] = a[1] + (b[1]-a[1]) * t;
      positions[i*3+2] = a[2] + (b[2]-a[2]) * t;
      speeds[i]  = 0.15 + Math.random() * 0.3;
      offsets[i] = Math.random();
      sizes[i]   = 1.5 + Math.random() * 2.0;
    }
    return { positions, speeds, offsets, sizes };
  }, []);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aOffset"  args={[offsets, 1]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={STREAM_VERT}
        fragmentShader={STREAM_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Ambient glow ─────────────────────────────────────────────────────────────

function KnowledgeGlow() {
  return (
    <>
      <mesh position={[0, 0, -4]} renderOrder={-1}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.04}
          depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[1, 0.5, -5]} renderOrder={-1}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.03}
          depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

// ─── Exported canvas ──────────────────────────────────────────────────────────

interface KnowledgeCanvasProps {
  scrollProgress: React.MutableRefObject<number>;
}

export default function KnowledgeCanvas({ scrollProgress }: KnowledgeCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 58, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{ position: 'absolute', inset: 0, background: '#03080f' }}
    >
      <KnowledgeGlow />
      <GraphEdges />
      <GraphNodes />
      <DataStreams />
    </Canvas>
  );
}
