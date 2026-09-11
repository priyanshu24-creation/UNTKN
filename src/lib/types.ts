/**
 * Domain model for the storefront.
 *
 * These interfaces mirror the intended relational schema (users, roles,
 * products, product_images, variants, orders, order_items, payments,
 * addresses, coupons, wishlist). The UI reads them exclusively through the
 * repository functions in `src/data/catalog.ts`, so swapping the sample data
 * for a real API/database is a single-layer change.
 */

export type Role = "customer" | "admin";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
}

export type ProductGender = "men" | "women" | "unisex";

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  gender: ProductGender;
  price: number;
  salePrice: number | null;
  currency: string;
  shortDescription: string;
  details: string;
  materials: string;
  care: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  variants: ProductVariant[];
  featured: boolean;
  published: boolean;
  createdAt: string;
  tags: string[];
}

export interface CartLine {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  size: string;
  color: string;
  quantity: number;
  maxQuantity: number;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "awaiting_payment"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: "cod" | "online";
  paymentProvider: string | null;
  paymentReference: string | null;
  shippingAddress: Address;
  estimatedDelivery: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  expiresAt: string;
  usageLimit: number;
  used: number;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  orders: number;
  spend: number;
}
