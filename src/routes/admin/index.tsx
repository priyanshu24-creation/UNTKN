import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/store/shop";
import { currency as formatCurrency } from "@/lib/format";
import { productImageUrl, slugify, type DbCategory, type DbProduct } from "@/lib/store-products";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — UNTKN" },
      { name: "description", content: "Manage the UNTKN catalogue, categories and orders." },
      { property: "og:title", content: "Admin — UNTKN" },
      { property: "og:description", content: "Manage products, categories and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const TABS = ["Dashboard", "Products", "Categories", "Orders"] as const;
type Tab = (typeof TABS)[number];

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const emptyForm = {
  id: "",
  name: "",
  slug: "",
  category_id: "",
  gender: "unisex",
  price: "",
  sale_price: "",
  short_description: "",
  details: "",
  materials: "",
  care: "",
  sizes: "XS, S, M, L, XL",
  colors: "Black #111111",
  stock: "10",
  tags: "",
  featured: false,
  published: true,
  images: [] as string[],
};
type Form = typeof emptyForm;

const field =
  "mt-1 w-full border-b border-border bg-transparent py-2.5 text-sm outline-none transition-colors focus:border-gallery-ink";
const label = "text-[10px] font-medium uppercase text-muted-foreground";

function Admin() {
  const { session, authReady } = useShop();
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  /** null = still verifying with the backend. */
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, c, o] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    setProducts((p.data ?? []) as unknown as DbProduct[]);
    setCategories((c.data ?? []) as unknown as DbCategory[]);
    setOrders((o.data ?? []) as unknown as OrderRow[]);
    setLoading(false);
  }, []);

  // Never trust the locally cached role: re-check it against the backend.
  useEffect(() => {
    let cancelled = false;
    if (!authReady) return;
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        if (!cancelled) setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      setIsAdmin(!error && Boolean(data));
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, session?.id]);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  if (!authReady || isAdmin === null) {
    return (
      <Shell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading
        </div>
      </Shell>
    );
  }

  if (!isAdmin) {
    return (
      <Shell>
        <div className="max-w-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            UNTKN Admin
          </p>
          <h1 className="mt-3 font-editorial text-4xl">Restricted</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            This area is for UNTKN staff. Sign in with an administrator account to continue.
          </p>
          <Button
            asChild
            className="mt-8 h-12 rounded-none bg-gallery-ink px-8 text-[10px] uppercase text-primary-foreground"
          >
            <Link to="/admin/login">Staff sign in</Link>
          </Button>
          <p className="mt-5 text-xs text-muted-foreground">
            Customer?{" "}
            <Link to="/login" className="underline underline-offset-4 hover:text-gallery-ink">
              Sign in here
            </Link>
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={label}>UNTKN</p>
          <h1 className="font-editorial text-4xl md:text-5xl">Admin panel</h1>
        </div>
        <p className="text-xs text-muted-foreground">Signed in as {session?.email}</p>
      </div>

      <nav className="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 border px-5 py-2.5 text-[10px] uppercase transition-colors ${
              tab === t
                ? "border-gallery-ink bg-gallery-ink text-primary-foreground"
                : "border-border text-muted-foreground hover:border-gallery-ink hover:text-gallery-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading data
        </div>
      ) : (
        <>
          {tab === "Dashboard" && <Dashboard products={products} orders={orders} />}
          {tab === "Products" && (
            <Products products={products} categories={categories} reload={load} />
          )}
          {tab === "Categories" && <Categories categories={categories} reload={load} />}
          {tab === "Orders" && <Orders orders={orders} reload={load} />}
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gallery font-fashion text-gallery-ink">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-24 md:px-8 md:pt-32">{children}</main>
    </div>
  );
}

function Dashboard({ products, orders }: { products: DbProduct[]; orders: OrderRow[] }) {
  const revenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const customers = new Set(orders.map((o) => o.customer_email)).size;
  const stats = [
    { label: "Products", value: String(products.length) },
    { label: "Published", value: String(products.filter((p) => p.published).length) },
    { label: "Orders", value: String(orders.length) },
    { label: "Customers", value: String(customers) },
    { label: "Revenue", value: formatCurrency(revenue) },
    {
      label: "Awaiting action",
      value: String(orders.filter((o) => o.status === "pending").length),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-card p-6">
          <p className={label}>{s.label}</p>
          <p className="mt-3 font-editorial text-3xl">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function Products({
  products,
  categories,
  reload,
}: {
  products: DbProduct[];
  categories: DbCategory[];
  reload: () => Promise<void>;
}) {
  const [form, setForm] = useState<Form | null>(null);
  const [genderFilter, setGenderFilter] = useState<"all" | "women" | "men" | "unisex">("all");
  const visibleProducts =
    genderFilter === "all"
      ? products
      : products.filter((p) => (p.gender ?? "unisex") === genderFilter);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const startNew = () =>
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" });

  const startEdit = (p: DbProduct) =>
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category_id: p.category_id ?? "",
      gender: p.gender ?? "unisex",
      price: String(p.price),
      sale_price: p.sale_price === null ? "" : String(p.sale_price),
      short_description: p.short_description,
      details: p.details,
      materials: p.materials,
      care: p.care,
      sizes: p.sizes.join(", "),
      colors: p.colors.map((c) => `${c.name} ${c.hex}`).join(", "),
      stock: String(p.stock),
      tags: p.tags.join(", "),
      featured: p.featured,
      published: p.published,
      images: p.images,
    });

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !form) return;
    setUploading(true);
    const paths: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${slugify(form.slug || form.name || "product")}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) {
        toast.error(error.message);
        continue;
      }
      paths.push(path);
    }
    setUploading(false);
    if (paths.length > 0) {
      set("images", [...form.images, ...paths]);
      toast.success(`${paths.length} image(s) uploaded`);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = async () => {
    if (!form) return;
    if (!form.name.trim() || !form.price) {
      toast.error("A name and price are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      category_id: form.category_id || null,
      gender: form.gender,
      price: Number(form.price),
      sale_price: form.sale_price === "" ? null : Number(form.sale_price),
      short_description: form.short_description,
      details: form.details,
      materials: form.materials,
      care: form.care,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => {
          const parts = c.split(/\s+/);
          const hex = parts.length > 1 ? parts[parts.length - 1]! : "#111111";
          const name = parts.length > 1 ? parts.slice(0, -1).join(" ") : c;
          return { name, hex: hex.startsWith("#") ? hex : `#${hex}` };
        }),
      stock: Number(form.stock || 0),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      featured: form.featured,
      published: form.published,
      images: form.images,
    };

    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.id ? "Product updated" : "Product created");
    setForm(null);
    await reload();
  };

  const remove = async (p: DbProduct) => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Product deleted");
    await reload();
  };

  if (form) {
    return (
      <div className="max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-editorial text-3xl">{form.id ? "Edit product" : "New product"}</h2>
          <Button
            variant="ghost"
            onClick={() => setForm(null)}
            className="text-[10px] uppercase"
          >
            Cancel
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={label}>Product name</span>
            <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className="block">
            <span className={label}>URL slug (optional)</span>
            <input
              className={field}
              placeholder={slugify(form.name)}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
          </label>
          <label className="block">
            <span className={label}>Category</span>
            <select
              className={field}
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>Gender</span>
            <select
              className={field}
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
            </select>
          </label>
          <label className="block">
            <span className={label}>Price</span>
            <input
              className={field}
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </label>
          <label className="block">
            <span className={label}>Sale price (optional)</span>
            <input
              className={field}
              type="number"
              min="0"
              value={form.sale_price}
              onChange={(e) => set("sale_price", e.target.value)}
            />
          </label>
          <label className="block">
            <span className={label}>Stock quantity</span>
            <input
              className={field}
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
            />
          </label>
          <label className="block">
            <span className={label}>Sizes (comma separated)</span>
            <input className={field} value={form.sizes} onChange={(e) => set("sizes", e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Colours — name then hex, comma separated</span>
            <input
              className={field}
              placeholder="Black #111111, Cream #f2ece0"
              value={form.colors}
              onChange={(e) => set("colors", e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Short description</span>
            <textarea
              className={`${field} min-h-20 resize-y`}
              value={form.short_description}
              onChange={(e) => set("short_description", e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Details</span>
            <textarea
              className={`${field} min-h-24 resize-y`}
              value={form.details}
              onChange={(e) => set("details", e.target.value)}
            />
          </label>
          <label className="block">
            <span className={label}>Materials</span>
            <input
              className={field}
              value={form.materials}
              onChange={(e) => set("materials", e.target.value)}
            />
          </label>
          <label className="block">
            <span className={label}>Care</span>
            <input className={field} value={form.care} onChange={(e) => set("care", e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Tags (comma separated)</span>
            <input className={field} value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </label>
        </div>

        <div className="mt-10">
          <p className={label}>Images</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {form.images.map((path) => (
              <div key={path} className="relative h-28 w-24 overflow-hidden border border-border">
                <img
                  src={productImageUrl(path)}
                  alt="Product"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => set("images", form.images.filter((i) => i !== path))}
                  className="absolute right-1 top-1 bg-gallery-ink/80 p-1 text-primary-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-28 w-24 flex-col items-center justify-center gap-2 border border-dashed border-border text-[10px] uppercase text-muted-foreground hover:border-gallery-ink hover:text-gallery-ink"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => void upload(e.target.files)}
            />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-xs uppercase">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Published
          </label>
          <label className="flex items-center gap-2 text-xs uppercase">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            Featured
          </label>
        </div>

        <Button
          onClick={() => void save()}
          disabled={saving}
          className="mt-10 h-12 w-full rounded-none bg-gallery-ink text-[10px] uppercase text-primary-foreground sm:w-auto sm:px-12"
        >
          {saving ? "Saving" : form.id ? "Save changes" : "Create product"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-editorial text-3xl">Products</h2>
        <Button
          onClick={startNew}
          className="h-11 rounded-none bg-gallery-ink px-6 text-[10px] uppercase text-primary-foreground"
        >
          <Plus className="mr-2 h-3 w-3" /> New
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "women", "men", "unisex"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGenderFilter(g)}
            className={`border px-4 py-2 text-[10px] uppercase transition-colors ${
              genderFilter === g
                ? "border-gallery-ink bg-gallery-ink text-primary-foreground"
                : "border-border text-muted-foreground hover:text-gallery-ink"
            }`}
          >
            {g === "all" ? "All" : g}
          </button>
        ))}
      </div>

      {visibleProducts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products yet. Add your first piece.</p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {visibleProducts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="h-16 w-14 shrink-0 overflow-hidden bg-secondary">
                {p.images[0] ? (
                  <img
                    src={productImageUrl(p.images[0])}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-40 flex-1">
                <p className="text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(Number(p.sale_price ?? p.price))} · {p.gender ?? "unisex"} ·
                  stock {p.stock} · {p.published ? "published" : "draft"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => startEdit(p)}
                  className="h-10 rounded-none bg-transparent px-5 text-[10px] uppercase"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  aria-label={`Delete ${p.name}`}
                  onClick={() => void remove(p)}
                  className="h-10 rounded-none px-3 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Categories({
  categories,
  reload,
}: {
  categories: DbCategory[];
  reload: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), slug: slugify(name), description });
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    setDescription("");
    toast.success("Category added");
    await reload();
  };

  const remove = async (c: DbCategory) => {
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await reload();
  };

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 font-editorial text-3xl">Categories</h2>
      <div className="divide-y divide-border border-y border-border">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-4 py-4">
            <div className="flex-1">
              <p className="text-sm">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.description || c.slug}</p>
            </div>
            <Button
              variant="ghost"
              aria-label={`Delete ${c.name}`}
              onClick={() => void remove(c)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={label}>New category</span>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className={label}>Description</span>
          <input
            className={field}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
      </div>
      <Button
        onClick={() => void add()}
        className="mt-6 h-11 rounded-none bg-gallery-ink px-8 text-[10px] uppercase text-primary-foreground"
      >
        Add category
      </Button>
    </div>
  );
}

function Orders({ orders, reload }: { orders: OrderRow[]; reload: () => Promise<void> }) {
  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Order updated");
    await reload();
  };

  const total = useMemo(
    () => orders.reduce((sum, o) => sum + Number(o.total), 0),
    [orders],
  );

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-editorial text-3xl">Orders</h2>
        <p className="text-xs text-muted-foreground">{formatCurrency(total)} lifetime</p>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {orders.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="min-w-44 flex-1">
                <p className="text-sm">
                  {o.order_number} · {o.customer_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {o.customer_email} · {o.created_at.slice(0, 10)} · {o.payment_status}
                </p>
              </div>
              <p className="text-sm">{formatCurrency(Number(o.total))}</p>
              <select
                value={o.status}
                onChange={(e) => void update(o.id, e.target.value)}
                className="border border-border bg-transparent px-3 py-2 text-[10px] uppercase"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
