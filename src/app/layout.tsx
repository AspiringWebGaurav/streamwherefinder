import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { LoaderProvider } from "@/app/providers/LoaderProvider";
import { FirebaseProvider } from "@/app/providers/FirebaseProvider";
import { RouterLoadingManager } from "@/components/RouterLoadingManager";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StreamWhereFinder – Find Your Stream Anywhere",
    template: "%s | StreamWhereFinder",
  },
  description:
    "StreamWhereFinder helps you discover where to watch your favorite movies and shows instantly.",
  keywords: [
    "streaming",
    "finder",
    "movies",
    "shows",
    "OTT",
    "watch",
    "Netflix",
    "Prime Video",
    "Disney Plus",
    "legal streaming",
  ],
  authors: [{ name: "StreamWhereFinder" }],
  creator: "StreamWhereFinder",
  publisher: "StreamWhereFinder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "StreamWhereFinder",
    title: "StreamWhereFinder – Find Your Stream Anywhere",
    description:
      "StreamWhereFinder helps you discover where to watch your favorite movies and shows instantly.",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "StreamWhereFinder – Find Your Stream Anywhere",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamWhereFinder – Find Your Stream Anywhere",
    description:
      "StreamWhereFinder helps you discover where to watch your favorite movies and shows instantly.",
    images: ["/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
        {/* Favicon and Icons */}
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48x48.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/icon-64x64.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/icon-128x128.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/icon-256x256.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icon-512x512.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#00bfa5" />
        <meta name="msapplication-TileColor" content="#00bfa5" />
        
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
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "name": "StreamWhereFinder",
                  "alternateName": "StreamWhereFinder – Find Your Stream Anywhere",
                  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://streamwherefinder.com",
                  "description": "StreamWhereFinder helps you discover where to watch your favorite movies and shows instantly.",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://streamwherefinder.com"}/search?q={search_term_string}`
                    },
                    "query-input": "required name=search_term_string"
                  },
                  "publisher": {
                    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://streamwherefinder.com"}#organization`
                  }
                },
                {
                  "@type": "Organization",
                  "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://streamwherefinder.com"}#organization`,
                  "name": "StreamWhereFinder",
                  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://streamwherefinder.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://streamwherefinder.com"}/icon-512x512.png`,
                    "width": 512,
                    "height": 512
                  },
                  "sameAs": [
                    "https://github.com/streamwherefinder",
                    "https://twitter.com/streamwherefinder"
                  ]
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-white overflow-x-hidden`}
      >
        {/* Global Loader Portal Mount Point */}
        <div id="__global_loader_root" />
        
        <ErrorBoundary>
          <LoaderProvider>
            <FirebaseProvider>
              <RouterLoadingManager />
              <div className="min-h-dvh flex flex-col relative w-full">
                <Navbar />
                <main className="flex-1 relative z-10 w-full">
                  <div className="glass min-h-full w-full">{children}</div>
                </main>
                <Footer />
              </div>
            </FirebaseProvider>
          </LoaderProvider>
        </ErrorBoundary>

        {/* Analytics */}
        <Analytics />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
