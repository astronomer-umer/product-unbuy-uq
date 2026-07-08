"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { Seller } from "@/lib/catalog";

type Facets = {
  brands: string[];
  sizes: string[];
  conditions: string[];
  sellers: Seller[];
};

export function ShopFilters({ facets }: { facets: Facets }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const update = useCallback(
    (mut: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(params.toString());
      mut(sp);
      start(() => {
        router.replace(sp.toString() ? `/shop?${sp.toString()}` : "/shop");
      });
    },
    [router, params],
  );

  const toggleMulti = (key: "brand" | "size" | "condition", value: string) => {
    update((sp) => {
      const current = sp.getAll(key);
      if (current.includes(value)) {
        sp.delete(key);
        for (const v of current.filter((x) => x !== value)) sp.append(key, v);
      } else {
        sp.append(key, value);
      }
    });
  };

  const setSingle = (key: "q" | "status" | "seller", value: string) => {
    update((sp) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
  };

  const clearAll = () => {
    update((sp) => {
      for (const k of ["q", "brand", "size", "condition", "status", "seller"]) {
        sp.delete(k);
      }
    });
  };

  const selected = {
    brand: params.getAll("brand"),
    size: params.getAll("size"),
    condition: params.getAll("condition"),
  };

  return (
    <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start" aria-label="Filters">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl tracking-wide uppercase">Filter</h2>
        {params.toString().length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
          htmlFor="q"
        >
          Search
        </label>
        <input
          id="q"
          type="search"
          defaultValue={params.get("q") ?? ""}
          placeholder="Nike, UK 9, leather…"
          onChange={(e) => setSingle("q", e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-ring"
        />
      </div>

      {facets.sellers.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Seller
          </h3>
          <div className="flex flex-col gap-1">
            {facets.sellers.map((s) => {
              const active = params.get("seller") === s.slug;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSingle("seller", active ? "" : s.slug)}
                  aria-pressed={active}
                  className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">{s.name}</span>
                  <span
                    className={`font-mono text-xs uppercase tracking-wider ${
                      active ? "opacity-80" : "text-lime"
                    }`}
                  >
                    {s.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <FilterGroup
        title="Status"
        options={[
          { value: "AVAILABLE", label: "Available" },
          { value: "SOLD", label: "Sold" },
        ]}
        selected={params.get("status") ? [params.get("status")!] : []}
        onToggle={(v) => {
          const cur = params.get("status");
          update((sp) => {
            if (cur === v) sp.delete("status");
            else sp.set("status", v);
          });
        }}
      />

      <FilterGroup
        title="Brand"
        options={facets.brands.map((b) => ({ value: b, label: b }))}
        selected={selected.brand}
        onToggle={(v) => toggleMulti("brand", v)}
      />

      <FilterGroup
        title="Size"
        options={facets.sizes.map((s) => ({ value: s, label: s }))}
        selected={selected.size}
        onToggle={(v) => toggleMulti("size", v)}
      />

      <FilterGroup
        title="Condition"
        options={facets.conditions.map((c) => ({ value: c, label: c }))}
        selected={selected.condition}
        onToggle={(v) => toggleMulti("condition", v)}
      />

      {pending && (
        <p className="font-mono text-xs text-muted-foreground">Updating…</p>
      )}
    </aside>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(o.value)}
              aria-pressed={active}
              className={`rounded-full border px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
