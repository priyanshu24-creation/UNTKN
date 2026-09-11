import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { currency, formatDate } from "@/lib/format";
import { trackOrder, type TrackedOrder } from "@/lib/track-order.functions";

interface TrackSearch {
  order?: string | undefined;
  email?: string | undefined;
}

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): TrackSearch => ({
    order: typeof search["order"] === "string" ? search["order"] : undefined,
    email: typeof search["email"] === "string" ? search["email"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Track Your Order — UNTKN" },
      {
        name: "description",
        content:
          "Follow your UNTKN order: enter your order number and email to see status, items and estimated delivery.",
      },
      { property: "og:title", content: "Track Your Order — UNTKN" },
      { property: "og:description", content: "See the status of your UNTKN order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Track,
});

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: "Order placed",
  processing: "Being prepared",
  shipped: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function Track() {
  const { order: orderParam, email: emailParam } = Route.useSearch();
  const lookup = useServerFn(trackOrder);

  const [number, setNumber] = useState(orderParam ?? "");
  const [email, setEmail] = useState(emailParam ?? "");
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "missing">("idle");

  const run = async (n: string, e: string) => {
    if (!n || !e) return;
    setState("loading");
    try {
      const found = await lookup({ data: { number: n, email: e } });
      setResult(found);
      setState(found ? "idle" : "missing");
    } catch {
      setResult(null);
      setState("missing");
    }
  };

  useEffect(() => {
    if (orderParam && emailParam) void run(orderParam, emailParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderParam, emailParam]);

  const stepIndex = result ? STATUS_STEPS.indexOf(result.status as (typeof STATUS_STEPS)[number]) : -1;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <p className="eyebrow text-muted-foreground">Order tracking</p>
        <h1 className="display-lg mt-4">Track your order</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Enter the order number from your confirmation email along with the email address
          you used at checkout.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(number.trim(), email.trim());
          }}
          className="mt-10 grid gap-6 border border-border p-6 md:grid-cols-[1fr_1fr_auto] md:items-end md:p-8"
        >
          <label className="block">
            <span className="eyebrow text-muted-foreground">Order number</span>
            <input
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="UN-XXXXXX"
              className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors focus:border-foreground"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground">Email address</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors focus:border-foreground"
            />
          </label>
          <button
            type="submit"
            disabled={state === "loading"}
            className="eyebrow bg-primary px-8 py-4 text-primary-foreground disabled:opacity-60"
          >
            {state === "loading" ? "Checking" : "Track"}
          </button>
        </form>

        {state === "missing" ? (
          <p className="mt-8 border border-border px-6 py-8 text-center text-sm text-muted-foreground">
            We couldn't find an order with that number and email. Check the details from your
            confirmation email and try again.
          </p>
        ) : null}

        {result ? (
          <section className="mt-12 border border-border p-6 md:p-10">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="eyebrow text-muted-foreground">Order number</p>
                <p className="mt-2 text-lg tracking-[0.12em]">{result.number}</p>
              </div>
              <div className="text-right">
                <p className="eyebrow text-muted-foreground">Placed</p>
                <p className="mt-2 text-sm">{formatDate(result.createdAt)}</p>
              </div>
            </div>

            <ol className="mt-8 grid gap-4 sm:grid-cols-4">
              {STATUS_STEPS.map((s, i) => (
                <li key={s}>
                  <div
                    className={
                      i <= stepIndex ? "h-[2px] w-full bg-primary" : "h-[2px] w-full bg-border"
                    }
                  />
                  <p
                    className={
                      i <= stepIndex
                        ? "mt-3 text-xs uppercase tracking-[0.16em]"
                        : "mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground"
                    }
                  >
                    {STATUS_LABEL[s]}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-sm">
              {result.paymentMethod === "cod"
                ? "Cash on delivery — please keep the exact amount ready for the courier."
                : "Paid online."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Estimated delivery {formatDate(result.estimatedDelivery)}
            </p>

            <ul className="mt-8 divide-y divide-border border-t border-border">
              {result.items.map((item, i) => (
                <li key={`${item.name}-${i}`} className="flex justify-between gap-6 py-4 text-sm">
                  <span>
                    {item.name}
                    <span className="text-muted-foreground">
                      {" "}
                      · {item.size} · {item.color} · ×{item.quantity}
                    </span>
                  </span>
                  <span className="tabular-nums">{currency(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{currency(result.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery & fees</span>
                <span className="tabular-nums">{currency(result.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <span>Total</span>
                <span className="tabular-nums">{currency(result.total)}</span>
              </div>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">Delivering to {result.address}</p>
          </section>
        ) : null}
      </div>
    </SiteLayout>
  );
}
