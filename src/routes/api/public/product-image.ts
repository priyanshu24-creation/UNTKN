import { createFileRoute } from "@tanstack/react-router";

/**
 * Public read-only proxy for product photos stored in the private
 * `product-images` bucket. Keeps the bucket private while letting the
 * storefront render images without a session.
 */
export const Route = createFileRoute("/api/public/product-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const path = new URL(request.url).searchParams.get("path") ?? "";
        if (!path || path.includes("..") || path.startsWith("/")) {
          return new Response("Invalid path", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("product-images")
          .download(path);

        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(data, {
          headers: {
            "content-type": data.type || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
