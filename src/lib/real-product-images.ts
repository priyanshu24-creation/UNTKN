import { productImageUrl } from "@/lib/store-products";

export const realProductImages = {
  miseryProduct: productImageUrl("real-products/misery-world-product-front.jpeg"),
  miseryPortrait: productImageUrl("real-products/misery-world-lifestyle-portrait.jpeg"),
  miserySeated: productImageUrl("real-products/misery-world-lifestyle-seated.jpeg"),
  miseryWall: productImageUrl("real-products/misery-world-lifestyle-wall.jpeg"),
  miseryOverhead: productImageUrl("real-products/misery-world-lifestyle-overhead.jpeg"),
  dragonProduct: productImageUrl("real-products/dragon-flame-product-front.jpeg"),
  dragonGraffiti: productImageUrl("real-products/dragon-flame-lifestyle-graffiti.jpeg"),
  dragonStairs: productImageUrl("real-products/dragon-flame-lifestyle-stairs.jpeg"),
} as const;

export const realProductGallery = Object.values(realProductImages);