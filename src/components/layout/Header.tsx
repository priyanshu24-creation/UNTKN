import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BRAND } from "@/data/catalog";
import { useShop } from "@/store/shop";
import { SearchOverlay } from "./SearchOverlay";
import { Marquee } from "./Marquee";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Shop", to: "/shop" as const },
  { label: "Collections", to: "/shop" as const },
  { label: "Lookbook", to: "/lookbook" as const },
  { label: "About", to: "/about" as const },
];

export function Header({ overHero = false }: { overHero?: boolean }) {
  const { cartCount, hydrated, setCartOpen, wishlist, session } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] border-b border-border bg-background/95 text-foreground backdrop-blur-md transition-shadow duration-300",
          scrolled ? "shadow-[0_1px_20px_-12px_var(--primary)]" : "",
          overHero ? "" : "",
        )}
      >
        <Marquee />
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-20 md:px-10">
          <div className="flex items-center gap-2 md:flex-1">
            <button
              type="button"
              className="-ml-2 p-2 md:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" strokeWidth={1.2} />
            </button>
            <Link to="/" className="font-display text-sm tracking-[0.32em] md:text-base">
              {BRAND.name}
            </Link>
          </div>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="eyebrow link-underline"
                activeProps={{ className: "opacity-60" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1 md:flex-1 md:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="p-2"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.3} />
            </button>
            <Link to="/account" aria-label="Account" className="hidden p-2 md:block">
              <User className="h-[18px] w-[18px]" strokeWidth={1.3} />
            </Link>
            <Link to="/account" aria-label="Wishlist" className="relative hidden p-2 md:block">
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.3} />
              {hydrated && wishlist.length > 0 ? (
                <span className="absolute right-0 top-0 text-[10px] tabular-nums">
                  {wishlist.length}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Open shopping bag"
              className="relative p-2"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.3} />
              {hydrated && cartCount > 0 ? (
                <span className="absolute right-0 top-0 text-[10px] tabular-nums">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[85] bg-background transition-opacity duration-400 md:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="font-display text-sm tracking-[0.32em]">{BRAND.name}</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="-mr-2 p-2"
          >
            <X className="h-5 w-5" strokeWidth={1.2} />
          </button>
        </div>
        <nav className="px-5 pt-10" aria-label="Mobile">
          {NAV.map((item, i) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: `${80 + i * 60}ms` }}
              className={cn(
                "display-lg block py-3 transition-all duration-500",
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-12 grid gap-4 border-t border-border pt-8">
            <Link to="/account" onClick={() => setMenuOpen(false)} className="eyebrow">
              {session ? "Account" : "Sign in"}
            </Link>
            <Link to="/account" onClick={() => setMenuOpen(false)} className="eyebrow">
              Wishlist
            </Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)} className="eyebrow">
              Cart
            </Link>
          </div>
        </nav>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
