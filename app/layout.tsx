import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { setupPromisePolyfill } from "@/lib/promise-polyfill";
import { AnnotationProvider } from "@/components/context_panel/annotations/AnnotationProvider";
import Script from "next/script";

// Initialize Promise.withResolvers polyfill
setupPromisePolyfill();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define metadata
export const metadata: Metadata = {
  title: "PDF Annotator",
  description: "Annotate PDF documents with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Disable service worker registration */}
        <meta name="x-pdf-no-worker" content="true" />
        
        {/* Move scripts to Next.js Script component with onLoad */}
        <Script 
          id="dynamic-import-polyfill"
          src="/dynamic-import-polyfill.js"
          strategy="beforeInteractive"
        />
        <Script 
          id="parser-selectors-fix"
          src="/fix-parser-selectors.js"
          strategy="beforeInteractive"
        />
        {/* We no longer need the PDF worker script since we're managing the worker in pdf-setup.ts */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AnnotationProvider>
          {children}
        </AnnotationProvider>
      </body>
    </html>
  );
}
