import type { Metadata, Viewport } from 'next';
import { Syne, DM_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

// ─── Font Setup ───────────────────────────────────────────────────────────────
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'The Evolution of Intelligence',
  description:
    'An interactive journey through the emergence of intelligence — from cosmic origins to artificial minds and beyond.',
  keywords: [
    'intelligence', 'evolution', 'artificial intelligence',
    'consciousness', 'interactive', 'webgl', 'three.js',
  ],
  authors: [{ name: 'Gaurang' }],
  openGraph: {
    title: 'The Evolution of Intelligence',
    description: 'An interactive digital experience exploring the emergence of intelligence.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Evolution of Intelligence',
    description: 'An interactive digital experience exploring the emergence of intelligence.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to Google Fonts CDN for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="noise bg-void text-ghost overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
