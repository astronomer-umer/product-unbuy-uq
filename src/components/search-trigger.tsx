"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search products"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
      {open && <SearchModal onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [recents, setRecents] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("unbuy:recent-searches") ?? "[]");
    } catch {
      return [];
    }
  });
  const [suggestions, setSuggestions] = useState<
    { id: string; title: string; price: number; seller: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  async function fetchSuggestions(query: string) {
    setLoading(true);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!r.ok) {
        setSuggestions([]);
        return;
      }
      const data = await r.json();
      setSuggestions(data.results ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(value: string) {
    setQ(value);
    if (value.trim().length >= 2) {
      // Debounce
      const t = setTimeout(() => fetchSuggestions(value), 150);
      return () => clearTimeout(t);
    } else {
      setSuggestions([]);
    }
  }

  function goToSearch(value: string) {
    const term = value.trim();
    if (!term) return;
    const next = [
      term,
      ...recents.filter((r) => r.toLowerCase() !== term.toLowerCase()),
    ].slice(0, 5);
    setRecents(next);
    try {
      localStorage.setItem("unbuy:recent-searches", JSON.stringify(next));
    } catch {}
    onClose();
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  }

  function clearRecents() {
    setRecents([]);
    try {
      localStorage.removeItem("unbuy:recent-searches");
    } catch {}
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    goToSearch(q);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 surface-cobalt"
    >
      <div className="mx-auto max-w-3xl px-6 pt-20">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
            Search the shop
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-background/80 hover:text-background hover:bg-background/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-background/60"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              autoFocus
              value={q}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Nike, leather jacket, something for a wedding…"
              className="w-full rounded-2xl border border-background/15 bg-background px-12 py-4 text-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-lime"
            />
          </div>
          <p className="mt-3 font-mono text-xs text-background/60">
            Tip: search by feel, not by keyword. &ldquo;vintage denim&rdquo; beats &ldquo;jeans&rdquo;.
          </p>
        </form>

        {q.trim().length >= 2 && (
          <div className="mt-8">
            <h3 className="font-mono text-xs uppercase tracking-wider text-lime">
              {loading ? "Searching…" : suggestions.length > 0 ? "Best matches" : "No matches yet"}
            </h3>
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-background">
              {suggestions.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/products/${s.id}`)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
                  >
                    <div>
                      <div className="font-semibold">{s.title}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {s.seller}
                      </div>
                    </div>
                    <div className="font-mono text-sm font-semibold tabular-nums">
                      PKR {s.price.toLocaleString("en-PK")}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            {suggestions.length > 0 && (
              <button
                type="button"
                onClick={() => goToSearch(q)}
                className="mt-4 inline-flex h-9 items-center rounded-full bg-lime px-4 text-sm font-semibold text-foreground hover:bg-lime/90 transition-colors"
              >
                See all results for &ldquo;{q}&rdquo; →
              </button>
            )}
          </div>
        )}

        {q.trim().length < 2 && (
          <div className="mt-12">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-lime">
                Recent searches
              </h3>
              {recents.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecents}
                  className="font-mono text-xs uppercase tracking-wider text-background/70 hover:text-background transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {recents.length === 0 ? (
              <p className="text-sm text-background/70">
                Nothing here yet. Try something.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {recents.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => goToSearch(r)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-lime hover:bg-lime/10"
                    >
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-12">
              <h3 className="font-mono text-xs uppercase tracking-wider text-lime">
                Try
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {[
                  "vintage denim",
                  "nike",
                  "small batch",
                  "leather",
                  "color: black",
                  "size: uk 9",
                ].map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => goToSearch(s)}
                      className="rounded-full border border-lime/40 bg-lime/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-lime transition-colors hover:bg-lime hover:text-foreground"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}