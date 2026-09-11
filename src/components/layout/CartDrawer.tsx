import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { currency } from "@/lib/format";
import { useShop } from "@/store/shop";

export function CartDrawer() {
  const { cartOpen, setCartOpen, cart, subtotal, updateQuantity, removeLine } = useShop();

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  const shipping = subtotal > 0 && subtotal < 300 ? 20 : 0;

  return (
    <>
      <div
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[75] bg-foreground/30 transition-opacity duration-500 ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-label="Shopping bag"
        className={`fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col bg-background transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <span className="eyebrow">Shopping bag</span>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Close bag">
            <X className="h-5 w-5" strokeWidth={1.2} />
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="display-md">Your bag is empty</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Pieces you add will be held here for you.
            </p>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="eyebrow mt-8 border border-foreground px-8 py-4 transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {cart.map((line) => (
                <li key={line.lineId} className="flex gap-4 py-5">
                  <img
                    src={line.image}
                    alt={line.name}
                    loading="lazy"
                    className="h-28 w-[5.5rem] object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link
                        to="/product/$slug"
                        params={{ slug: line.slug }}
                        onClick={() => setCartOpen(false)}
                        className="text-sm tracking-tight hover:underline"
                      >
                        {line.name}
                      </Link>
                      <span className="text-sm tabular-nums">
                        {currency(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                    <p className="eyebrow mt-1 text-muted-foreground">
                      {line.color} / {line.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                          className="px-3 py-2"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
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

            <footer className="border-t border-border px-6 py-6">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{currency(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping estimate</dt>
                  <dd className="tabular-nums">{shipping ? currency(shipping) : "Free"}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{currency(subtotal + shipping)}</dd>
                </div>
              </dl>
              <div className="mt-6 grid gap-3">
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="eyebrow bg-primary px-8 py-4 text-center text-primary-foreground transition-opacity hover:opacity-85"
                >
                  Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className="eyebrow border border-foreground px-8 py-4 text-center transition-colors hover:bg-secondary"
                >
                  View cart
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
