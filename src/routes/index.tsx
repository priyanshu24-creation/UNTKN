import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { realProductGallery, realProductImages } from "@/lib/real-product-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UNTKN — Original Graphic Clothing" },
      {
        name: "description",
        content: "Discover UNTKN through original product and on-location clothing photography.",
      },
      { property: "og:title", content: "UNTKN — Original Graphic Clothing" },
      {
        property: "og:description",
        content: "Discover UNTKN through original product and on-location clothing photography.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const galleryAlts = [
  "White Misery World graphic long-sleeve shirt",
  "Man wearing the Misery World graphic shirt beside a window",
  "Man wearing the Misery World graphic shirt while seated",
  "Man wearing the Misery World graphic shirt against illustrated wall art",
  "Man wearing the Misery World graphic shirt photographed from above",
  "White dragon and flame graphic long-sleeve shirt",
  "Man wearing the dragon and flame graphic shirt against graffiti",
  "Man wearing the dragon and flame graphic shirt on stairs",
];

function Home() {
  return (
    <SiteLayout>
      <section className="bg-gallery px-5 pb-14 pt-9 md:px-10 md:py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1380px] items-center gap-8 md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] md:gap-14 lg:gap-24">
          <div className="relative z-10 min-w-0 md:py-12">
            <p className="eyebrow animate-rise text-muted-foreground">Original UNTKN photography · 2026</p>
            <h1 className="animate-rise mt-5 font-editorial font-normal leading-[0.9] md:mt-7" style={{ animationDelay: "100ms" }}>
              <span className="block text-[4.25rem] sm:text-8xl lg:text-[8.5rem]">UNTKN</span>
              <span className="mt-5 block max-w-xl text-[2.15rem] italic leading-[0.98] sm:text-5xl md:mt-7 lg:text-6xl">
                Unknown by Name.
                <br />
                <span className="not-italic">Unforgettable by Style.</span>
              </span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-6 text-muted-foreground md:mt-8 md:leading-7">
              Original graphic clothing, photographed on the people who wear it.
            </p>
            <Link to="/lookbook" className="group mt-5 inline-flex items-center gap-5 py-3 md:mt-8">
              <span className="eyebrow">View the lookbook</span>
              <span className="h-px w-10 bg-foreground transition-[width] duration-500 group-hover:w-20" />
            </Link>
          </div>

          <Reveal className="relative md:pr-6">
            <div className="overflow-hidden bg-secondary shadow-[var(--shadow-editorial)]">
              <img
                src={realProductImages.miseryPortrait}
                alt="Man wearing the real UNTKN Misery World graphic long-sleeve shirt"
                width={768}
                height={1024}
                className="aspect-[4/5] w-full object-cover object-center transition-transform duration-1000 hover:scale-[1.015]"
              />
            </div>
            <div className="absolute bottom-0 left-0 border border-border bg-background/95 px-5 py-4 shadow-[var(--shadow-editorial)] backdrop-blur-sm md:-bottom-7 md:-left-12 md:px-8 md:py-5">
              <p className="eyebrow text-muted-foreground">Campaign 001</p>
              <p className="mt-2 font-editorial text-xl italic">Misery World</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1380px] border-t border-border px-5 py-14 md:px-10 md:py-32">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="font-editorial text-[1.75rem] italic leading-[1.08] md:text-5xl md:leading-tight">
            Clothing should be experienced, not staged. Every frame here belongs to the real UNTKN story.
          </p>
        </Reveal>
        <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:mt-16 md:grid md:grid-cols-3 md:gap-7 md:overflow-visible md:px-0 md:pb-0 lg:gap-12">
          {[
            [realProductImages.miseryProduct, "The graphic", "Front artwork, texture and construction in clear view."],
            [realProductImages.dragonGraffiti, "The attitude", "The dragon and flame piece worn in its natural setting."],
            [realProductImages.dragonStairs, "The fit", "An honest look at proportion, drape and everyday styling."],
          ].map(([src, title, copy], index) => (
            <Reveal key={src} delay={index * 80} className={`w-[78vw] max-w-[310px] shrink-0 snap-start md:w-auto md:max-w-none ${index === 1 ? "md:pt-20" : ""}`}>
              <div className="image-veil overflow-hidden bg-secondary">
                <img src={src} alt={copy} loading="lazy" width={768} height={1024} className="aspect-[3/4] w-full object-cover transition-transform duration-1000 hover:scale-[1.025]" />
              </div>
              <p className="eyebrow mt-4 md:mt-6">{title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-[1600px] md:grid-cols-2">
          <Reveal className="image-veil">
            <img
              src={realProductImages.dragonProduct}
              alt="White long-sleeve shirt with dragon, cloud and flame artwork"
              loading="lazy"
              width={768}
              height={768}
              className="aspect-square w-full object-cover md:h-full md:min-h-[420px] md:aspect-auto"
            />
          </Reveal>
          <Reveal delay={100} className="flex items-center px-5 py-12 md:px-16 md:py-24">
            <div className="max-w-md">
              <p className="eyebrow text-muted-foreground">Product detail</p>
              <h2 className="display-lg mt-5">Artwork in full view</h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Clean product photography sits alongside real on-body images, so every graphic and fit can be seen clearly.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-28">
        <Reveal>
          <p className="eyebrow text-muted-foreground">UNTKN in frame</p>
          <h2 className="display-lg mt-4">Real campaign gallery</h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-2 md:mt-10 md:grid-cols-4 md:gap-4">
          {realProductGallery.map((src, index) => (
            <Reveal key={src} delay={(index % 4) * 50} className="image-veil">
              <img
                src={src}
                alt={galleryAlts[index] ?? "UNTKN clothing photograph"}
                loading="lazy"
                width={768}
                height={1024}
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}