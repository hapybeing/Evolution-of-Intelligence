import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Color Palette ───────────────────────────────────────────────────
      colors: {
        void:    '#000000',
        cosmic:  '#0a0015',
        nebula:  '#1a0533',
        energy:  '#7c3aed',
        plasma:  '#06b6d4',
        life:    '#10b981',
        neural:  '#f59e0b',
        beyond:  '#ec4899',
        ghost:   '#f0f0f0',
      },

      // ─── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        mono:    ['var(--font-dm-mono)', 'monospace'],
        serif:   ['var(--font-instrument-serif)', 'serif'],
      },

      fontSize: {
        '10xl': ['10rem',  { lineHeight: '0.9',  letterSpacing: '-0.04em' }],
        '11xl': ['12rem',  { lineHeight: '0.88', letterSpacing: '-0.05em' }],
        '12xl': ['15rem',  { lineHeight: '0.85', letterSpacing: '-0.06em' }],
        '13xl': ['18rem',  { lineHeight: '0.82', letterSpacing: '-0.06em' }],
        'fluid': ['clamp(3rem, 10vw, 12rem)', { lineHeight: '0.9' }],
      },

      // ─── Spacing ─────────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // ─── Animation ───────────────────────────────────────────────────────
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'pulse-slow':   'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':    'spin 20s linear infinite',
        'glow':         'glow 3s ease-in-out infinite alternate',
        'flicker':      'flicker 0.15s infinite',
        'text-shimmer': 'textShimmer 3s ease-in-out infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { textShadow: '0 0 10px #7c3aed, 0 0 20px #7c3aed, 0 0 40px #7c3aed' },
          'to':   { textShadow: '0 0 20px #06b6d4, 0 0 40px #06b6d4, 0 0 80px #06b6d4' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%':                           { opacity: '0.4' },
        },
        textShimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },

      // ─── Background / Gradients ──────────────────────────────────────────
      backgroundImage: {
        'cosmic-radial':  'radial-gradient(ellipse at center, #1a0533 0%, #0a0015 50%, #000000 100%)',
        'neural-mesh':    'radial-gradient(ellipse at 20% 50%, #7c3aed22 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, #06b6d422 0%, transparent 50%)',
        'life-radial':    'radial-gradient(ellipse at center, #10b98122 0%, #0a0015 60%, #000000 100%)',
        'ai-radial':      'radial-gradient(ellipse at center, #f59e0b22 0%, #0a0015 60%, #000000 100%)',
        'beyond-radial':  'radial-gradient(ellipse at center, #ec489922 0%, #000000 70%)',
        'shimmer':        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
      },

      // ─── Box Shadows / Glows ─────────────────────────────────────────────
      boxShadow: {
        'glow-energy':  '0 0 30px rgba(124, 58, 237, 0.5), 0 0 60px rgba(124, 58, 237, 0.3)',
        'glow-plasma':  '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',
        'glow-life':    '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3)',
        'glow-neural':  '0 0 30px rgba(245, 158, 11, 0.5), 0 0 60px rgba(245, 158, 11, 0.3)',
        'glow-beyond':  '0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)',
      },

      // ─── Blur ────────────────────────────────────────────────────────────
      backdropBlur: {
        'xs': '2px',
      },

      // ─── Screen / Layout ─────────────────────────────────────────────────
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};

export default config;
