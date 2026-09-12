import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderInput = z.object({ orderId: z.string().uuid() });

const razorpayCredentials = () => {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  return { keyId, keySecret };
};

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { keyId, keySecret } = razorpayCredentials();
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, number, total, payment_method, payment_status")
      .eq("id", data.orderId)
      .single();

    if (error || !order || order.payment_method !== "online") {
      throw new Error("Online payment is unavailable for this order.");
    }
    if (order.payment_status === "paid") throw new Error("This order has already been paid.");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(Number(order.total) * 100),
        currency: "INR",
        receipt: order.number,
        notes: { order_id: order.id },
      }),
    });
    const gatewayOrder = (await response.json()) as { id?: string; error?: { description?: string } };
    if (!response.ok || !gatewayOrder.id) {
      console.error("Razorpay order creation failed", gatewayOrder);
      throw new Error(gatewayOrder.error?.description ?? "Could not start online payment.");
    }

    await supabaseAdmin
      .from("orders")
      .update({ payment_provider: "razorpay", payment_reference: gatewayOrder.id })
      .eq("id", order.id);

    return {
      keyId,
      orderId: gatewayOrder.id,
      amount: Math.round(Number(order.total) * 100),
      currency: "INR",
      name: "UNTKN",
      description: `Order ${order.number}`,
    };
  });

const verifyInput = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifyInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { keySecret } = razorpayCredentials();
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, payment_reference, payment_status")
      .eq("id", data.orderId)
      .single();
    if (error || !order || order.payment_reference !== data.razorpayOrderId) {
      throw new Error("Payment order could not be matched.");
    }

    const { createHmac, timingSafeEqual } = await import("node:crypto");
    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest("hex");
    const valid =
      expected.length === data.razorpaySignature.length &&
      timingSafeEqual(Buffer.from(expected), Buffer.from(data.razorpaySignature));
    if (!valid) throw new Error("Payment verification failed.");

    if (order.payment_status !== "paid") {
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({ payment_status: "paid", payment_reference: data.razorpayPaymentId })
        .eq("id", data.orderId)
        .eq("payment_reference", data.razorpayOrderId);
      if (updateError) throw new Error("Could not update payment status.");
    }
    return { verified: true, paymentReference: data.razorpayPaymentId };
  });