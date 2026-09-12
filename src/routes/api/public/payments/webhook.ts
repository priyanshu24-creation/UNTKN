import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookSecret = process.env["RAZORPAY_WEBHOOK_SECRET"];
        if (!webhookSecret) return new Response("Webhook is not configured", { status: 503 });

        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const { createHmac, timingSafeEqual } = await import("node:crypto");
        const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
        const valid =
          expected.length === signature.length &&
          timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
        if (!valid) return new Response("Invalid signature", { status: 401 });

        const payload = JSON.parse(rawBody) as {
          event?: string;
          payload?: {
            payment?: { entity?: { id?: string; order_id?: string; status?: string } };
            order?: { entity?: { id?: string } };
          };
        };
        const payment = payload.payload?.payment?.entity;
        const gatewayOrderId = payment?.order_id ?? payload.payload?.order?.entity?.id;
        const paymentId = payment?.id;
        const isPaidEvent = payload.event === "payment.captured" || payload.event === "order.paid";
        if (!isPaidEvent || !gatewayOrderId || !paymentId) return Response.json({ received: true });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("orders")
          .update({ payment_status: "paid", payment_reference: paymentId })
          .eq("payment_provider", "razorpay")
          .eq("payment_reference", gatewayOrderId)
          .eq("payment_status", "awaiting_payment");
        if (error) {
          console.error("Razorpay webhook order update failed", error);
          return new Response("Could not update order", { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});