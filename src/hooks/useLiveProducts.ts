import { useEffect, useState } from "react";
import { categories as staticCategories, listProducts } from "@/data/catalog";
import { fetchStorefrontProducts } from "@/lib/store-products";
import type { Category, Product } from "@/lib/types";

/**
 * Storefront catalogue. The live products created in the admin panel are the
 * source of truth; the built-in sample pieces are only a fallback for an
 * empty store.
 */
export function useLiveProducts(): {
  products: Product[];
  categories: Category[];
  loading: boolean;
} {
  const [products, setProducts] = useState<Product[]>(() => listProducts());
  const [categories, setCategories] = useState<Category[]>(staticCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchStorefrontProducts()
      .then(({ products: rows, categories: dbCategories }) => {
        if (!active || rows.length === 0) return;
        setProducts(rows);
        setCategories(
          dbCategories.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            description: c.description,
          })),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { products, categories, loading };
}
