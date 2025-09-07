import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/ui/Navbar';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'StreamWhereFinder - Find Where to Stream Movies',
    template: '%s | StreamWhereFinder',
  },
  description: 'Discover movies and find where to watch them legally. Search with typos, browse trending movies, and get official streaming links for Netflix, Prime Video, Disney+, and more.',
  keywords: ['movies', 'streaming', 'watch online', 'Netflix', 'Prime Video', 'Disney Plus', 'legal streaming'],
  authors: [{ name: 'StreamWhereFinder' }],
  creator: 'StreamWhereFinder',
  publisher: 'StreamWhereFinder',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'StreamWhereFinder',
    title: 'StreamWhereFinder - Find Where to Stream Movies',
    description: 'Discover movies and find where to watch them legally. Search with typos, browse trending movies, and get official streaming links.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StreamWhereFinder - Find Where to Stream Movies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreamWhereFinder - Find Where to Stream Movies',
    description: 'Discover movies and find where to watch them legally. Search with typos, browse trending movies, and get official streaming links.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="preconnect" href="https://accounts.google.com" />
        {gaId && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://www.google-analytics.com" />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            
            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  {/* TMDb Attribution */}
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-600">
                      This product uses the TMDb API but is not endorsed or certified by TMDb.
                    </p>
                    <img
                      src="/tmdb-logo.svg"
                      alt="The Movie Database"
                      className="h-6"
                    />
                  </div>
                  
                  {/* Legal Links */}
                  <div className="flex space-x-6 text-sm">
                    <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
                    <a href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</a>
                    <a href="/terms" className="text-gray-600 hover:text-gray-900">Terms</a>
                    <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    © 2024 StreamWhereFinder. We only link to official streaming platforms.
                  </p>
                </div>
              </div>
            </footer>
            </div>
          </AuthProvider>
        </ErrorBoundary>

        {/* Analytics */}
        <Analytics />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}