import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { findCoupon } from "@/data/catalog";
import { currency } from "@/lib/format";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Bag — UNTKN" },
      { name: "description", content: "Review the pieces in your UNTKN shopping bag." },
      { property: "og:title", content: "Shopping Bag — UNTKN" },
      { property: "og:description", content: "Review your selection before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, subtotal, updateQuantity, removeLine, hydrated } = useShop();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const shipping = subtotal > 0 && subtotal < 300 ? 20 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const applyCoupon = () => {
    const coupon = findCoupon(code);
    if (!coupon) {
      setDiscount(0);
      toast.error("That code isn't valid");
      return;
    }
    const value =
      coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    setDiscount(value);
    toast.success(`${coupon.code} applied`);
  };

  if (!hydrated) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10">
          <div className="h-8 w-40 animate-pulse bg-secondary" />
          <div className="mt-10 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse bg-secondary" />
            ))}
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-20">
        <h1 className="display-lg">Shopping bag</h1>

        {cart.length === 0 ? (
          <div className="mt-16 border border-border px-6 py-24 text-center">
            <p className="display-md">Your bag is empty</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing here yet — the new season is a good place to start.
            </p>
            <Link
              to="/shop"
              className="eyebrow mt-8 inline-block bg-primary px-10 py-4 text-primary-foreground"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
            <ul className="divide-y divide-border border-y border-border">
              {cart.map((line) => (
                <li key={line.lineId} className="flex gap-5 py-6">
                  <Link to="/product/$slug" params={{ slug: line.slug }} className="shrink-0">
                    <img
                      src={line.image}
                      alt={line.name}
                      loading="lazy"
                      className="h-40 w-32 object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <Link
                        to="/product/$slug"
                        params={{ slug: line.slug }}
                        className="tracking-tight hover:underline"
                      >
                        {line.name}
                      </Link>
                      <span className="tabular-nums">
                        {currency(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                    <p className="eyebrow mt-2 text-muted-foreground">
                      {line.color} / {line.size}
                    </p>
                    <div className="mt-auto flex items-center gap-6 pt-4">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                          className="px-3 py-2"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-9 text-center text-sm tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                          disabled={line.quantity >= line.maxQuantity}
                          className="px-3 py-2 disabled:opacity-30"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.lineId)}
                        className="eyebrow text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="eyebrow">Order summary</h2>
              <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{currency(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping estimate</dt>
                  <dd className="tabular-nums">{shipping ? currency(shipping) : "Free"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="tabular-nums">−{currency(discount)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-4 text-base">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{currency(total)}</dd>
                </div>
              </dl>

              <div className="mt-8 flex border-b border-foreground">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Discount code"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button type="button" onClick={applyCoupon} className="eyebrow px-2">
                  Apply
                </button>
              </div>

              <Link
                to="/checkout"
                className="eyebrow mt-8 block bg-primary py-4 text-center text-primary-foreground transition-opacity hover:opacity-85"
              >
                Checkout
              </Link>
              <Link to="/shop" className="eyebrow link-underline mt-6 inline-block">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
