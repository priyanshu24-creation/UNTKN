import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { getCategory, effectivePrice } from "@/data/catalog";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useShop } from "@/store/shop";
import type { Product } from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;

/** Small editorial markers shown on the image corner. */
function badgesFor(product: Product) {
  const badges: { label: string; tone: "ink" | "line" }[] = [];
  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isNew = Date.now() - new Date(product.createdAt).getTime() < 45 * DAY;

  if (product.salePrice) badges.push({ label: "Sale", tone: "ink" });
  if (product.featured) badges.push({ label: "Drop", tone: "ink" });
  if (isNew && !product.salePrice) badges.push({ label: "New", tone: "line" });
  if (stock > 0 && stock <= 6) badges.push({ label: "Low stock", tone: "line" });

  return badges.slice(0, 2);
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { wishlist, toggleWishlist, addToCart, setCartOpen } = useShop();
  const [added, setAdded] = useState<string | null>(null);
  const saved = wishlist.includes(product.id);
  const category = getCategory(product.categoryId);
  const hover = product.images[1] ?? product.images[0];
  const badges = badgesFor(product);
  const price = effectivePrice(product);

  const quickAdd = (size: string) => {
    const color = product.colors[0]?.name ?? "";
    const variant = product.variants.find((v) => v.size === size && v.color === color)
      ?? product.variants.find((v) => v.size === size);

    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      unitPrice: price,
      size,
      color,
      quantity: 1,
      maxQuantity: Math.max(1, variant?.stock ?? 5),
    });
    setAdded(size);
    setCartOpen(true);
    window.setTimeout(() => setAdded(null), 1400);
  };

  const sizes = product.sizes.slice(0, 6);

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="absolute inset-0 block"
          aria-label={product.name}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading={index < 4 ? "eager" : "lazy"}
            width={1024}
            height={1280}
            className="h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-0"
          />
          <img
            src={hover}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-[opacity,transform] duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={cn(
                "eyebrow px-2.5 py-1 text-[0.5625rem] leading-none backdrop-blur-sm",
                badge.tone === "ink"
                  ? "bg-foreground text-background"
                  : "border border-foreground/25 bg-background/80 text-foreground",
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {sizes.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full bg-background/95 px-3 py-3 opacity-0 backdrop-blur-sm transition-all duration-400 ease-out group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 md:block">
            <div className="flex items-center justify-between gap-2">
              <p className="eyebrow shrink truncate text-[0.5625rem] text-muted-foreground">
                {added ? `Added · ${added}` : "Add"}
              </p>
              <div className="flex flex-nowrap justify-end gap-1">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => quickAdd(size)}
                    aria-label={`Add ${product.name}, size ${size}, to bag`}
                    className={cn(
                      "eyebrow h-7 min-w-7 border px-1.5 text-[0.5625rem] leading-none transition-colors",
                      added === size
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground hover:bg-foreground hover:text-background",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        className="absolute right-3 top-3 p-2 text-foreground/70 transition-colors hover:text-foreground"
      >
        <Heart className={cn("h-4 w-4", saved && "fill-current")} strokeWidth={1.4} />
      </button>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="link-underline text-sm tracking-tight"
          >
            {product.name}
          </Link>
          <p className="eyebrow mt-1 text-muted-foreground">{category?.name}</p>
        </div>
        <p className="whitespace-nowrap text-sm tabular-nums">
          {product.salePrice ? (
            <>
              <span className="mr-2 text-muted-foreground line-through">
                {currency(product.price, product.currency)}
              </span>
              {currency(product.salePrice, product.currency)}
            </>
          ) : (
            currency(price, product.currency)
          )}
        </p>
      </div>
    </article>
  );
}
