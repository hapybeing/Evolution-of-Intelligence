'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import LazyCanvas from '@/components/core/LazyCanvas';

// ─── GLSL ─────────────────────────────────────────────────────────────────────

const NEURON_VERT = /* glsl */`
  uniform float uTime;
  attribute float aPhase;
  attribute float aLayer;
  attribute float aSize;
  varying float   vFire;
  varying float   vLayer;

  void main() {
    vLayer = aLayer;

    // Each neuron fires at a different time based on layer + phase
    float fireTime = mod(uTime * 0.8 + aLayer * 1.2 + aPhase, 4.0);
    vFire = smoothstep(1.8, 2.0, fireTime) * (1.0 - smoothstep(2.0, 2.6, fireTime));

    float pulse    = 0.7 + 0.3 * sin(uTime * 2.0 + aPhase);
    float sz       = aSize * (pulse + vFire * 2.5);

    vec4 mvPos   = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = sz * (300.0 / -mvPos.z);
    gl_PointSize = clamp(gl_PointSize, 2.0, 20.0);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const NEURON_FRAG = /* glsl */`
  varying float vFire;
  varying float vLayer;
  uniform float uTime;

  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Layer color: input=cyan, hidden=amber/gold, output=white
    vec3 inputCol  = vec3(0.024, 0.714, 0.831);   // cyan
    vec3 hiddenCol = vec3(0.984, 0.620, 0.043);   // amber
    vec3 outputCol = vec3(0.94,  0.94,  0.94);    // white

    vec3 color;
    if (vLayer < 1.0)       color = inputCol;
    else if (vLayer < 3.0)  color = mix(inputCol, hiddenCol, (vLayer - 1.0) / 2.0);
    else                    color = mix(hiddenCol, outputCol, vLayer - 3.0);

    // Fire: bloom to white
    color = mix(color, vec3(1.0), vFire * 0.8);

    float core  = smoothstep(0.5, 0.0, dist);
    float glow  = smoothstep(0.5, 0.1, dist) * 0.5 * (0.5 + vFire);
    float alpha = (core + glow) * (0.6 + vFire * 0.4);

    gl_FragColor = vec4(color, alpha);
  }
`;

const AXON_VERT = /* glsl */`
  uniform float uTime;
  attribute float aEdgeLayer;
  attribute float aEdgePhase;
  varying float   vAlpha;
  varying float   vLayer;

  void main() {
    vLayer = aEdgeLayer;

    // Signal pulse traveling along the edge
    float signal = mod(uTime * 0.7 + aEdgeLayer * 1.2 + aEdgePhase, 4.0);
    float active = smoothstep(1.6, 2.2, signal) * (1.0 - smoothstep(2.2, 3.0, signal));

    vAlpha      = 0.08 + active * 0.35;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const AXON_FRAG = /* glsl */`
  varying float vAlpha;
  varying float vLayer;

  void main() {
    vec3 inputCol  = vec3(0.024, 0.714, 0.831);
    vec3 hiddenCol = vec3(0.984, 0.620, 0.043);
    vec3 color     = vLayer < 2.0 ? inputCol : mix(inputCol, hiddenCol, (vLayer - 1.0) / 2.0);
    gl_FragColor   = vec4(color, vAlpha);
  }
`;

const SIGNAL_VERT = /* glsl */`
  uniform float uTime;
  attribute float aSpeed;
  attribute float aOffset;
  attribute float aEdgeIdx;
  varying float   vAlpha;

  void main() {
    float t  = fract(uTime * aSpeed + aOffset);
    vAlpha   = sin(t * 3.14159) * 0.95;

    vec4 mvPos   = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 3.0 * (220.0 / -mvPos.z);
    gl_PointSize = clamp(gl_PointSize, 2.0, 9.0);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const SIGNAL_FRAG = /* glsl */`
  varying float vAlpha;
  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;
    gl_FragColor = vec4(1.0, 0.85, 0.3, smoothstep(0.5, 0.0, dist) * vAlpha);
  }
`;

// ─── Network architecture ─────────────────────────────────────────────────────
// 5 layers: [6, 9, 9, 9, 4] neurons
const LAYER_SIZES  = [6, 9, 9, 9, 4];
const LAYER_X      = [-3.5, -1.75, 0, 1.75, 3.5];
const LAYER_SPREAD = 1.0;

function buildNetwork() {
  const neurons: { pos: [number, number, number]; layer: number; phase: number; size: number }[] = [];
  const connections: { a: number; b: number; layer: number; phase: number }[] = [];

  // Place neurons
  LAYER_SIZES.forEach((count, li) => {
    for (let i = 0; i < count; i++) {
      const y = (i - (count - 1) / 2) * LAYER_SPREAD;
      neurons.push({
        pos: [LAYER_X[li], y, (Math.random() - 0.5) * 0.3],
        layer: li,
        phase: Math.random() * Math.PI * 2,
        size: li === 0 ? 2.0 : li === 4 ? 2.5 : 1.8,
      });
    }
  });

  // Connect adjacent layers (not all-to-all — sparse for readability)
  let offset = 0;
  const layerStarts = LAYER_SIZES.map((s, i) => {
    const start = offset;
    offset += s;
    return start;
  });

  for (let li = 0; li < LAYER_SIZES.length - 1; li++) {
    const aStart = layerStarts[li];
    const bStart = layerStarts[li + 1];
    const aCount = LAYER_SIZES[li];
    const bCount = LAYER_SIZES[li + 1];

    for (let a = 0; a < aCount; a++) {
      // Connect to 3–5 random neurons in next layer
      const numConnections = 3 + Math.floor(Math.random() * 3);
      const targets = Array.from({ length: bCount }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, numConnections);

      targets.forEach(b => {
        connections.push({
          a: aStart + a,
          b: bStart + b,
          layer: li,
          phase: Math.random() * Math.PI * 2,
        });
      });
    }
  }

  return { neurons, connections };
}

// ─── Neuron points ────────────────────────────────────────────────────────────

function Neurons({ neurons }: { neurons: ReturnType<typeof buildNetwork>['neurons'] }) {
  const ref      = useRef<THREE.Points>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  const { positions, phases, layers, sizes } = useMemo(() => {
    const positions = new Float32Array(neurons.length * 3);
    const phases    = new Float32Array(neurons.length);
    const layers    = new Float32Array(neurons.length);
    const sizes     = new Float32Array(neurons.length);
    neurons.forEach(({ pos, phase, layer, size }, i) => {
      positions[i*3] = pos[0]; positions[i*3+1] = pos[1]; positions[i*3+2] = pos[2];
      phases[i]  = phase;
      layers[i]  = layer;
      sizes[i]   = size;
    });
    return { positions, phases, layers, sizes };
  }, [neurons]);

  useFrame((_, delta) => { uniforms.uTime.value += delta; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPhase"   args={[phases, 1]} />
        <bufferAttribute attach="attributes-aLayer"   args={[layers, 1]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial vertexShader={NEURON_VERT} fragmentShader={NEURON_FRAG}
        uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ─── Axon connections ─────────────────────────────────────────────────────────

function Axons({
  neurons,
  connections,
}: {
  neurons: ReturnType<typeof buildNetwork>['neurons'];
  connections: ReturnType<typeof buildNetwork>['connections'];
}) {
  const ref      = useRef<THREE.LineSegments>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  const { positions, edgeLayers, edgePhases } = useMemo(() => {
    const positions:  number[] = [];
    const edgeLayers: number[] = [];
    const edgePhases: number[] = [];

    connections.forEach(({ a, b, layer, phase }) => {
      const na = neurons[a], nb = neurons[b];
      positions.push(...na.pos, ...nb.pos);
      edgeLayers.push(layer, layer);
      edgePhases.push(phase, phase);
    });

    return {
      positions:  new Float32Array(positions),
      edgeLayers: new Float32Array(edgeLayers),
      edgePhases: new Float32Array(edgePhases),
    };
  }, [neurons, connections]);

  useFrame((_, delta) => { uniforms.uTime.value += delta; });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"    args={[positions, 3]} />
        <bufferAttribute attach="attributes-aEdgeLayer"  args={[edgeLayers, 1]} />
        <bufferAttribute attach="attributes-aEdgePhase"  args={[edgePhases, 1]} />
      </bufferGeometry>
      <shaderMaterial vertexShader={AXON_VERT} fragmentShader={AXON_FRAG}
        uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

// ─── Signal particles traveling along axons ───────────────────────────────────

function Signals({
  neurons,
  connections,
}: {
  neurons: ReturnType<typeof buildNetwork>['neurons'];
  connections: ReturnType<typeof buildNetwork>['connections'];
}) {
  const ref      = useRef<THREE.Points>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const PER_EDGE = 4;

  const { positions, speeds, offsets } = useMemo(() => {
    const count     = connections.length * PER_EDGE;
    const positions = new Float32Array(count * 3);
    const speeds    = new Float32Array(count);
    const offsets   = new Float32Array(count);

    connections.forEach(({ a, b }, ci) => {
      const na = neurons[a], nb = neurons[b];
      for (let k = 0; k < PER_EDGE; k++) {
        const idx = (ci * PER_EDGE + k);
        const t   = k / PER_EDGE;
        positions[idx*3]   = na.pos[0] + (nb.pos[0] - na.pos[0]) * t;
        positions[idx*3+1] = na.pos[1] + (nb.pos[1] - na.pos[1]) * t;
        positions[idx*3+2] = na.pos[2] + (nb.pos[2] - na.pos[2]) * t;
        speeds[idx]  = 0.2 + Math.random() * 0.3;
        offsets[idx] = Math.random();
      }
    });

    return { positions, speeds, offsets };
  }, [neurons, connections]);

  useFrame((_, delta) => { uniforms.uTime.value += delta; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aOffset"  args={[offsets, 1]} />
      </bufferGeometry>
      <shaderMaterial vertexShader={SIGNAL_VERT} fragmentShader={SIGNAL_FRAG}
        uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ─── Glow ─────────────────────────────────────────────────────────────────────

function NeuralGlow() {
  return (
    <>
      <mesh position={[0, 0, -4]} renderOrder={-1}>
        <planeGeometry args={[18, 12]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.04}
          depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[-1, 0, -5]} renderOrder={-1}>
        <planeGeometry args={[14, 10]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.03}
          depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function NeuralScene() {
  const { neurons, connections } = useMemo(() => buildNetwork(), []);

  return (
    <>
      <NeuralGlow />
      <Axons     neurons={neurons} connections={connections} />
      <Neurons   neurons={neurons} />
      <Signals   neurons={neurons} connections={connections} />
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function NeuralCanvas() {
  return (
    <LazyCanvas bg="#080400" rootMargin="300px">
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 62, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', inset: 0, background: '#080400' }}
      >
        <NeuralScene />
      </Canvas>
    </LazyCanvas>
  );
}
