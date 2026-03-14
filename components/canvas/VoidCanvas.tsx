'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import LazyCanvas from '@/components/core/LazyCanvas';

// ─── GLSL ─────────────────────────────────────────────────────────────────────

const VOID_VERT = /* glsl */`
  uniform float uTime;
  attribute float aRandom;
  attribute float aSize;
  varying float   vAlpha;
  varying vec3    vColor;

  // Simple hash
  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec3 pos = position;

    // Each particle orbits on its own elliptical path
    float speed  = 0.15 + aRandom * 0.25;
    float angle  = uTime * speed + aRandom * 6.28318;
    float rx     = 2.5 + aRandom * 3.5;
    float ry     = 1.0 + hash(aRandom * 7.3) * 2.5;
    float tilt   = aRandom * 3.14159;

    // Elliptical orbit in 3D — tilted plane
    float x = cos(angle) * rx;
    float y = sin(angle) * ry;
    float z = sin(angle * 0.5 + tilt) * 1.5;

    // Rotate orbit plane
    float ct = cos(tilt), st = sin(tilt);
    pos = vec3(
      x * ct - z * st,
      y,
      x * st + z * ct
    );

    // Breathing scale
    pos *= 1.0 + 0.04 * sin(uTime * 0.4 + aRandom * 6.28);

    // Color: from pink to violet to white based on random seed
    float t = aRandom;
    vColor = mix(
      mix(vec3(0.929, 0.282, 0.600), vec3(0.486, 0.227, 0.929), t),
      vec3(0.94, 0.94, 0.94),
      smoothstep(0.6, 1.0, t)
    );

    // Pulse alpha
    vAlpha = 0.4 + 0.35 * sin(uTime * 1.1 + aRandom * 6.28);

    vec4 mvPos   = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (280.0 / -mvPos.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 10.0);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const VOID_FRAG = /* glsl */`
  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Ribbon / Möbius-inspired torus knot
const RIBBON_VERT = /* glsl */`
  uniform float uTime;
  varying vec3  vNormal;
  varying float vFresnel;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 viewDir = normalize(-( modelViewMatrix * vec4(position,1.0) ).xyz);
    vFresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RIBBON_FRAG = /* glsl */`
  uniform float uTime;
  varying vec3  vNormal;
  varying float vFresnel;

  void main() {
    // Shifting hue: pink → violet
    float t     = 0.5 + 0.5 * sin(uTime * 0.3);
    vec3  pink  = vec3(0.929, 0.282, 0.600);
    vec3  violet= vec3(0.486, 0.227, 0.929);
    vec3  color = mix(violet, pink, t);

    float alpha = vFresnel * 0.55;
    gl_FragColor = vec4(color + vFresnel * 0.3, alpha);
  }
`;

// ─── Orbital void particles ───────────────────────────────────────────────────

function VoidParticles({ count = 8000 }: { count?: number }) {
  const ref      = useRef<THREE.Points>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  const { positions, randoms, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms   = new Float32Array(count);
    const sizes     = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 0.1;
      positions[i*3+1] = (Math.random() - 0.5) * 0.1;
      positions[i*3+2] = (Math.random() - 0.5) * 0.1;
      randoms[i] = Math.random();
      sizes[i]   = 0.8 + Math.random() * 2.0;
    }
    return { positions, randoms, sizes };
  }, [count]);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRandom"  args={[randoms, 1]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={VOID_VERT}
        fragmentShader={VOID_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Möbius-inspired torus knot ───────────────────────────────────────────────

function MoebiusRibbon() {
  const ref      = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    if (ref.current) {
      ref.current.rotation.x += delta * 0.08;
      ref.current.rotation.y += delta * 0.12;
      ref.current.rotation.z += delta * 0.04;
    }
  });

  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1.6, 0.35, 200, 20, 2, 3]} />
      <shaderMaterial
        vertexShader={RIBBON_VERT}
        fragmentShader={RIBBON_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Glow ─────────────────────────────────────────────────────────────────────

function VoidGlow() {
  return (
    <>
      <mesh position={[0, 0, -4]} renderOrder={-1}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.06}
          depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[-1, 1, -5]} renderOrder={-1}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.05}
          depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function VoidCanvas() {
  return (
    <LazyCanvas bg="#06000f" rootMargin="300px">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', inset: 0, background: '#06000f' }}
      >
        <VoidGlow />
        <MoebiusRibbon />
        <VoidParticles count={8000} />
      </Canvas>
    </LazyCanvas>
  );
}
