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
        {/* We no longer need the PDF worker script since we're managing the worker in pdf-setup.ts */}
        <Script 
          id="sw-cleanup"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Clean up any existing PDF service workers
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                  for (let registration of registrations) {
                    if (registration.scope.includes('pdf') || 
                        (registration.active && registration.active.scriptURL && 
                         (registration.active.scriptURL.includes('pdf-worker-sw.js') || 
                          registration.active.scriptURL.includes('register-pdf-worker.js')))) {
                      registration.unregister().then(() => {
                        console.log('PDF service worker unregistered');
                      });
                    }
                  }
                });
              }
            `
          }}
        />
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
