import type { Address, CartLine, Order } from "@/lib/types";

/**
 * Payment boundary.
 *
 * The storefront never decides whether an order is paid. It creates a draft
 * order, asks the backend for a payment intent, hands control to the gateway,
 * and then polls/receives the *server-verified* status. Webhook verification on
 * the server is the only source of truth for `paymentStatus`.
 *
 * Today these functions are local stubs so the UI can be exercised; each one
 * maps 1:1 to a server endpoint to implement when the backend is connected:
 *
 *   createDraftOrder  -> POST /api/orders            (reserves variant stock in a transaction)
 *   createPaymentIntent -> POST /api/payments/intent (Razorpay/Stripe/Cashfree/PayU)
 *   confirmPayment    -> GET  /api/payments/:id      (reads the webhook-verified record)
 *   webhook           -> POST /api/public/payments/webhook (signature verified server-side)
 */

export type PaymentProvider = "razorpay" | "stripe" | "cashfree" | "payu";

export const PAYMENT_PROVIDER: PaymentProvider =
  (import.meta.env["VITE_PAYMENT_PROVIDER"] as PaymentProvider | undefined) ?? "razorpay";

export interface DraftOrderInput {
  email: string;
  phone: string;
  address: Address;
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
}

export interface PaymentIntent {
  intentId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  /** Gateway checkout URL / SDK order id — supplied by the server. */
  gatewayReference: string | null;
}

const orderNumber = () => `AN-${Math.floor(1000 + Math.random() * 9000)}`;

/** Creates the order in `pending` / `awaiting_payment` state. Never `paid`. */
export async function createDraftOrder(input: DraftOrderInput): Promise<Order> {
  const total = Math.max(0, input.subtotal + input.shipping - input.discount);
  const created = new Date();
  const eta = new Date(created.getTime() + 5 * 24 * 60 * 60 * 1000);

  return {
    id: `ord_${created.getTime()}`,
    number: orderNumber(),
    customerName: input.address.fullName,
    customerEmail: input.email,
    createdAt: created.toISOString(),
    items: input.lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      image: l.image,
      size: l.size,
      color: l.color,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
    subtotal: input.subtotal,
    shipping: input.shipping,
    discount: input.discount,
    total,
    status: "pending",
    paymentStatus: "awaiting_payment",
    paymentProvider: PAYMENT_PROVIDER,
    paymentReference: null,
    shippingAddress: input.address,
    estimatedDelivery: eta.toISOString(),
  };
}

/** Asks the backend to open a payment session with the configured provider. */
export async function createPaymentIntent(order: Order): Promise<PaymentIntent> {
  return {
    intentId: `intent_${order.id}`,
    provider: PAYMENT_PROVIDER,
    amount: order.total,
    currency: "INR",
    gatewayReference: null,
  };
}

/**
 * Reads the server-verified payment record. Until a real gateway and webhook
 * endpoint are connected there is nothing to verify, so this reports
 * `awaiting_payment` rather than faking success.
 */
export async function confirmPayment(
  order: Order,
): Promise<{ order: Order; verified: boolean; message: string }> {
  return {
    order,
    verified: false,
    message:
      "Order placed and held for payment. Connect a payment gateway to complete and verify the charge server-side.",
  };
}
