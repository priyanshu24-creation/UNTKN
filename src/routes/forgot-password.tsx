import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { realProductImages } from "@/lib/real-product-images";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — UNTKN" },
      {
        name: "description",
        content: "Request a secure password reset link for your UNTKN account.",
      },
      { property: "og:title", content: "Reset Password — UNTKN" },
      { property: "og:description", content: "Request a password reset link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen bg-gallery font-fashion text-gallery-ink">
      <Header />
      <main className="flex min-h-[calc(100svh-4rem)] items-center px-4 py-10 pt-24 md:min-h-[calc(100svh-5rem)] md:px-8 md:py-12 md:pt-28">
        <section className="auth-card mx-auto grid w-full max-w-5xl overflow-hidden bg-card shadow-[var(--shadow-editorial)] md:min-h-[560px] md:grid-cols-2">
          <div className="auth-panel flex items-center px-7 py-14 sm:px-12 md:px-16 lg:px-20">
            <div className="mx-auto w-full max-w-sm">
              <header className="mb-10">
                <p className="mb-3 text-[10px] font-medium uppercase text-muted-foreground">
                  UNTKN account
                </p>
                <h1 className="font-editorial text-5xl font-normal leading-none md:text-6xl">
                  Reset password
                </h1>
                <p className="mt-4 text-xs uppercase text-muted-foreground">
                  We will send you a secure link
                </p>
              </header>

              {sent ? (
                <div className="space-y-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    If an account exists for {email}, a reset link is on its way. Open it on this
                    device to choose a new password.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 w-full rounded-none bg-transparent text-[10px] uppercase shadow-none hover:border-gallery-ink hover:bg-transparent"
                  >
                    <Link to="/login" viewTransition>
                      Back to sign in
                    </Link>
                  </Button>
                </div>
              ) : (
                <form
                  className="space-y-9"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!email.includes("@")) {
                      toast.error("Enter a valid email address");
                      return;
                    }
                    setBusy(true);
                    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    setBusy(false);
                    if (error) {
                      toast.error(error.message);
                      return;
                    }
                    setSent(true);
                    toast.success("Reset link sent");
                  }}
                >
                  <label className="block">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      Email address
                    </span>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/50 focus:border-gallery-ink"
                    />
                  </label>

                  <div className="space-y-5 pt-2">
                    <Button
                      type="submit"
                      disabled={busy}
                      className="h-12 w-full rounded-none bg-gallery-ink text-[10px] uppercase text-primary-foreground shadow-none hover:bg-gallery-ink/90"
                    >
                      Send reset link
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-12 w-full rounded-none bg-transparent text-[10px] uppercase shadow-none hover:border-gallery-ink hover:bg-transparent"
                    >
                      <Link to="/login" viewTransition>
                        Back to sign in
                      </Link>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="auth-visual relative hidden min-h-[560px] overflow-hidden bg-secondary md:block">
            <img
              src={realProductImages.miserySeated}
              alt="Man wearing the real Misery World graphic long-sleeve shirt"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
