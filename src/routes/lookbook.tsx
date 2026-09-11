import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { editorialImages } from "@/data/catalog";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Lookbook AW26 — UNTKN" },
      {
        name: "description",
        content:
          "The UNTKN Autumn/Winter 2026 lookbook: volume, natural fibre and daylight, photographed unstyled.",
      },
      { property: "og:title", content: "Lookbook AW26 — UNTKN" },
      {
        property: "og:description",
        content: "Volume, natural fibre and daylight — the AW26 lookbook.",
      },
    ],
  }),
  component: Lookbook,
});

const SPREADS = [
  {
    image: editorialImages.editorial1,
    eyebrow: "Look 01",
    title: "Undyed lambswool",
    copy: "A rib knit worn against fluid tailoring. Nothing pressed, nothing forced.",
  },
  {
    image: editorialImages.editorial2,
    eyebrow: "Look 02",
    title: "City nylon",
    copy: "Technical outerwear in matte black, softened by a washed cotton cargo.",
  },
  {
    image: editorialImages.story,
    eyebrow: "Look 03",
    title: "Resting cloth",
    copy: "Fabric photographed before cutting — the origin of every piece we make.",
  },
];

function Lookbook() {
  return (
    <SiteLayout flush>
      <section className="relative h-[70svh] min-h-[420px] overflow-hidden">
        <img
          src={hero}
          alt="Editorial campaign image"
          width={1920}
          height={1280}
          className="animate-veil h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/25" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-5 pb-14 text-background md:px-10">
          <p className="eyebrow animate-rise">Autumn / Winter 2026</p>
          <h1 className="display-xl animate-rise mt-4" style={{ animationDelay: "120ms" }}>
            Lookbook
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        {SPREADS.map((s, i) => (
          <Reveal
            key={s.title}
            className={`grid items-center gap-10 border-b border-border py-16 md:grid-cols-2 md:gap-20 ${
              i % 2 ? "md:[&>figure]:order-2" : ""
            }`}
          >
            <figure className="image-veil">
              <img
                src={s.image}
                alt={s.title}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </figure>
            <div>
              <p className="eyebrow text-muted-foreground">{s.eyebrow}</p>
              <h2 className="display-lg mt-4">{s.title}</h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {s.copy}
              </p>
              <Link to="/shop" className="eyebrow link-underline mt-8 inline-block">
                Shop the look
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </SiteLayout>
  );
}
