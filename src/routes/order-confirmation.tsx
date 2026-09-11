import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { currency, formatDate } from "@/lib/format";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order Confirmation — UNTKN" },
      { name: "description", content: "Your UNTKN order summary and delivery details." },
      { property: "og:title", content: "Order Confirmation — UNTKN" },
      { property: "og:description", content: "Your order summary and delivery details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmation,
});

const STATUS_COPY: Record<string, string> = {
  awaiting_payment: "Awaiting payment confirmation",
  paid: "Payment confirmed",
  failed: "Payment failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

function Confirmation() {
  const { lastOrder, hydrated } = useShop();

  if (!hydrated) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-28">
          <div className="h-10 w-56 animate-pulse bg-secondary" />
        </div>
      </SiteLayout>
    );
  }

  if (!lastOrder) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-5 py-28 text-center">
          <h1 className="display-md">No recent order</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Once you place an order its confirmation appears here.
          </p>
          <Link
            to="/shop"
            className="eyebrow mt-8 inline-block bg-primary px-10 py-4 text-primary-foreground"
          >
            Continue shopping
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const order = lastOrder;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <div className="animate-rise text-center">
          <svg viewBox="0 0 64 64" className="mx-auto h-16 w-16" aria-hidden="true">
            <circle
              cx="32"
              cy="32"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.25"
            />
            <path
              d="M20 33.5 L28.5 42 L45 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="square"
              style={{
                strokeDasharray: 48,
                strokeDashoffset: 48,
                animation: "draw-check 700ms cubic-bezier(0.22,1,0.36,1) 200ms forwards",
              }}
            />
          </svg>
          <h1 className="display-lg mt-8">Thank you</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Order {order.number} has been received. A confirmation is on its way to{" "}
            {order.customerEmail}.
          </p>
        </div>

        <dl className="mt-14 grid gap-6 border-y border-border py-8 text-sm sm:grid-cols-2">
          <div>
            <dt className="eyebrow text-muted-foreground">Order number</dt>
            <dd className="mt-2">{order.number}</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Payment status</dt>
            <dd className="mt-2">
              {STATUS_COPY[order.paymentStatus] ?? order.paymentStatus}
              {order.paymentProvider ? ` · ${order.paymentProvider}` : ""}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Shipping to</dt>
            <dd className="mt-2 leading-relaxed">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}, {order.shippingAddress.city}
              <br />
              {order.shippingAddress.state} {order.shippingAddress.postalCode},{" "}
              {order.shippingAddress.country}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Estimated delivery</dt>
            <dd className="mt-2">{formatDate(order.estimatedDelivery)}</dd>
          </div>
        </dl>

        <ul className="mt-10 divide-y divide-border">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.size}`} className="flex gap-5 py-5">
              <img src={item.image} alt="" loading="lazy" className="h-28 w-[5.5rem] object-cover" />
              <div className="flex-1 text-sm">
                <p>{item.name}</p>
                <p className="eyebrow mt-1 text-muted-foreground">
                  {item.color} / {item.size} · Qty {item.quantity}
                </p>
              </div>
              <span className="text-sm tabular-nums">
                {currency(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-between border-t border-border pt-6 text-base">
          <span>Total paid</span>
          <span className="tabular-nums">{currency(order.total)}</span>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            to="/track"
            search={{ order: order.number, email: order.customerEmail }}
            className="eyebrow bg-primary px-10 py-4 text-primary-foreground"
          >
            Track order
          </Link>
          <Link to="/account" className="eyebrow border border-foreground px-10 py-4">
            View order
          </Link>
          <Link to="/shop" className="eyebrow border border-foreground px-10 py-4">
            Continue shopping
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
