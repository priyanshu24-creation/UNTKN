import { useEffect, useState } from "react";
import { fetchStorefrontProducts } from "@/lib/store-products";
import type { Category, Product } from "@/lib/types";

/**
 * Storefront catalogue. The live products created in the admin panel are the
 * only source of truth. The storefront stays empty until real product details
 * are published by an administrator.
 */
export function useLiveProducts(): {
  products: Product[];
  categories: Category[];
  loading: boolean;
} {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchStorefrontProducts()
      .then(({ products: rows, categories: dbCategories }) => {
        if (!active) return;
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
