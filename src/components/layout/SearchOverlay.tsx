import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

  const hasQuery = useMemo(() => query.trim().length > 0, [query]);

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
          {hasQuery ? (
            <div className="border-t border-border pt-16 text-center">
              <p className="display-md">Nothing found</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Real product details will appear here when the collection is published.
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
            <p className="text-sm text-muted-foreground">The real collection is coming soon.</p>
          )}
        </div>
      </div>
    </div>
  );
}
