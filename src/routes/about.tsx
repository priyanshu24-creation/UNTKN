import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { BRAND, editorialImages } from "@/data/catalog";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Support — UNTKN" },
      {
        name: "description",
        content:
          "How UNTKN makes its clothing, plus shipping, returns, contact and policy information.",
      },
      { property: "og:title", content: "About & Support — UNTKN" },
      {
        property: "og:description",
        content: "Our making process, shipping, returns and contact details.",
      },
    ],
  }),
  component: About,
});

const SUPPORT = [
  {
    title: "Shipping",
    body: "Complimentary shipping on orders above ₹9,999. Standard delivery 3–6 working days, express 1–2 working days. Orders are dispatched from our studio Monday to Friday.",
  },
  {
    title: "Returns",
    body: "30 days from delivery on unworn pieces with tags attached. Return shipping is complimentary within the EU, UK, US and India.",
  },
  {
    title: "Contact",
    body: "Write to studio@untkn.com — we reply within one working day. Phone lines open 10:00–18:00 CET.",
  },
  {
    title: "Privacy & terms",
    body: "We store only what is needed to fulfil an order and never sell customer data. Full privacy policy and terms of sale are available on request.",
  },
];

function About() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <Reveal>
          <p className="eyebrow text-muted-foreground">The house</p>
          <h1 className="display-lg mt-5 max-w-3xl">
            We make a small number of things, properly
          </h1>
        </Reveal>

        <div className="mt-16 grid gap-14 md:grid-cols-2 md:gap-20">
          <Reveal className="image-veil">
            <img
              src={editorialImages.story}
              alt="Folded garments on a plaster surface"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>
          <Reveal delay={100} className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              {BRAND.short} began with a single overcoat pattern and a mill in northern
              Portugal. Ten seasons later the method is unchanged: choose the cloth first, cut
              it slowly, produce only what we can sell.
            </p>
            <p>
              Every style is made in runs of a few hundred. When a fabric is finished, the piece
              is retired rather than reproduced in a lesser quality.
            </p>
            <p>
              Our studio is in Lisbon, with a showroom open by appointment. Repairs are offered
              free for the first two years on all outerwear.
            </p>
          </Reveal>
        </div>

        <section className="mt-24 border-t border-border pt-16">
          <h2 className="display-md">Customer care</h2>
          <div className="mt-10 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {SUPPORT.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <h3 className="eyebrow">{s.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
