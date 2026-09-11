import type {
  Category,
  Coupon,
  Customer,
  Order,
  Product,
  ProductVariant,
} from "@/lib/types";

import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import editorial1 from "@/assets/editorial-1.jpg";
import editorial2 from "@/assets/editorial-2.jpg";
import story from "@/assets/story.jpg";
import model1 from "@/assets/model-1.jpg";
import model2 from "@/assets/model-2.jpg";
import model3 from "@/assets/model-3.jpg";
import model4 from "@/assets/model-4.jpg";
import model5 from "@/assets/model-5.jpg";
import model6 from "@/assets/model-6.jpg";
import model7 from "@/assets/model-7.jpg";
import model8 from "@/assets/model-8.jpg";

export const BRAND = {
  name: "UNTKN",
  short: "UNTKN",
  tagline: "Considered garments for the modern wardrobe",
};

export const editorialImages = { editorial1, editorial2, story };

export const categories: Category[] = [
  {
    id: "cat_outerwear",
    slug: "outerwear",
    name: "Outerwear",
    description: "Structured coats and jackets built for weight and drape.",
  },
  {
    id: "cat_knitwear",
    slug: "knitwear",
    name: "Knitwear",
    description: "Merino, lambswool and heavy gauge ribs.",
  },
  {
    id: "cat_tops",
    slug: "tops",
    name: "Tops",
    description: "Boxy jersey and shirting in natural fibres.",
  },
  {
    id: "cat_bottoms",
    slug: "bottoms",
    name: "Bottoms",
    description: "Pleated, wide and utility cuts.",
  },
];

const buildVariants = (
  sku: string,
  sizes: string[],
  colors: string[],
  stockMap: Record<string, number> = {},
): ProductVariant[] =>
  colors.flatMap((color) =>
    sizes.map((size) => ({
      id: `${sku}-${color}-${size}`.toLowerCase().replace(/\s+/g, "-"),
      sku: `${sku}-${color.slice(0, 2).toUpperCase()}-${size}`,
      size,
      color,
      stock: stockMap[`${color}/${size}`] ?? 8,
    })),
  );

const CLOTHING = ["XS", "S", "M", "L", "XL"];

export const products: Product[] = [
  {
    id: "prd_01",
    slug: "structured-wool-overcoat",
    name: "Structured Wool Overcoat",
    categoryId: "cat_outerwear",
    gender: "men",
    price: 890,
    salePrice: null,
    currency: "INR",
    shortDescription:
      "A full-length overcoat cut from a dense Italian wool melton with a softly rounded shoulder.",
    details:
      "Single-breasted with a two-button closure, welted hip pockets and an interior pocket. Unlined body with bound seams for a lighter hand. Falls below the knee on most frames.",
    materials: "82% virgin wool, 18% polyamide. Cupro sleeve lining. Made in Portugal.",
    care: "Dry clean only. Steam to release creasing. Store on a broad hanger.",
    images: [p1, model1, editorial1, p7],
    colors: [
      { name: "Charcoal", hex: "#39393a" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: CLOTHING,
    variants: buildVariants("AN-OVC", CLOTHING, ["Charcoal", "Black"], {
      "Charcoal/XS": 2,
      "Charcoal/S": 3,
      "Black/XL": 0,
    }),
    featured: true,
    published: true,
    createdAt: "2026-08-02",
    tags: ["coat", "wool", "winter", "outerwear"],
  },
  {
    id: "prd_02",
    slug: "heavyweight-boxy-tee",
    name: "Heavyweight Boxy Tee",
    categoryId: "cat_tops",
    gender: "unisex",
    price: 120,
    salePrice: null,
    currency: "INR",
    shortDescription:
      "A 280gsm compact cotton jersey tee with a dropped shoulder and a clean rib collar.",
    details:
      "Garment washed for a settled hand. Boxy through the body with a straight hem. Runs true to size; size down for a closer fit.",
    materials: "100% organic long-staple cotton, 280gsm. Made in Portugal.",
    care: "Machine wash cold, tumble dry low, warm iron if needed.",
    images: [p2, model2, editorial1],
    colors: [
      { name: "Ecru", hex: "#efe9de" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: CLOTHING,
    variants: buildVariants("AN-TEE", CLOTHING, ["Ecru", "Black"], {
      "Ecru/S": 1,
    }),
    featured: true,
    published: true,
    createdAt: "2026-08-20",
    tags: ["tee", "cotton", "jersey", "essential"],
  },
  {
    id: "prd_03",
    slug: "pleated-wide-trouser",
    name: "Pleated Wide Trouser",
    categoryId: "cat_bottoms",
    gender: "women",
    price: 320,
    salePrice: null,
    currency: "INR",
    shortDescription:
      "Double-pleated trousers in a fluid wool blend, cut wide from the hip to a full break.",
    details:
      "High rise with a hook-and-bar closure, side seam pockets and one jetted back pocket. Unfinished hem available in store.",
    materials: "70% wool, 28% viscose, 2% elastane. Made in Italy.",
    care: "Dry clean recommended.",
    images: [p3, model3, editorial2],
    colors: [{ name: "Black", hex: "#111111" }],
    sizes: CLOTHING,
    variants: buildVariants("AN-TRS", CLOTHING, ["Black"], { "Black/M": 2 }),
    featured: true,
    published: true,
    createdAt: "2026-07-14",
    tags: ["trouser", "tailoring", "wide leg"],
  },
  {
    id: "prd_04",
    slug: "cropped-technical-bomber",
    name: "Cropped Technical Bomber",
    categoryId: "cat_outerwear",
    gender: "men",
    price: 540,
    salePrice: 430,
    currency: "INR",
    shortDescription:
      "A cropped bomber in matte technical nylon with ribbed trims and a two-way zip.",
    details:
      "Lightly padded body, sleeve utility pocket and elasticated cuffs. Water repellent finish.",
    materials: "100% recycled nylon shell, recycled polyester fill.",
    care: "Machine wash cold on a gentle cycle. Do not tumble dry.",
    images: [p4, model4, editorial2],
    colors: [{ name: "Black", hex: "#111111" }],
    sizes: CLOTHING,
    variants: buildVariants("AN-BMB", CLOTHING, ["Black"], {
      "Black/XS": 0,
      "Black/S": 1,
    }),
    featured: false,
    published: true,
    createdAt: "2026-06-30",
    tags: ["jacket", "bomber", "nylon", "sale"],
  },
  {
    id: "prd_05",
    slug: "ribbed-wool-turtleneck",
    name: "Ribbed Wool Turtleneck",
    categoryId: "cat_knitwear",
    gender: "women",
    price: 260,
    salePrice: null,
    currency: "INR",
    shortDescription:
      "A fine-gauge rib turtleneck in undyed lambswool with a fitted body.",
    details: "Fully fashioned shoulders, ribbed cuffs and hem, tall folded collar.",
    materials: "100% lambswool. Made in Scotland.",
    care: "Hand wash cold or dry clean. Dry flat.",
    images: [p5, model5, editorial1],
    colors: [
      { name: "Cream", hex: "#f2ece0" },
      { name: "Charcoal", hex: "#39393a" },
    ],
    sizes: CLOTHING,
    variants: buildVariants("AN-TRT", CLOTHING, ["Cream", "Charcoal"]),
    featured: true,
    published: true,
    createdAt: "2026-08-28",
    tags: ["knit", "turtleneck", "wool"],
  },
  {
    id: "prd_06",
    slug: "utility-cargo-pant",
    name: "Utility Cargo Pant",
    categoryId: "cat_bottoms",
    gender: "men",
    price: 290,
    salePrice: 230,
    currency: "INR",
    shortDescription:
      "A relaxed cargo in washed cotton twill with bellowed leg pockets.",
    details: "Straight leg, mid rise, tonal hardware, reinforced knee seams.",
    materials: "100% cotton twill, garment dyed.",
    care: "Machine wash cold with like colours.",
    images: [p6, model6, editorial2],
    colors: [
      { name: "Stone", hex: "#9a9a97" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: CLOTHING,
    variants: buildVariants("AN-CRG", CLOTHING, ["Stone", "Black"], {
      "Stone/L": 2,
    }),
    featured: false,
    published: true,
    createdAt: "2026-09-01",
    tags: ["cargo", "pant", "utility", "cotton"],
  },
  {
    id: "prd_07",
    slug: "oversized-shirt-jacket",
    name: "Oversized Shirt Jacket",
    categoryId: "cat_outerwear",
    gender: "unisex",
    price: 380,
    salePrice: null,
    currency: "INR",
    shortDescription:
      "A mid-weight overshirt in brushed cotton, sized to layer over knitwear.",
    details: "Camp collar, chest patch pocket, curved hem, corozo buttons.",
    materials: "100% brushed cotton twill.",
    care: "Machine wash cold, warm iron.",
    images: [p7, model7, editorial1],
    colors: [{ name: "Taupe", hex: "#9c8b7d" }],
    sizes: CLOTHING,
    variants: buildVariants("AN-OSH", CLOTHING, ["Taupe"]),
    featured: false,
    published: true,
    createdAt: "2026-09-04",
    tags: ["overshirt", "shacket", "cotton"],
  },
  {
    id: "prd_08",
    slug: "merino-crewneck",
    name: "Merino Crewneck",
    categoryId: "cat_knitwear",
    gender: "unisex",
    price: 240,
    salePrice: null,
    currency: "INR",
    shortDescription:
      "An everyday crewneck knitted from extra-fine merino with a clean neckline.",
    details: "Regular fit, ribbed trims, fully fashioned seams.",
    materials: "100% extra-fine merino wool.",
    care: "Hand wash cold. Dry flat.",
    images: [p8, model8, editorial2],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Cream", hex: "#f2ece0" },
    ],
    sizes: CLOTHING,
    variants: buildVariants("AN-CRW", CLOTHING, ["Black", "Cream"], {
      "Black/M": 3,
    }),
    featured: true,
    published: true,
    createdAt: "2026-09-06",
    tags: ["knit", "merino", "crewneck"],
  },
];

/* ------------------------------------------------------------------ */
/* Repository layer — the only surface the UI touches.                 */
/* Swap the bodies for API/database calls without changing components. */
/* ------------------------------------------------------------------ */

export const listProducts = () => products.filter((p) => p.published);

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug && p.published) ?? null;

export const getProductById = (id: string) =>
  products.find((p) => p.id === id) ?? null;

export const getCategory = (id: string) =>
  categories.find((c) => c.id === id) ?? null;

export const featuredProducts = () => listProducts().filter((p) => p.featured);

export const newArrivals = (limit = 4) =>
  [...listProducts()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);

export const relatedProducts = (product: Product, limit = 4) =>
  listProducts()
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .concat(listProducts().filter((p) => p.categoryId !== product.categoryId))
    .slice(0, limit);

export const effectivePrice = (product: Product) => product.salePrice ?? product.price;

export const variantStock = (product: Product, color: string, size: string) =>
  product.variants.find((v) => v.color === color && v.size === size)?.stock ?? 0;

export const totalStock = (product: Product) =>
  product.variants.reduce((sum, v) => sum + v.stock, 0);

export const searchProducts = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return listProducts().filter((p) => {
    const category = getCategory(p.categoryId)?.name ?? "";
    return [p.name, category, p.shortDescription, ...p.tags, ...p.colors.map((c) => c.name)]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
};

/* ---- Sample operational data (admin + account views) ---- */

const sampleAddress = {
  id: "adr_01",
  label: "Home",
  fullName: "Ira Menon",
  phone: "+91 98200 11223",
  line1: "14 Sassoon Dock, Colaba",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  postalCode: "400005",
  isDefault: true,
};

export const sampleOrders: Order[] = [
  {
    id: "ord_1042",
    number: "AN-1042",
    customerName: "Ira Menon",
    customerEmail: "ira@example.com",
    createdAt: "2026-09-05",
    items: [
      {
        productId: "prd_01",
        name: "Structured Wool Overcoat",
        image: p1,
        size: "M",
        color: "Charcoal",
        quantity: 1,
        unitPrice: 890,
      },
    ],
    subtotal: 890,
    shipping: 0,
    discount: 0,
    total: 890,
    status: "shipped",
    paymentStatus: "paid",
    paymentProvider: "razorpay",
    paymentReference: "pay_sample_1042",
    shippingAddress: sampleAddress,
    estimatedDelivery: "2026-09-12",
  },
  {
    id: "ord_1041",
    number: "AN-1041",
    customerName: "Devan Rao",
    customerEmail: "devan@example.com",
    createdAt: "2026-09-03",
    items: [
      {
        productId: "prd_05",
        name: "Ribbed Wool Turtleneck",
        image: p5,
        size: "S",
        color: "Cream",
        quantity: 2,
        unitPrice: 260,
      },
    ],
    subtotal: 520,
    shipping: 20,
    discount: 52,
    total: 488,
    status: "processing",
    paymentStatus: "paid",
    paymentProvider: "stripe",
    paymentReference: "pi_sample_1041",
    shippingAddress: { ...sampleAddress, fullName: "Devan Rao", city: "Bengaluru" },
    estimatedDelivery: "2026-09-11",
  },
  {
    id: "ord_1040",
    number: "AN-1040",
    customerName: "Lena Fischer",
    customerEmail: "lena@example.com",
    createdAt: "2026-08-29",
    items: [
      {
        productId: "prd_04",
        name: "Cropped Technical Bomber",
        image: p4,
        size: "L",
        color: "Black",
        quantity: 1,
        unitPrice: 430,
      },
    ],
    subtotal: 430,
    shipping: 20,
    discount: 0,
    total: 450,
    status: "pending",
    paymentStatus: "awaiting_payment",
    paymentProvider: null,
    paymentReference: null,
    shippingAddress: { ...sampleAddress, fullName: "Lena Fischer", country: "Germany" },
    estimatedDelivery: "2026-09-08",
  },
];

export const sampleCustomers: Customer[] = [
  {
    id: "cus_01",
    name: "Ira Menon",
    email: "ira@example.com",
    joinedAt: "2025-11-04",
    orders: 6,
    spend: 4120,
  },
  {
    id: "cus_02",
    name: "Devan Rao",
    email: "devan@example.com",
    joinedAt: "2026-02-18",
    orders: 3,
    spend: 1480,
  },
  {
    id: "cus_03",
    name: "Lena Fischer",
    email: "lena@example.com",
    joinedAt: "2026-05-22",
    orders: 1,
    spend: 450,
  },
];

export const sampleCoupons: Coupon[] = [
  {
    id: "cpn_01",
    code: "UNTKN10",
    type: "percent",
    value: 10,
    expiresAt: "2026-12-31",
    usageLimit: 500,
    used: 84,
    active: true,
  },
  {
    id: "cpn_02",
    code: "WELCOME50",
    type: "fixed",
    value: 50,
    expiresAt: "2026-10-31",
    usageLimit: 200,
    used: 61,
    active: true,
  },
];

export const findCoupon = (code: string) =>
  sampleCoupons.find(
    (c) => c.active && c.code.toLowerCase() === code.trim().toLowerCase(),
  ) ?? null;
