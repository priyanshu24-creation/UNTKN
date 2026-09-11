import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  effectivePrice,
  getCategory,
  getProduct,
  getProductById,
  relatedProducts,
  variantStock,
} from "@/data/catalog";
import { currency } from "@/lib/format";
import { fetchStorefrontProducts } from "@/lib/store-products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => ({ product: getProduct(params.slug) }),
  head: ({ loaderData }) => {
    if (!loaderData?.product) {
      return {
        meta: [{ title: "Piece not found — UNTKN" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — UNTKN` },
        { name: "description", content: p.shortDescription },
        { property: "og:title", content: `${p.name} — UNTKN` },
        { property: "og:description", content: p.shortDescription },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: staticProduct } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const [dbProduct, setDbProduct] = useState<Product | null>(null);
  const [looking, setLooking] = useState(!staticProduct);

  useEffect(() => {
    if (staticProduct) return;
    let active = true;
    void fetchStorefrontProducts()
      .then(({ products }) => {
        if (!active) return;
        setDbProduct(products.find((p) => p.slug === slug) ?? null);
      })
      .finally(() => {
        if (active) setLooking(false);
      });
    return () => {
      active = false;
    };
  }, [slug, staticProduct]);

  const found = staticProduct ?? dbProduct;

  if (!found) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-5 py-32 text-center">
          <p className="text-sm text-muted-foreground">
            {looking ? "Loading this piece…" : "This piece is no longer available."}
          </p>
          {!looking && (
            <Link to="/shop" className="mt-6 inline-block text-xs uppercase underline">
              Back to shop
            </Link>
          )}
        </div>
      </SiteLayout>
    );
  }

  return <ProductDetail key={found.id} product={found} />;
}

function ProductDetail({ product }: { product: Product }) {
  const { addToCart, wishlist, toggleWishlist, markViewed, recentlyViewed } = useShop();

  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    setColor(product.colors[0]?.name ?? "");
    setSize(null);
    setQty(1);
    setActive(0);
    markViewed(product.id);
  }, [product.id, product.colors, markViewed]);

  const stock = size ? variantStock(product, color, size) : null;
  const saved = wishlist.includes(product.id);
  const price = effectivePrice(product);
  const category = getCategory(product.categoryId);

  const recent = recentlyViewed
    .filter((id) => id !== product.id)
    .map(getProductById)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  const navigate = useNavigate();

  const handleAdd = () => {
    if (!size) {
      toast.error("Select a size first");
      return false;
    }
    if (!stock) {
      toast.error("That size is sold out");
      return false;
    }
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      unitPrice: price,
      size,
      color,
      quantity: qty,
      maxQuantity: stock,
    });
    toast.success(`${product.name} added to your bag`);
    return true;
  };

  const buyNow = () => {
    if (handleAdd()) void navigate({ to: "/checkout" });
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-8 md:px-10 md:pt-12">
        <nav aria-label="Breadcrumb" className="eyebrow text-muted-foreground">
          <Link to="/shop" className="link-underline">
            Shop
          </Link>
          <span className="px-2">/</span>
          <span>{category?.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          {/* Gallery */}
          <div className="flex gap-4">
            <div className="hidden w-20 shrink-0 flex-col gap-3 md:flex">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "aspect-[4/5] overflow-hidden border transition-opacity",
                    active === i ? "border-foreground" : "border-transparent opacity-60",
                  )}
                >
                  <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <div
              className="relative aspect-[4/5] flex-1 overflow-hidden bg-secondary"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
            >
              {product.images.map((img, i) => (
                <img
                  key={img}
                  src={img}
                  alt={`${product.name} — view ${i + 1}`}
                  width={1024}
                  height={1280}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out",
                    active === i ? "opacity-100" : "opacity-0",
                    zoom && active === i ? "scale-[1.12]" : "scale-100",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-muted-foreground">{category?.name}</p>
            <h1 className="display-md mt-4">{product.name}</h1>
            <p className="mt-4 text-lg tabular-nums">
              {product.salePrice ? (
                <>
                  <span className="mr-3 text-muted-foreground line-through">
                    {currency(product.price, product.currency)}
                  </span>
                  {currency(product.salePrice, product.currency)}
                </>
              ) : (
                currency(price, product.currency)
              )}
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>

            {product.colors.length > 1 ? (
              <div className="mt-10">
                <p className="eyebrow text-muted-foreground">Colour — {color}</p>
                <div className="mt-4 flex gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      aria-label={c.name}
                      aria-pressed={color === c.name}
                      className={cn(
                        "h-8 w-8 rounded-full border transition-all",
                        color === c.name
                          ? "border-foreground ring-1 ring-foreground ring-offset-2 ring-offset-background"
                          : "border-border",
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-muted-foreground">Size</p>
                <span className="eyebrow text-muted-foreground">Size guide</span>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {product.sizes.map((s) => {
                  const available = variantStock(product, color, s) > 0;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!available}
                      onClick={() => setSize(s)}
                      className={cn(
                        "border py-3 text-xs transition-colors",
                        size === s
                          ? "border-foreground bg-primary text-primary-foreground"
                          : "border-border hover:border-foreground",
                        !available && "cursor-not-allowed text-muted-foreground line-through opacity-50",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {stock !== null ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {stock === 0
                    ? "Sold out in this size"
                    : stock <= 3
                      ? `Low stock — only ${stock} left`
                      : "In stock"}
                </p>
              ) : null}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-3"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(stock ?? 10, q + 1))}
                  className="px-4 py-3"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="eyebrow flex items-center gap-2 border border-border px-5 py-3.5"
              >
                <Heart className={cn("h-4 w-4", saved && "fill-current")} strokeWidth={1.3} />
                {saved ? "Saved" : "Wishlist"}
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="eyebrow bg-primary py-4 text-primary-foreground transition-opacity hover:opacity-85"
              >
                Add to bag
              </button>
              <button
                type="button"
                onClick={buyNow}
                className="eyebrow border border-foreground py-4 text-center transition-colors hover:bg-secondary"
              >
                Buy now
              </button>
            </div>

            <Accordion type="single" collapsible className="mt-12 border-t border-border">
              <AccordionItem value="details">
                <AccordionTrigger className="eyebrow">Product details</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {product.details}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="materials">
                <AccordionTrigger className="eyebrow">Materials & care</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {product.materials}
                  <br />
                  {product.care}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="size">
                <AccordionTrigger className="eyebrow">Size guide</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  Our garments are cut generously. XS fits chest 34–36", S 36–38", M 38–40", L
                  40–43", XL 43–46". Between sizes, take the smaller for a closer fit.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="eyebrow">Shipping & returns</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  Complimentary shipping above ₹9,999. Delivered in 3–6 working days. Returns
                  accepted within 30 days on unworn pieces with tags attached.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Editorial story */}
        <Reveal className="mt-24 border-y border-border py-16">
          <p className="eyebrow text-muted-foreground">Behind the piece</p>
          <p className="display-md mt-6 max-w-3xl">
            Cut from cloth woven on slow looms, then rested for two weeks before it is ever
            touched by a pattern.
          </p>
        </Reveal>

        {/* Related */}
        <section className="mt-20">
          <h2 className="display-md">You may also like</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-4">
            {relatedProducts(product).map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} index={i} />
              </Reveal>
            ))}
          </div>
        </section>

        {recent.length > 0 ? (
          <section className="mt-20">
            <h2 className="display-md">Recently viewed</h2>
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-4">
              {recent.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </SiteLayout>
  );
}
