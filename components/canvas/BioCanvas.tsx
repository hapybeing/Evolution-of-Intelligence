'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Inline GLSL ──────────────────────────────────────────────────────────────

const CELL_VERT = /* glsl */`
  uniform float uTime;
  uniform float uScroll;
  uniform float uMorphProgress;

  varying vec3  vNormal;
  varying vec3  vPosition;
  varying float vNoise;

  // 3D Simplex-style noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal   = normal;
    vPosition = position;

    // Layered noise displacement — breathing organic surface
    float n1 = snoise(position * 1.2 + uTime * 0.18);
    float n2 = snoise(position * 2.4 - uTime * 0.12) * 0.5;
    float n3 = snoise(position * 4.8 + uTime * 0.08) * 0.25;
    float noise = n1 + n2 + n3;

    vNoise = noise;

    // Morph: sphere → organic blob
    float morphAmt = smoothstep(0.0, 1.0, uMorphProgress);
    float displacement = noise * 0.35 * morphAmt;

    // Pulse: slow heartbeat
    float pulse = sin(uTime * 0.9) * 0.04 * morphAmt;

    vec3 displaced = position + normal * (displacement + pulse);

    // Scroll: scale down + fade as we leave section
    float scale = 1.0 - uScroll * 0.5;
    displaced *= max(0.2, scale);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const CELL_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uMorphProgress;
  uniform vec3  uBaseColor;
  uniform vec3  uGlowColor;

  varying vec3  vNormal;
  varying vec3  vPosition;
  varying float vNoise;

  void main() {
    // Fresnel glow — bright at edges
    vec3 viewDir  = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

    // Surface color: base + noise variation
    float t     = (vNoise * 0.5 + 0.5);
    vec3  color = mix(uBaseColor, uGlowColor, t);

    // Inner core slightly brighter
    float core = 1.0 - length(vPosition) * 0.5;
    color += uGlowColor * core * 0.15;

    // Pulse alpha
    float pulse  = 0.85 + 0.15 * sin(uTime * 0.9);
    float morph  = smoothstep(0.0, 1.0, uMorphProgress);
    float alpha  = (0.55 + fresnel * 0.45) * morph * pulse;

    gl_FragColor = vec4(color + fresnel * uGlowColor * 0.6, alpha);
  }
`;

// ─── Wireframe overlay shader ─────────────────────────────────────────────────
const WIRE_VERT = /* glsl */`
  uniform float uTime;
  uniform float uMorphProgress;

  void main() {
    float morph = smoothstep(0.0, 1.0, uMorphProgress);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * (1.0 + morph * 0.02), 1.0);
  }
`;

const WIRE_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uMorphProgress;

  void main() {
    float morph = smoothstep(0.0, 1.0, uMorphProgress);
    float pulse = 0.5 + 0.5 * sin(uTime * 1.2);
    gl_FragColor = vec4(0.024, 0.714, 0.831, 0.06 * morph * pulse);
  }
`;

// ─── Floating spore particles ─────────────────────────────────────────────────
const SPORE_VERT = /* glsl */`
  uniform float uTime;
  attribute float aOffset;
  attribute float aSpeed;
  attribute float aSize;
  varying float   vAlpha;

  void main() {
    vec3 pos = position;

    // Spiral drift outward
    float angle = uTime * aSpeed + aOffset;
    float radius = length(pos.xz) + uTime * aSpeed * 0.05;
    pos.x = cos(angle) * radius;
    pos.z = sin(angle) * radius;
    pos.y += sin(uTime * aSpeed * 0.7 + aOffset) * 0.03;

    // Keep within range
    pos = mod(pos + 4.0, 8.0) - 4.0;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (200.0 / -mvPos.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 6.0);
    gl_Position  = projectionMatrix * mvPos;

    vAlpha = 0.3 + 0.4 * sin(uTime * aSpeed + aOffset);
  }
`;

const SPORE_FRAG = /* glsl */`
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(0.06, 0.85, 0.55, alpha);
  }
`;

// ─── Main cell organism ───────────────────────────────────────────────────────

interface CellProps {
  scrollProgress: React.MutableRefObject<number>;
}

function Cell({ scrollProgress }: CellProps) {
  const meshRef    = useRef<THREE.Mesh>(null);
  const wireRef    = useRef<THREE.Mesh>(null);
  const morphRef   = useRef(0);

  const uniforms = useMemo(() => ({
    uTime:          { value: 0 },
    uScroll:        { value: 0 },
    uMorphProgress: { value: 0 },
    uBaseColor:     { value: new THREE.Color('#0a3d2e') },
    uGlowColor:     { value: new THREE.Color('#10b981') },
  }), []);

  const wireUniforms = useMemo(() => ({
    uTime:          { value: 0 },
    uMorphProgress: { value: 0 },
  }), []);

  useFrame((_, delta) => {
    morphRef.current = Math.min(1, morphRef.current + delta * 0.4);
    const t = performance.now() * 0.001;

    uniforms.uTime.value          = t;
    uniforms.uScroll.value        = scrollProgress.current;
    uniforms.uMorphProgress.value = morphRef.current;

    wireUniforms.uTime.value          = t;
    wireUniforms.uMorphProgress.value = morphRef.current;

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.z += delta * 0.04;
    }
  });

  return (
    <group>
      {/* Main organic surface */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.8, 80]} />
        <shaderMaterial
          vertexShader={CELL_VERT}
          fragmentShader={CELL_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Wireframe membrane overlay */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.85, 12]} />
        <shaderMaterial
          vertexShader={WIRE_VERT}
          fragmentShader={WIRE_FRAG}
          uniforms={wireUniforms}
          transparent
          depthWrite={false}
          wireframe
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ─── Floating spores ──────────────────────────────────────────────────────────

function Spores({ count = 3000 }) {
  const ref      = useRef<THREE.Points>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  const { positions, offsets, speeds, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const offsets   = new Float32Array(count);
    const speeds    = new Float32Array(count);
    const sizes     = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = 1.5 + Math.random() * 3.5;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3]     = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.sin(a) * r;
      offsets[i] = Math.random() * Math.PI * 2;
      speeds[i]  = 0.2 + Math.random() * 0.6;
      sizes[i]   = 0.8 + Math.random() * 1.5;
    }

    return { positions, offsets, speeds, sizes };
  }, [count]);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aOffset"  args={[offsets, 1]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={SPORE_VERT}
        fragmentShader={SPORE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Ambient glow planes ──────────────────────────────────────────────────────

function BioGlow() {
  return (
    <>
      {/* Central emerald bloom */}
      <mesh position={[0, 0, -3]} renderOrder={-1}>
        <planeGeometry args={[14, 14]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.07}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Cyan accent bloom */}
      <mesh position={[2, 1, -4]} renderOrder={-1}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.04}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

// ─── Exported canvas ──────────────────────────────────────────────────────────

interface BioCanvasProps {
  scrollProgress: React.MutableRefObject<number>;
}

export default function BioCanvas({ scrollProgress }: BioCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      style={{ position: 'absolute', inset: 0, background: '#000d07' }}
    >
      <BioGlow />
      <Cell scrollProgress={scrollProgress} />
      <Spores count={3000} />
    </Canvas>
  );
}
