import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Order placement.
 *
 * The browser never decides money or payment state. This server function
 * re-prices every line against the catalogue, computes the totals, and stores
 * the order. Cash on delivery orders are recorded as `cod_pending` (collected
 * by the courier); online orders stay `awaiting_payment` until a verified
 * gateway webhook marks them paid.
 */

const lineSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(200),
  image: z.string().max(600).default(""),
  size: z.string().max(40).default(""),
  color: z.string().max(40).default(""),
  quantity: z.number().int().min(1).max(20),
  unitPrice: z.number().min(0).max(1_000_000),
});

const inputSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(5).max(30),
  fullName: z.string().min(1).max(120),
  address: z.object({
    line1: z.string().min(1).max(200),
    city: z.string().min(1).max(80),
    state: z.string().min(1).max(80),
    country: z.string().min(1).max(80),
    postalCode: z.string().min(3).max(20),
  }),
  lines: z.array(lineSchema).min(1).max(50),
  paymentMethod: z.enum(["cod", "online"]),
});

export type PlaceOrderInput = z.infer<typeof inputSchema>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Free delivery above ₹2,499; flat ₹99 below that. COD adds a ₹49 handling fee. */
export const SHIPPING_FLAT = 99;
export const FREE_SHIPPING_ABOVE = 2499;
export const COD_FEE = 49;

export const placeOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Re-price from the catalogue wherever the line points at a real product.
    const ids = data.lines.map((l) => l.productId).filter((id) => UUID.test(id));
    const priceById = new Map<string, number>();
    if (ids.length > 0) {
      const { data: rows } = await supabaseAdmin
        .from("products")
        .select("id, price, sale_price")
        .in("id", ids);
      for (const row of rows ?? []) {
        const r = row as { id: string; price: number; sale_price: number | null };
        priceById.set(r.id, Number(r.sale_price ?? r.price));
      }
    }

    const items = data.lines.map((l) => ({
      ...l,
      unitPrice: priceById.get(l.productId) ?? l.unitPrice,
    }));

    const subtotal = items.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const shipping =
      subtotal >= FREE_SHIPPING_ABOVE || subtotal === 0 ? 0 : SHIPPING_FLAT;
    const codFee = data.paymentMethod === "cod" ? COD_FEE : 0;
    const total = subtotal + shipping + codFee;

    const number = `UN-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const shippingAddress = {
      id: "adr_checkout",
      label: "Shipping",
      fullName: data.fullName,
      phone: data.phone,
      ...data.address,
      isDefault: true,
    };

    const { data: inserted, error } = await supabaseAdmin
      .from("orders")
      .insert({
        number,
        customer_name: data.fullName,
        customer_email: data.email,
        customer_phone: data.phone,
        shipping_address: shippingAddress,
        items,
        subtotal,
        shipping: shipping + codFee,
        discount: 0,
        total,
        status: "pending",
        payment_status: data.paymentMethod === "cod" ? "awaiting_payment" : "awaiting_payment",
        payment_method: data.paymentMethod,
        payment_provider: data.paymentMethod === "cod" ? "cash_on_delivery" : null,
      } as never)
      .select("id, number, created_at")
      .single();

    if (error || !inserted) {
      console.error("order insert failed", error);
      throw new Error("Could not place the order");
    }

    const row = inserted as unknown as { id: string; number: string; created_at: string };
    const eta = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const origin = (() => {
      try {
        return new URL(getRequest().url).origin;
      } catch {
        return "";
      }
    })();
    const trackingUrl = `${origin}/track?order=${encodeURIComponent(row.number)}&email=${encodeURIComponent(data.email)}`;

    // Order confirmation email (best effort — never blocks the order).
    let emailed = false;
    try {
      const { sendOrderConfirmationEmail } = await import("./order-email.server");
      emailed = await sendOrderConfirmationEmail({
        orderId: row.id,
        number: row.number,
        to: data.email,
        customerName: data.fullName,
        items,
        subtotal,
        shipping: shipping + codFee,
        total,
        paymentMethod: data.paymentMethod,
        trackingUrl,
        address: `${shippingAddress.line1}, ${shippingAddress.city} ${shippingAddress.postalCode}, ${shippingAddress.state}, ${shippingAddress.country}`,
      });
    } catch (err) {
      console.error("order email failed", err);
    }

    return {
      id: row.id,
      number: row.number,
      createdAt: row.created_at,
      subtotal,
      shipping: shipping + codFee,
      total,
      paymentMethod: data.paymentMethod,
      estimatedDelivery: eta,
      trackingUrl,
      shippingAddress,
      items,
      emailed,
    };
  });
