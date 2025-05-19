import Link from 'next/link';
import { PenLine, Search, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-[family-name:var(--font-geist-sans)]">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold">Jurist AI</div>
          <Link
            href="/workspace"
            className="rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow hover:bg-background/80"
          >
            Enter Workspace
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            AI Ecosystem for Modern Legal Practice
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
            Annotate, search and collaborate on legal documents with professional AI tools built for lawyers.
          </p>
          <Link
            href="/workspace"
            className="rounded-md bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open Workspace
          </Link>
        </section>
        <section className="bg-muted py-12">
          <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 px-6 md:grid-cols-3">
            <div className="text-center">
              <PenLine className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Precise Annotations</h3>
              <p className="text-sm text-muted-foreground">Highlight clauses and add notes with pixel-perfect accuracy.</p>
            </div>
            <div className="text-center">
              <Search className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Intelligent Search</h3>
              <p className="text-sm text-muted-foreground">Quickly locate references across your entire case library.</p>
            </div>
            <div className="text-center">
              <ShieldCheck className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Secure Collaboration</h3>
              <p className="text-sm text-muted-foreground">Share insights confidently with enterprise‑grade security.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Jurist AI
      </footer>
    </div>
  );
}
