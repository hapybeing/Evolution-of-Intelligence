/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow GLSL shader files to be imported as raw strings
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });
    return config;
  },

  // Experimental performance flags
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei', 'gsap', 'framer-motion'],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Required for Three.js / WebGL modules
  transpilePackages: ['three'],
};

module.exports = nextConfig;
