import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCategory, searchProducts, effectivePrice } from "@/data/catalog";
import { currency } from "@/lib/format";

const SUGGESTIONS = ["Outerwear", "Knitwear", "Wide leg", "Ecru", "Sale"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const results = useMemo(() => searchProducts(query).slice(0, 6), [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] animate-rise bg-background/98 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-6xl flex-col px-6 pb-10 pt-8 md:px-10">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-muted-foreground">Search</span>
          <button type="button" onClick={onClose} aria-label="Close search" className="p-2">
            <X className="h-5 w-5" strokeWidth={1.2} />
          </button>
        </div>

        <label className="mt-10 block border-b border-border pb-4">
          <span className="sr-only">Search products</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="w-full bg-transparent text-2xl font-light tracking-tight outline-none placeholder:text-muted-foreground md:text-4xl"
          />
        </label>

        <div className="mt-8 flex-1 overflow-y-auto">
          {!query.trim() ? (
            <div className="flex flex-wrap gap-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="eyebrow border border-border px-4 py-2 transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="border-t border-border pt-16 text-center">
              <p className="display-md">Nothing found</p>
              <p className="mt-3 text-sm text-muted-foreground">
                No pieces match “{query}”. Try a category, colour or fabric.
              </p>
              <Link
                to="/shop"
                onClick={onClose}
                className="eyebrow link-underline mt-6 inline-block"
              >
                Browse everything
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    onClick={onClose}
                    className="group flex items-center gap-5 py-4"
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      loading="lazy"
                      className="h-20 w-16 object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm tracking-tight group-hover:underline">{p.name}</p>
                      <p className="eyebrow mt-1 text-muted-foreground">
                        {getCategory(p.categoryId)?.name}
                      </p>
                    </div>
                    <p className="text-sm tabular-nums">
                      {currency(effectivePrice(p), p.currency)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
