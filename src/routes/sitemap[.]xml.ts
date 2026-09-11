import { createFileRoute } from "@tanstack/react-router";
import { listProducts } from "@/data/catalog";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const staticPaths = ["/", "/shop", "/lookbook", "/about", "/login", "/register"];
        const productPaths = listProducts().map((p) => `/product/${p.slug}`);

        const urls = [...staticPaths, ...productPaths]
          .map(
            (path) =>
              `  <url><loc>${origin}${path}</loc><changefreq>weekly</changefreq></url>`,
          )
          .join("\n");

        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
          { headers: { "Content-Type": "application/xml" } },
        );
      },
    },
  },
});
