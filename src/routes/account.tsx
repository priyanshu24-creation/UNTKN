import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProductById } from "@/data/catalog";
import { currency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useShop } from "@/store/shop";
import editorialImage from "@/assets/editorial-1.jpg";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — UNTKN" },
      {
        name: "description",
        content: "Manage your UNTKN profile, orders, addresses and wishlist.",
      },
      { property: "og:title", content: "My Account — UNTKN" },
      { property: "og:description", content: "Orders, addresses and saved pieces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

const TABS = ["Orders", "Profile", "Addresses", "Wishlist"] as const;
type Tab = (typeof TABS)[number];

function Account() {
  const { session, signOut, wishlist, hydrated, lastOrder } = useShop();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Orders");

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gallery font-fashion text-gallery-ink">
        <Header />
        <main className="flex min-h-[calc(100svh-4rem)] items-center px-4 py-10 pt-24 md:min-h-[calc(100svh-5rem)] md:px-8 md:py-12 md:pt-28">
          <div className="auth-card mx-auto grid w-full max-w-5xl overflow-hidden bg-card shadow-[var(--shadow-editorial)] md:min-h-[660px] md:grid-cols-2">
            <div className="auth-panel flex items-center px-7 py-14 sm:px-12 md:px-16 lg:px-20">
              <div className="mx-auto w-full max-w-sm">
                <div className="h-10 w-48 animate-pulse bg-secondary" />
              </div>
            </div>
            <div className="auth-visual relative hidden min-h-[660px] overflow-hidden bg-secondary md:block">
              <img
                src={editorialImage}
                alt="Model wearing a cream knit and tailored black trousers"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const orders = lastOrder ? [lastOrder] : [];
  const saved = wishlist.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="min-h-screen bg-gallery font-fashion text-gallery-ink">
      <Header />
      <main className="flex min-h-[calc(100svh-4rem)] items-center px-4 py-10 pt-24 md:min-h-[calc(100svh-5rem)] md:px-8 md:py-12 md:pt-28">
        <section className="auth-card mx-auto grid w-full max-w-5xl overflow-hidden bg-card shadow-[var(--shadow-editorial)] md:min-h-[720px] md:grid-cols-2">
          <div className="auth-panel flex items-start px-7 py-14 sm:px-12 md:items-center md:px-16 lg:px-20">
            <div className="mx-auto w-full max-w-sm">
              {!session ? (
                <>
                  <header className="mb-10">
                    <p className="mb-3 text-[10px] font-medium uppercase text-muted-foreground">UNTKN account</p>
                    <h1 className="font-editorial text-5xl font-normal leading-none md:text-6xl">Your account</h1>
                    <p className="mt-4 text-xs uppercase text-muted-foreground">Sign in to see orders, addresses and saved pieces.</p>
                  </header>

                  <div className="space-y-5">
                    <Button asChild className="h-12 w-full rounded-none bg-gallery-ink text-[10px] uppercase text-primary-foreground shadow-none hover:bg-gallery-ink/90">
                      <Link to="/login" viewTransition>Sign in</Link>
                    </Button>
                    <div className="flex items-center gap-4" aria-hidden="true">
                      <span className="h-px flex-1 bg-border" />
                      <span className="text-[9px] uppercase text-muted-foreground">or</span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <Button asChild variant="outline" className="h-12 w-full rounded-none bg-transparent text-[10px] uppercase shadow-none hover:border-gallery-ink hover:bg-transparent">
                      <Link to="/register" viewTransition>Create account</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <header className="mb-10">
                    <p className="mb-3 text-[10px] font-medium uppercase text-muted-foreground">Account</p>
                    <h1 className="font-editorial text-4xl font-normal leading-none md:text-5xl">{session.name}</h1>
                    <p className="mt-4 text-xs uppercase text-muted-foreground">{session.email}</p>
                  </header>

                  <div className="mb-10 flex flex-wrap items-center gap-3">
                    {session.role === "admin" ? (
                      <Button asChild variant="outline" className="h-10 rounded-none bg-transparent text-[10px] uppercase shadow-none hover:border-gallery-ink hover:bg-transparent">
                        <Link to="/admin">Admin dashboard</Link>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        signOut();
                        toast.success("Signed out");
                        void navigate({ to: "/" });
                      }}
                      className="h-10 rounded-none bg-transparent text-[10px] uppercase shadow-none hover:border-gallery-ink hover:bg-transparent"
                    >
                      Log out
                    </Button>
                  </div>

                  <nav className="mb-10 flex gap-6 overflow-x-auto border-b border-border pb-px">
                    {TABS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={cn(
                          "whitespace-nowrap pb-3 text-[10px] font-medium uppercase tracking-wider transition-colors",
                          tab === t
                            ? "border-b border-gallery-ink text-gallery-ink"
                            : "text-muted-foreground hover:text-gallery-ink",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </nav>

                  <div className="min-h-[180px]">
                    {tab === "Orders" ? (
                      orders.length === 0 ? (
                        <div className="text-center">
                          <p className="font-editorial text-2xl font-normal md:text-3xl">No orders yet</p>
                          <Link to="/shop" className="mt-6 inline-block text-[10px] uppercase underline underline-offset-4 text-muted-foreground hover:text-gallery-ink">
                            Start shopping
                          </Link>
                        </div>
                      ) : (
                        <ul className="divide-y divide-border border-y border-border">
                          {orders.map((o) => (
                            <li key={o.id} className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                              <div>
                                <p className="text-sm font-medium">{o.number}</p>
                                <p className="mt-2 text-[10px] uppercase text-muted-foreground">
                                  {formatDate(o.createdAt)} · {o.items.length}{" "}
                                  {o.items.length === 1 ? "item" : "items"} · {o.status} ·{" "}
                                  {o.paymentStatus.replace("_", " ")}
                                </p>
                              </div>
                              <div className="flex items-center gap-6">
                                <span className="text-sm tabular-nums">{currency(o.total)}</span>
                                <Link to="/order-confirmation" className="text-[10px] uppercase underline underline-offset-4 text-muted-foreground hover:text-gallery-ink">
                                  Details
                                </Link>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )
                    ) : null}

                    {tab === "Profile" ? (
                      <div className="space-y-7">
                        {[
                          ["Full name", session.name],
                          ["Email", session.email],
                          ["Phone", "Not set"],
                        ].map(([label, value]) => (
                          <label key={label} className="block">
                            <span className="text-[10px] font-medium uppercase text-muted-foreground">{label}</span>
                            <input
                              defaultValue={value}
                              className="mt-1 w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/50 focus:border-gallery-ink"
                            />
                          </label>
                        ))}
                        <Button
                          type="button"
                          onClick={() => toast.success("Profile saved")}
                          className="h-12 w-full rounded-none bg-gallery-ink text-[10px] uppercase text-primary-foreground shadow-none hover:bg-gallery-ink/90"
                        >
                          Save changes
                        </Button>
                      </div>
                    ) : null}

                    {tab === "Addresses" ? (
                      <div className="grid gap-5 sm:grid-cols-2">
                        {lastOrder ? (
                          <div className="border border-border p-5 text-sm leading-relaxed">
                            <p className="text-[10px] font-medium uppercase text-muted-foreground">
                              {lastOrder.shippingAddress.label}
                            </p>
                            <p className="mt-4">
                              {lastOrder.shippingAddress.fullName}
                              <br />
                              {lastOrder.shippingAddress.line1}
                              <br />
                              {lastOrder.shippingAddress.city}, {lastOrder.shippingAddress.state}{" "}
                              {lastOrder.shippingAddress.postalCode}
                              <br />
                              {lastOrder.shippingAddress.country}
                            </p>
                          </div>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => toast.message("Address book saves once the backend is connected")}
                          className="border border-dashed border-border p-5 text-left text-[10px] uppercase text-muted-foreground transition-colors hover:text-gallery-ink"
                        >
                          + Add address
                        </button>
                      </div>
                    ) : null}

                    {tab === "Wishlist" ? (
                      saved.length === 0 ? (
                        <div className="text-center">
                          <p className="font-editorial text-2xl font-normal md:text-3xl">Nothing saved yet</p>
                          <Link to="/shop" className="mt-6 inline-block text-[10px] uppercase underline underline-offset-4 text-muted-foreground hover:text-gallery-ink">
                            Browse the collection
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                          {saved.map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} />
                          ))}
                        </div>
                      )
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="auth-visual relative hidden min-h-[720px] overflow-hidden bg-secondary md:block">
            <img
              src={editorialImage}
              alt="Model wearing a cream knit and tailored black trousers"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 ease-out hover:scale-[1.015]"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-gallery-ink/55 to-transparent px-7 pb-7 pt-24 text-primary-foreground">
              <p className="text-[10px] font-medium uppercase">The knit edit · 2026</p>
              <Link to="/shop" className="text-[10px] uppercase underline underline-offset-4">Discover</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
