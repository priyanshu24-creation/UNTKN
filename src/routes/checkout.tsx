import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PAYMENT_PROVIDER } from "@/lib/payments";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/payments.functions";
import {
  COD_FEE,
  FREE_SHIPPING_ABOVE,
  SHIPPING_FLAT,
  placeOrder,
} from "@/lib/orders.functions";
import { useShop } from "@/store/shop";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      prefill: { name: string; email: string; contact: string };
      theme: { color: string };
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void;
      modal: { ondismiss: () => void };
    }) => { open: () => void };
  }
}

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — UNTKN" },
      { name: "description", content: "Securely complete your UNTKN order." },
      { property: "og:title", content: "Checkout — UNTKN" },
      { property: "og:description", content: "Securely complete your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const STEPS = ["Information", "Shipping", "Payment"] as const;

interface Form {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

const initialForm: Form = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}

function Checkout() {
  const { cart, subtotal, clearCart, setLastOrder, hydrated } = useShop();
  const navigate = useNavigate();
  const submitOrder = useServerFn(placeOrder);
  const openRazorpayOrder = useServerFn(createRazorpayOrder);
  const verifyPayment = useServerFn(verifyRazorpayPayment);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initialForm);
  const [method, setMethod] = useState<"cod" | "online">("cod");
  const [busy, setBusy] = useState(false);

  const loadRazorpay = async () => {
    if (window.Razorpay) return;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load payment gateway."));
      document.head.appendChild(script);
    });
  };

  const shipping = subtotal > 0 && subtotal < FREE_SHIPPING_ABOVE ? SHIPPING_FLAT : 0;
  const codFee = method === "cod" ? COD_FEE : 0;
  const total = subtotal + shipping + codFee;
  const set = (key: keyof Form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const submit = async () => {
    setBusy(true);
    try {
      const result = await submitOrder({
        data: {
          email: form.email,
          phone: form.phone,
          fullName: form.fullName,
          address: {
            line1: form.line1,
            city: form.city,
            state: form.state,
            country: form.country,
            postalCode: form.postalCode,
          },
          lines: cart.map((l) => ({
            productId: l.productId,
            name: l.name,
            image: l.image,
            size: l.size,
            color: l.color,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
          paymentMethod: method,
        },
      });

      let paymentStatus: "awaiting_payment" | "paid" = "awaiting_payment";
      let paymentReference: string | null = null;
      const localOrder = {
        id: result.id,
        number: result.number,
        customerName: form.fullName,
        customerEmail: form.email,
        createdAt: result.createdAt,
        items: result.items,
        subtotal: result.subtotal,
        shipping: result.shipping,
        discount: 0,
        total: result.total,
        status: "pending",
        paymentStatus,
        paymentMethod: result.paymentMethod,
        paymentProvider: result.paymentMethod === "cod" ? "cash_on_delivery" : PAYMENT_PROVIDER,
        paymentReference,
        shippingAddress: result.shippingAddress,
        estimatedDelivery: result.estimatedDelivery,
      };

      if (method === "online") {
        await loadRazorpay();
        const gateway = await openRazorpayOrder({ data: { orderId: result.id } });
        if (!window.Razorpay) throw new Error("Payment gateway is unavailable.");
        await new Promise<void>((resolve, reject) => {
          const razorpay = new window.Razorpay!({
            key: gateway.keyId,
            amount: gateway.amount,
            currency: gateway.currency,
            name: gateway.name,
            description: gateway.description,
            order_id: gateway.orderId,
            prefill: { name: form.fullName, email: form.email, contact: form.phone },
            theme: { color: "#111111" },
            handler: async (response) => {
              try {
                await verifyPayment({
                  data: {
                    orderId: result.id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  },
                });
                paymentStatus = "paid";
                paymentReference = response.razorpay_payment_id;
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
          });
          razorpay.open();
        });
      }

      setLastOrder({ ...localOrder, paymentStatus, paymentReference });
      clearCart();
      toast.success(
        method === "cod"
          ? `Order ${result.number} placed. Pay in cash when it arrives.`
          : `Payment confirmed for order ${result.number}.`,
      );
      void navigate({ to: "/order-confirmation" });
    } catch {
      toast.error("We couldn't place the order. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (hydrated && cart.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-5 py-28 text-center">
          <h1 className="display-md">Nothing to check out</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Add a piece to your bag to continue.
          </p>
          <Link
            to="/shop"
            className="eyebrow mt-8 inline-block bg-primary px-10 py-4 text-primary-foreground"
          >
            Shop the collection
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
        <h1 className="display-lg">Checkout</h1>

        <ol className="mt-8 flex gap-6 border-b border-border pb-5">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={cn(
                "eyebrow transition-colors",
                i === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {String(i + 1).padStart(2, "0")} {s}
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 2) setStep(step + 1);
              else void submit();
            }}
            className="space-y-8"
          >
            {step === 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full name" value={form.fullName} onChange={set("fullName")} />
                <Field label="Email" type="email" value={form.email} onChange={set("email")} />
                <Field label="Phone" type="tel" value={form.phone} onChange={set("phone")} />
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Address" value={form.line1} onChange={set("line1")} />
                </div>
                <Field label="City" value={form.city} onChange={set("city")} />
                <Field label="State" value={form.state} onChange={set("state")} />
                <Field label="Country" value={form.country} onChange={set("country")} />
                <Field
                  label="Postal / PIN code"
                  value={form.postalCode}
                  onChange={set("postalCode")}
                />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div className="border border-border p-6">
                  <p className="eyebrow">Payment method</p>
                  <div className="mt-5 space-y-4">
                    {(
                      [
                        {
                          id: "cod" as const,
                          title: "Cash on delivery",
                          copy: `Pay the courier in cash when your order arrives. A ${currency(COD_FEE)} handling fee applies.`,
                        },
                        {
                          id: "online" as const,
                          title: "Pay online",
                          copy: `Card, UPI and netbanking via ${PAYMENT_PROVIDER.toUpperCase()}. The order is held as awaiting payment until the gateway confirms it.`,
                        },
                      ]
                    ).map((option) => (
                      <label
                        key={option.id}
                        className={cn(
                          "flex cursor-pointer gap-4 border p-4 transition-colors",
                          method === option.id
                            ? "border-foreground bg-secondary/40"
                            : "border-border hover:border-foreground/40",
                        )}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          value={option.id}
                          checked={method === option.id}
                          onChange={() => setMethod(option.id)}
                          className="mt-1 h-4 w-4 accent-[currentColor]"
                        />
                        <span className="text-sm">
                          <span className="block font-medium">{option.title}</span>
                          <span className="mt-1 block text-muted-foreground">{option.copy}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border border-border p-6 text-sm">
                  <p className="eyebrow text-muted-foreground">Delivering to</p>
                  <p className="mt-3">
                    {form.fullName}, {form.line1}, {form.city} {form.postalCode},{" "}
                    {form.state}, {form.country}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-6 pt-4">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="eyebrow link-underline"
                >
                  Back
                </button>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="eyebrow bg-primary px-10 py-4 text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {busy ? "Placing order…" : step < 2 ? "Continue" : "Place order"}
              </button>
            </div>
          </form>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="eyebrow">Order summary</h2>
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {cart.map((l) => (
                <li key={l.lineId} className="flex gap-4 py-4">
                  <img src={l.image} alt="" loading="lazy" className="h-24 w-20 object-cover" />
                  <div className="flex-1 text-sm">
                    <p>{l.name}</p>
                    <p className="eyebrow mt-1 text-muted-foreground">
                      {l.color} / {l.size} · {l.quantity}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">
                    {currency(l.unitPrice * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{currency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">{shipping ? currency(shipping) : "Free"}</dd>
              </div>
              {codFee > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cash on delivery fee</dt>
                  <dd className="tabular-nums">{currency(codFee)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border pt-4 text-base">
                <dt>Total</dt>
                <dd className="tabular-nums">{currency(total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
