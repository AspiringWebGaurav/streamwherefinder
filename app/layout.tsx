import type { Metadata } from "next";
import "./globals.css";
import { FirebaseProvider } from "@/components/FirebaseProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "StreamWhereFinder Enterprise — Find Where to Watch Movies",
    template: "%s | StreamWhereFinder",
  },
  description:
    "Enterprise-grade movie streaming finder. Search thousands of movies with typo tolerance and discover where to watch them legally.",
  keywords: ["streaming", "movies", "Netflix", "Prime Video", "Disney+", "where to watch"],
  robots: "index, follow",
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
