import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  BRAND,
  categories,
  editorialImages,
  featuredProducts,
  newArrivals,
} from "@/data/catalog";
import hero from "@/assets/hero.jpg";
import posterWide1 from "@/assets/poster-wide-1.jpg";
import posterWide2 from "@/assets/poster-wide-2.jpg";
import poster1 from "@/assets/poster-1.jpg";
import poster2 from "@/assets/poster-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UNTKN — Considered Fashion for the Modern Wardrobe" },
      {
        name: "description",
        content:
          "Editorial outerwear, knitwear and tailoring in natural fibres. Shop the Autumn collection from UNTKN.",
      },
      { property: "og:title", content: "UNTKN — Considered Fashion" },
      {
        property: "og:description",
        content: "Editorial outerwear, knitwear and tailoring in natural fibres.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [offset, setOffset] = useState(0);
  const featured = featuredProducts();
  const arrivals = newArrivals(4);

  useEffect(() => {
    const onScroll = () => setOffset(Math.min(window.scrollY, 700));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <SiteLayout>
      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-secondary/50">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[1920/720]">
          <img
            src={posterWide1}
            alt="Two models wearing oversized wool coats"
            width={1920}
            height={720}
            className="absolute inset-0 h-full w-full object-cover object-[88%_center] lg:object-center"
            style={{ transform: `translate3d(0, ${offset * 0.06}px, 0)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10 lg:from-background/85 lg:via-background/20 lg:to-transparent" />
          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-[1600px] flex-col justify-center px-5 md:px-10">
              <div className="max-w-lg">
                <p className="eyebrow animate-rise text-primary">Autumn / Winter 2026</p>
                <h1 className="display-xl animate-rise mt-4" style={{ animationDelay: "120ms" }}>
                  Weight,
                  <br />
                  drape, silence
                </h1>
                <p
                  className="animate-rise mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground"
                  style={{ animationDelay: "240ms" }}
                >
                  A collection built around three fabrics and one idea — clothing that
                  improves with wear.
                </p>
                <div
                  className="animate-rise mt-7 flex flex-wrap gap-3 sm:gap-4"
                  style={{ animationDelay: "340ms" }}
                >
                  <Link
                    to="/shop"
                    className="eyebrow bg-primary px-8 py-4 text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 sm:px-10"
                  >
                    Shop collection
                  </Link>
                  <Link
                    to="/lookbook"
                    className="eyebrow border border-primary/50 px-8 py-4 text-primary transition-colors duration-300 hover:bg-primary hover:text-primary-foreground sm:px-10"
                  >
                    Explore lookbook
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CATEGORY STRIP */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-[1600px] gap-3 overflow-x-auto px-5 py-5 md:justify-center md:gap-6 md:px-10">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.slug }}
              className="eyebrow shrink-0 rounded-full border border-primary/25 bg-background px-5 py-2.5 text-primary transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>


      {/* FEATURED COLLECTION */}
      <section className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-muted-foreground">Featured collection</p>
            <h2 className="display-lg mt-4 max-w-xl">The winter overcoat study</h2>
          </div>
          <Link to="/shop" className="eyebrow link-underline">
            View all pieces
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:mt-14 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
          {featured.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard product={p} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* EDITORIAL SPLIT */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-[1600px] items-stretch gap-0 md:grid-cols-2">
          <Reveal className="image-veil">
            <img
              src={editorialImages.editorial1}
              alt="Model in cream knitwear and black tailoring"
              loading="lazy"
              width={1200}
              height={1500}
              className="h-full w-full object-cover"
            />
          </Reveal>
          <Reveal delay={120} className="flex items-center px-5 py-16 md:px-16 md:py-24">
            <div className="max-w-md">
              <p className="eyebrow text-muted-foreground">Editorial 01</p>
              <h2 className="display-lg mt-5">Quiet volume</h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Proportion does the work. Boxy jersey against fluid wool, rendered in a palette
                of ecru, stone and ink — photographed in daylight, unstyled.
              </p>
              <Link to="/lookbook" className="eyebrow link-underline mt-8 inline-block">
                See the full story
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-28">
        <Reveal>
          <p className="eyebrow text-muted-foreground">Just landed</p>
          <h2 className="display-lg mt-4">New arrivals</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:mt-14 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
          {arrivals.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <ProductCard product={p} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* WIDE SALE POSTER */}
      <Reveal>
        <section className="relative overflow-hidden">
          <div className="relative aspect-[3/2] w-full sm:aspect-[16/7] lg:aspect-[1920/620]">
            <img
              src={posterWide2}
              alt="Knitwear, denim and sneakers arranged on a white surface"
              loading="lazy"
              width={1920}
              height={720}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/60 to-transparent" />
            <div className="absolute inset-0 mx-auto flex max-w-[1600px] items-center justify-end px-5 md:px-10">
              <div className="max-w-sm text-right">
                <p className="eyebrow text-primary">Season edit</p>
                <h2 className="display-lg mt-4">Essentials from ₹1,999</h2>
                <p className="mt-4 text-sm text-muted-foreground">
                  Everyday knits, denim and footwear, priced to live in.
                </p>
                <Link
                  to="/shop"
                  className="eyebrow mt-7 inline-block bg-primary px-9 py-4 text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Shop the edit
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* POSTER PAIR */}
      <section className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-24">
        <Reveal>
          <p className="eyebrow text-muted-foreground">Campaigns</p>
          <h2 className="display-lg mt-4">Shop by story</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
          {[
            {
              img: poster1,
              title: "Women",
              copy: "Soft tailoring & heavy knits",
              alt: "Woman in cream knit sweater and wide trousers",
              gender: "women" as const,
            },
            {
              img: poster2,
              title: "Men",
              copy: "Coats cut for the cold",
              alt: "Man in a charcoal overcoat and white shirt",
              gender: "men" as const,
            },
          ].map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <Link
                to="/shop"
                search={{ gender: p.gender }}
                className="group relative block overflow-hidden"
              >
                <img
                  src={p.img}
                  alt={p.alt}
                  loading="lazy"
                  width={900}
                  height={1200}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-6 md:p-8">
                  <h3 className="display-md text-background">{p.title}</h3>
                  <p className="mt-2 text-sm text-background/80">{p.copy}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-[1600px] gap-0 md:grid-cols-2">
          <Reveal className="order-2 flex items-center px-5 py-16 md:order-1 md:px-16 md:py-28">
            <div className="max-w-md">
              <p className="eyebrow text-muted-foreground">The house</p>
              <h2 className="display-lg mt-5">Made in small runs</h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {BRAND.short} works with four mills across Portugal, Italy and Scotland. Each
                style is produced in limited quantity, restocked only when the cloth allows.
              </p>
              <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
                {[
                  ["04", "Mills"],
                  ["12", "Styles a year"],
                  ["100%", "Natural fibres"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-display text-2xl">{value}</dt>
                    <dd className="eyebrow mt-2 text-muted-foreground">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
          <Reveal delay={100} className="image-veil order-1 md:order-2">
            <img
              src={editorialImages.story}
              alt="Folded grey linen garments on a plaster surface"
              loading="lazy"
              width={1400}
              height={1000}
              className="h-full w-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* CATEGORIES / PROMO */}
      <section className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-28">
        <Reveal>
          <h2 className="display-lg">Browse by category</h2>
        </Reveal>
        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 60}>
              <Link
                to="/shop"
                search={{ category: c.slug }}
                className="flex h-full flex-col justify-between bg-background p-6 transition-colors duration-300 hover:bg-secondary md:p-8"
              >
                <span className="display-md">{c.name}</span>
                <span className="mt-6 text-sm text-muted-foreground md:mt-10">{c.description}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROMOTIONAL BAND */}
      <Reveal>
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-[1600px] flex-col items-start gap-8 px-5 py-20 md:flex-row md:items-center md:justify-between md:px-10 md:py-28">
            <div>
              <p className="eyebrow opacity-70">Complimentary</p>
              <h2 className="display-lg mt-4 max-w-xl">
                Free shipping on orders above ₹9,999
              </h2>
            </div>
            <Link
              to="/shop"
              className="eyebrow border border-primary-foreground/60 px-10 py-4 transition-colors duration-300 hover:bg-primary-foreground hover:text-primary"
            >
              Shop now
            </Link>
          </div>
        </section>
      </Reveal>

      {/* SOCIAL GALLERY */}
      <section className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-28">
        <Reveal className="flex items-end justify-between">
          <h2 className="display-md">@untkn</h2>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer noopener"
            className="eyebrow link-underline"
          >
            Follow
          </a>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            editorialImages.editorial1,
            editorialImages.editorial2,
            editorialImages.story,
            hero,
          ].map((src, i) => (
            <Reveal key={i} delay={i * 60} className="image-veil aspect-square">
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover grayscale transition-[filter] duration-700 hover:grayscale-0"
              />
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
