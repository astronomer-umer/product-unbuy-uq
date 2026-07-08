"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console — wire to Sentry/Datadog later
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Something broke
      </p>
      <h1 className="mt-3 font-heading text-5xl tracking-tight uppercase">
        Try again.
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We hit a snag. The team has been notified.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-2">
        <button
          onClick={reset}
          className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-sm font-semibold hover:bg-muted transition-colors"
        >
          Home
        </Link>
      </div>
    </main>
  );
}