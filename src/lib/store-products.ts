import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";

export interface DbCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface DbProduct {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  gender: string;
  price: number;
  sale_price: number | null;
  currency: string;
  short_description: string;
  details: string;
  materials: string;
  care: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock: number;
  tags: string[];
  featured: boolean;
  published: boolean;
  created_at: string;
}

/** Storage path -> public URL served by the image proxy route. */
export const productImageUrl = (path: string) =>
  path.startsWith("http") ? path : `/api/public/product-image?path=${encodeURIComponent(path)}`;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeGender = (value: string): Product["gender"] => {
  const v = value?.toLowerCase();
  if (v === "men" || v === "women" || v === "unisex") return v;
  return "unisex";
};

/** Maps a database row into the shared storefront product shape. */
export function toStoreProduct(row: DbProduct, categories: DbCategory[]): Product {
  const sizes = row.sizes.length > 0 ? row.sizes : ["One size"];
  const colors = row.colors.length > 0 ? row.colors : [{ name: "Default", hex: "#111111" }];
  const perVariant = Math.max(0, Math.floor(row.stock / (sizes.length * colors.length)));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id ?? categories[0]?.id ?? "uncategorised",
    gender: normalizeGender(row.gender),
    price: Number(row.price),
    salePrice: row.sale_price === null ? null : Number(row.sale_price),
    currency: row.currency,
    shortDescription: row.short_description,
    details: row.details,
    materials: row.materials,
    care: row.care,
    images: row.images.length > 0 ? row.images.map(productImageUrl) : [],
    colors,
    sizes,
    variants: colors.flatMap((color) =>
      sizes.map((size) => ({
        id: `${row.id}-${color.name}-${size}`,
        sku: `${row.slug}-${color.name}-${size}`.toUpperCase(),
        size,
        color: color.name,
        stock: perVariant,
      })),
    ),
    featured: row.featured,
    published: row.published,
    createdAt: row.created_at.slice(0, 10),
    tags: row.tags,
  };
}

export async function fetchStorefrontProducts(): Promise<{
  products: Product[];
  categories: DbCategory[];
}> {
  const [{ data: rows }, { data: cats }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  const categories = (cats ?? []) as DbCategory[];
  const products = ((rows ?? []) as unknown as DbProduct[]).map((r) =>
    toStoreProduct(r, categories),
  );
  return { products, categories };
}
