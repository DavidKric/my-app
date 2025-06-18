import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { setupPromisePolyfill } from "@/lib/promise-polyfill";
import { AnnotationProvider } from "@/components/context_panel/annotations/AnnotationProvider";
import Script from "next/script";
import { ThemeProvider } from "next-themes"; // Import ThemeProvider

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
        {/* No PDF worker interference - let the library handle its own workers */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning // Recommended for next-themes
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnnotationProvider> {/* Assuming AnnotationProvider doesn't conflict with ThemeProvider */}
            {children}
          </AnnotationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
