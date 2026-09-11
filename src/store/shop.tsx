import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, Order } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side shop state (cart, wishlist, recently viewed, session, last order).
 * Persisted to localStorage today; every mutation is funnelled through this
 * provider so it can be pointed at server endpoints without touching the UI.
 */

interface Session {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface ShopState {
  hydrated: boolean;
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  addToCart: (line: Omit<CartLine, "lineId">) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  recentlyViewed: string[];
  markViewed: (productId: string) => void;
  session: Session | null;
  authReady: boolean;
  signOut: () => Promise<void>;
  lastOrder: Order | null;
  setLastOrder: (order: Order | null) => void;
}

const ShopContext = createContext<ShopState | null>(null);

const KEY = "untkn-store-state";

interface Persisted {
  cart: CartLine[];
  wishlist: string[];
  recentlyViewed: string[];
  lastOrder: Order | null;
}

const empty: Persisted = {
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  lastOrder: null,
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(empty);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...(JSON.parse(raw) as Partial<Persisted>) });
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const addToCart = useCallback((line: Omit<CartLine, "lineId">) => {
    setState((prev) => {
      const lineId = `${line.productId}:${line.color}:${line.size}`;
      const existing = prev.cart.find((l) => l.lineId === lineId);
      const cart = existing
        ? prev.cart.map((l) =>
            l.lineId === lineId
              ? {
                  ...l,
                  quantity: Math.min(l.quantity + line.quantity, l.maxQuantity),
                }
              : l,
          )
        : [...prev.cart, { ...line, lineId }];
      return { ...prev, cart };
    });
    setCartOpen(true);
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart
        .map((l) =>
          l.lineId === lineId
            ? { ...l, quantity: Math.max(0, Math.min(quantity, l.maxQuantity)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    }));
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setState((prev) => ({ ...prev, cart: prev.cart.filter((l) => l.lineId !== lineId) }));
  }, []);

  const clearCart = useCallback(() => setState((prev) => ({ ...prev, cart: [] })), []);

  const toggleWishlist = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      wishlist: prev.wishlist.includes(productId)
        ? prev.wishlist.filter((id) => id !== productId)
        : [...prev.wishlist, productId],
    }));
  }, []);

  const markViewed = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      recentlyViewed: [productId, ...prev.recentlyViewed.filter((id) => id !== productId)].slice(
        0,
        6,
      ),
    }));
  }, []);

  useEffect(() => {
    let active = true;

    const resolve = async (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null) => {
      if (!user) {
        if (active) {
          setSession(null);
          setAuthReady(true);
        }
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (!active) return;
      const isAdmin = (data ?? []).some((r) => r.role === "admin");
      const fullName =
        (typeof user.user_metadata?.["full_name"] === "string"
          ? (user.user_metadata["full_name"] as string)
          : "") || (user.email ?? "").split("@")[0] || "Member";
      setSession({
        id: user.id,
        email: user.email ?? "",
        name: fullName,
        role: isAdmin ? "admin" : "customer",
      });
      setAuthReady(true);
    };

    void supabase.auth.getSession().then(({ data }) => resolve(data.session?.user ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      void resolve(s?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const setLastOrder = useCallback(
    (order: Order | null) => setState((prev) => ({ ...prev, lastOrder: order })),
    [],
  );

  const value = useMemo<ShopState>(() => {
    const subtotal = state.cart.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    return {
      hydrated,
      cart: state.cart,
      cartCount: state.cart.reduce((s, l) => s + l.quantity, 0),
      subtotal,
      addToCart,
      updateQuantity,
      removeLine,
      clearCart,
      cartOpen,
      setCartOpen,
      wishlist: state.wishlist,
      toggleWishlist,
      recentlyViewed: state.recentlyViewed,
      markViewed,
      session,
      authReady,
      signOut,
      lastOrder: state.lastOrder,
      setLastOrder,
    };
  }, [
    state,
    hydrated,
    cartOpen,
    addToCart,
    updateQuantity,
    removeLine,
    clearCart,
    toggleWishlist,
    markViewed,
    session,
    authReady,
    signOut,
    setLastOrder,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
