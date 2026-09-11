import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

/** Standard page shell. `flush` removes the top padding for full-bleed heroes. */
export function SiteLayout({
  children,
  flush = false,
}: {
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header overHero={flush} />
      <main className={flush ? "flex-1 pt-[2.1rem]" : "flex-1 pt-[6.1rem] md:pt-[7.4rem]"}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
