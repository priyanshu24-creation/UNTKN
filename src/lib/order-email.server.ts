/**
 * Order confirmation email.
 *
 * Sends through the project's app-email templates when they have been
 * scaffolded (which requires a verified sender domain). Until then this is a
 * no-op so order placement never fails because email is not configured yet.
 */

export interface OrderEmailPayload {
  orderId: string;
  number: string;
  to: string;
  customerName: string;
  items: { name: string; size: string; color: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: "cod" | "online";
  trackingUrl: string;
  address: string;
}

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload,
): Promise<boolean> {
  try {
    // Present only once app emails are scaffolded for a verified domain.
    const modulePath = "@/lib/email-templates/send-email";
    const mod = (await import(/* @vite-ignore */ modulePath).catch(() => null)) as
      | {
          sendTemplateEmail: (
            template: string,
            to: string,
            options: { templateData: Record<string, unknown>; idempotencyKey: string },
          ) => Promise<{ sent: boolean }>;
        }
      | null;

    if (!mod?.sendTemplateEmail) return false;

    const result = await mod.sendTemplateEmail("order-confirmation", payload.to, {
      templateData: {
        number: payload.number,
        customerName: payload.customerName,
        items: payload.items,
        subtotal: payload.subtotal,
        shipping: payload.shipping,
        total: payload.total,
        paymentMethod: payload.paymentMethod,
        trackingUrl: payload.trackingUrl,
        address: payload.address,
      },
      idempotencyKey: `order-confirmation-${payload.orderId}`,
    });
    return result.sent;
  } catch (error) {
    console.error("order confirmation email failed", error);
    return false;
  }
}
