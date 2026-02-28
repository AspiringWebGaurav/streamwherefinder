import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FirebaseProvider } from "@/components/FirebaseProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: {
    default: "StreamWhere — Find Where to Watch Movies & Shows",
    template: "%s | StreamWhere",
  },
  description:
    "StreamWhere helps you discover where to watch your favorite movies and shows instantly. Find streaming availability across Netflix, Prime Video, Disney+, and more.",
  authors: [{ name: "StreamWhere" }],
  keywords: [
    "streaming",
    "movies",
    "Netflix",
    "Prime Video",
    "Disney+",
    "where to watch",
    "streaming availability",
    "movie finder",
    "watch online",
  ],
  robots: "index, follow",
  metadataBase: new URL("https://streamwhere.vercel.app"),
  openGraph: {
    title: "StreamWhere — Find Where to Watch Movies & Shows",
    description:
      "Discover where to watch your favorite movies and shows instantly. Find streaming availability across Netflix, Prime Video, Disney+, and more.",
    url: "https://streamwhere.vercel.app",
    siteName: "StreamWhere",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StreamWhere — Find Where to Watch Movies & Shows",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamWhere — Find Where to Watch Movies & Shows",
    description:
      "Discover where to watch your favorite movies and shows instantly.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icon-256x256.png", sizes: "256x256", type: "image/png" },
    ],
    other: [
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png", rel: "icon" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <LanguageProvider>
          <FirebaseProvider>
            {children}
            <Toaster position="bottom-right" richColors theme="system" />
          </FirebaseProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
