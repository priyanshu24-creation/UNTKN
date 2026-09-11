const MESSAGES = [
  "Free shipping over ₹4,999",
  "New drop — Autumn Study",
  "Members get early access",
  "30-day easy returns",
];

/** Thin editorial ticker that runs above the navigation. */
export function Marquee() {
  const strip = [...MESSAGES, ...MESSAGES];

  return (
    <div className="overflow-hidden border-b border-border bg-foreground text-background">
      <div className="marquee-track whitespace-nowrap py-2">
        {[0, 1].map((pass) => (
          <div key={pass} className="flex shrink-0 items-center" aria-hidden={pass === 1}>
            {strip.map((message, i) => (
              <span key={`${pass}-${i}`} className="eyebrow flex items-center">
                <span className="px-6 text-[0.625rem] opacity-90">{message}</span>
                <span className="opacity-40">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
