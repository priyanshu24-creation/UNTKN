import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { supabase } from "@/integrations/supabase/client";
import { realProductImages } from "@/lib/real-product-images";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — UNTKN" },
      {
        name: "description",
        content: "Create an UNTKN account to track orders and save pieces.",
      },
      { property: "og:title", content: "Create Account — UNTKN" },
      { property: "og:description", content: "Track orders and save pieces you love." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen bg-gallery font-fashion text-gallery-ink">
      <Header />
      <main className="flex min-h-[calc(100svh-4rem)] items-center px-4 py-10 pt-24 md:min-h-[calc(100svh-5rem)] md:px-8 md:py-12 md:pt-28">
        <section className="auth-card mx-auto grid w-full max-w-5xl overflow-hidden bg-card shadow-[var(--shadow-editorial)] md:min-h-[660px] md:grid-cols-2">
          <div className="auth-panel flex items-center px-7 py-14 sm:px-12 md:px-16 lg:px-20">
            <div className="mx-auto w-full max-w-sm">
              <header className="mb-10">
                <p className="mb-3 text-[10px] font-medium uppercase text-muted-foreground">UNTKN membership</p>
                <h1 className="font-editorial text-5xl font-normal leading-none md:text-6xl">Create account</h1>
                <p className="mt-4 text-xs uppercase text-muted-foreground">Begin your personal collection</p>
              </header>

              <form
                className="space-y-7"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!name.trim() || !email.includes("@") || password.length < 6) {
                    toast.error("Fill in every field; password must be at least 6 characters");
                    return;
                  }
                  setBusy(true);
                  const { data, error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                      emailRedirectTo: window.location.origin,
                      data: { full_name: name.trim() },
                    },
                  });
                  setBusy(false);
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  if (!data.session) {
                    toast.success("Check your email to confirm your account");
                    return;
                  }
                  toast.success("Welcome to UNTKN");
                  void navigate({ to: "/account" });
                }}
              >
                <label className="block">
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">Full name</span>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/50 focus:border-gallery-ink"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">Email address</span>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/50 focus:border-gallery-ink"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">Password</span>
                  <span className="relative block">
                    <input
                      type={show ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full border-b border-border bg-transparent py-3 pr-11 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/50 focus:border-gallery-ink"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={show ? "Hide password" : "Show password"}
                      onClick={() => setShow((previous) => !previous)}
                      className="absolute bottom-1 right-0 text-muted-foreground shadow-none hover:bg-transparent hover:text-gallery-ink"
                    >
                      {show ? <EyeOff /> : <Eye />}
                    </Button>
                  </span>
                </label>

                <div className="space-y-5 pt-2">
                  <Button type="submit" disabled={busy} className="h-12 w-full rounded-none bg-gallery-ink text-[10px] uppercase text-primary-foreground shadow-none hover:bg-gallery-ink/90">
                    Create account
                  </Button>
                  <SocialAuthButtons label="or sign up with" />
                  <div className="flex items-center gap-4" aria-hidden="true">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[9px] uppercase text-muted-foreground">or</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <Button asChild variant="outline" className="h-12 w-full rounded-none bg-transparent text-[10px] uppercase shadow-none hover:border-gallery-ink hover:bg-transparent">
                    <Link to="/login" viewTransition>Sign in</Link>
                  </Button>
                </div>
              </form>

              <p className="mt-9 text-center text-[10px] leading-5 text-muted-foreground">
                By creating an account, you agree to our privacy policy.
              </p>
            </div>
          </div>

          <div className="auth-visual relative hidden min-h-[660px] overflow-hidden bg-secondary md:block">
            <img
              src={realProductImages.dragonGraffiti}
              alt="Man wearing the real dragon and flame graphic long-sleeve shirt"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 ease-out hover:scale-[1.015]"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-gallery-ink/55 to-transparent px-7 pb-7 pt-24 text-primary-foreground">
              <p className="text-[10px] font-medium uppercase">Original UNTKN photography</p>
              <Link to="/shop" className="text-[10px] uppercase underline underline-offset-4">Discover</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
