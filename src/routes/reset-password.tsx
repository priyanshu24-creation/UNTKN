import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { realProductImages } from "@/lib/real-product-images";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a New Password — UNTKN" },
      {
        name: "description",
        content: "Set a new password for your UNTKN account.",
      },
      { property: "og:title", content: "Choose a New Password — UNTKN" },
      { property: "og:description", content: "Set a new password for your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setReady(Boolean(data.session));
    };
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

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
                  New password
                </h1>
                <p className="mt-4 text-xs uppercase text-muted-foreground">
                  Choose something only you know
                </p>
              </header>

              {!ready ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Open this page from the reset link in your email, then choose your new password
                  here.{" "}
                  <Link to="/forgot-password" className="underline underline-offset-4">
                    Request a new link
                  </Link>
                  .
                </p>
              ) : (
                <form
                  className="space-y-8"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (password.length < 6) {
                      toast.error("Use at least 6 characters");
                      return;
                    }
                    if (password !== confirm) {
                      toast.error("Both passwords must match");
                      return;
                    }
                    setBusy(true);
                    const { error } = await supabase.auth.updateUser({ password });
                    setBusy(false);
                    if (error) {
                      toast.error(error.message);
                      return;
                    }
                    toast.success("Password updated");
                    void navigate({ to: "/account" });
                  }}
                >
                  <label className="block">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      New password
                    </span>
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
                  <label className="block">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      Confirm password
                    </span>
                    <input
                      type={show ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="mt-1 w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/50 focus:border-gallery-ink"
                    />
                  </label>

                  <Button
                    type="submit"
                    disabled={busy}
                    className="h-12 w-full rounded-none bg-gallery-ink text-[10px] uppercase text-primary-foreground shadow-none hover:bg-gallery-ink/90"
                  >
                    Update password
                  </Button>
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
