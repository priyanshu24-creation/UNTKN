import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BRAND } from "@/data/catalog";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All pieces", to: "/shop" as const },
      { label: "Outerwear", to: "/shop" as const },
      { label: "Knitwear", to: "/shop" as const },
      { label: "Lookbook", to: "/lookbook" as const },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", to: "/about" as const },
      { label: "Shipping & returns", to: "/about" as const },
      { label: "Size guide", to: "/about" as const },
      { label: "Orders", to: "/account" as const },
    ],
  },
  {
    title: "House",
    links: [
      { label: "About", to: "/about" as const },
      { label: "Privacy policy", to: "/about" as const },
      { label: "Terms & conditions", to: "/about" as const },
      { label: "Admin", to: "/admin" as const },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <p className="font-display text-lg tracking-[0.3em]">{BRAND.name}</p>
            <p className="mt-6 max-w-sm text-sm text-muted-foreground">{BRAND.tagline}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.includes("@")) {
                  toast.error("Enter a valid email address");
                  return;
                }
                setEmail("");
                toast.success("You're on the list");
              }}
              className="mt-10 max-w-sm"
            >
              <label className="eyebrow text-muted-foreground" htmlFor="newsletter">
                Newsletter
              </label>
              <div className="mt-3 flex border-b border-foreground">
                <input
                  id="newsletter"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" className="eyebrow px-2">
                  Join
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-muted-foreground">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="link-underline text-sm">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow text-muted-foreground">
            © {new Date().getFullYear()} {BRAND.short}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              { label: "Instagram", href: "https://www.instagram.com/untknofficialstore/" },
              { label: "Pinterest", href: "#" },
              { label: "Youtube", href: "#" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="eyebrow link-underline"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
