import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public order tracking. The order number alone is not enough — the matching
 * customer email must be supplied, so an order number in a shared link cannot
 * expose someone else's details.
 */

const inputSchema = z.object({
  number: z.string().min(3).max(40),
  email: z.string().email(),
});

export interface TrackedOrder {
  number: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: "cod" | "online";
  total: number;
  subtotal: number;
  shipping: number;
  items: { name: string; size: string; color: string; quantity: number; unitPrice: number }[];
  address: string;
  estimatedDelivery: string;
}

export const trackOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<TrackedOrder | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select(
        "number, created_at, status, payment_status, payment_method, total, subtotal, shipping, items, shipping_address",
      )
      .eq("number", data.number.trim().toUpperCase())
      .ilike("customer_email", data.email.trim())
      .maybeSingle();

    if (error) {
      console.error("track order failed", error);
      return null;
    }
    if (!row) return null;

    const r = row as unknown as {
      number: string;
      created_at: string;
      status: string;
      payment_status: string;
      payment_method: "cod" | "online";
      total: number;
      subtotal: number;
      shipping: number;
      items: TrackedOrder["items"];
      shipping_address: Record<string, string>;
    };

    const a = r.shipping_address ?? {};
    return {
      number: r.number,
      createdAt: r.created_at,
      status: r.status,
      paymentStatus: r.payment_status,
      paymentMethod: r.payment_method,
      total: Number(r.total),
      subtotal: Number(r.subtotal),
      shipping: Number(r.shipping),
      items: Array.isArray(r.items) ? r.items : [],
      address: [a["line1"], a["city"], a["postalCode"], a["state"], a["country"]]
        .filter(Boolean)
        .join(", "),
      estimatedDelivery: new Date(
        new Date(r.created_at).getTime() + 5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };
  });
