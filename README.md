# Evolution-of-Intelligence
# The Evolution of Intelligence

An interactive digital experience exploring the emergence of intelligence across the universe — from cosmic origins to artificial minds and beyond.

## Stack

- **Next.js 14** (App Router)
- **Three.js** + `@react-three/fiber` + `@react-three/drei`
- **GSAP** + ScrollTrigger
- **Framer Motion**
- **Lenis** smooth scroll
- **Tailwind CSS**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Push to GitHub. Vercel auto-deploys on every commit to `main`.

**Vercel settings (no changes needed):**
- Framework: Next.js (auto-detected)
- Build: `next build`
- Root directory: `/`

## Project Structure

```
app/
  layout.tsx          ← Root layout (fonts, metadata)
  page.tsx            ← Main assembler
  globals.css         ← Design system, CSS variables

components/
  core/               ← Loader, cursor, navigation, smooth scroll
  sections/           ← One file per story section
  canvas/             ← Three.js WebGL canvases

hooks/                ← useScrollProgress, useMousePosition, useLenis
lib/                  ← GSAP setup, Three.js utilities
shaders/              ← GLSL vertex & fragment shaders
types/                ← TypeScript declarations (shaders, etc.)
```

## Sections

| # | Section | Visual Theme |
|---|---------|-------------|
| 1 | Hero — Cosmic Birth | Particle universe, violet/cyan |
| 2 | Life Emerges | Organic morphing geometry, emerald |
| 3 | Human Mind | Knowledge graphs, typography wall |
| 4 | Artificial Intelligence | Neural network canvas, amber |
| 5 | Beyond | Abstract speculative geometry, pink |
| 6 | Outro | Single line, cinematic fade |
