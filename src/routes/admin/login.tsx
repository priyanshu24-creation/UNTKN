import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Staff Sign In — UNTKN" },
      { name: "description", content: "UNTKN staff authentication." },
      { property: "og:title", content: "Staff Sign In — UNTKN" },
      { property: "og:description", content: "UNTKN staff authentication." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-[#f4f2f9] antialiased">
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <section className="w-full max-w-md animate-rise">
          <div className="mb-10 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-[#a29db8] transition-colors hover:text-[#f4f2f9]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to store
            </Link>
            <span className="text-[10px] font-medium uppercase tracking-widest text-[#a29db8]">
              Staff only
            </span>
          </div>

          <div className="border border-[#232230] bg-[#13131a] p-8 shadow-2xl sm:p-10">
            <div className="mb-8 flex h-11 w-11 items-center justify-center border border-[#2a2a3a] bg-[#1a1a24]">
              <Lock className="h-5 w-5 text-[#b8b3d1]" />
            </div>

            <header className="mb-8">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a7496]">
                UNTKN Admin
              </p>
              <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
                Staff sign in
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#a29db8]">
                This portal is restricted to authorised UNTKN staff. Customer accounts cannot access the admin panel.
              </p>
            </header>

            <form
              className="space-y-7"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email.includes("@") || password.length < 6) {
                  toast.error("Enter a valid email and password");
                  return;
                }
                setBusy(true);
                const { error } = await supabase.auth.signInWithPassword({
                  email: email.trim(),
                  password,
                });
                setBusy(false);
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success("Signed in");
                void navigate({ to: "/admin" });
              }}
            >
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a7496]">
                  Staff email
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@untkn.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full border-b border-[#2a2a3a] bg-transparent py-3 text-sm text-[#f4f2f9] outline-none transition-colors placeholder:text-[#5c5878] focus:border-[#7a7496]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a7496]">
                  Password
                </span>
                <span className="relative block">
                  <input
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full border-b border-[#2a2a3a] bg-transparent py-3 pr-11 text-sm text-[#f4f2f9] outline-none transition-colors placeholder:text-[#5c5878] focus:border-[#7a7496]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={show ? "Hide password" : "Show password"}
                    onClick={() => setShow((previous) => !previous)}
                    className="absolute bottom-1 right-0 text-[#7a7496] shadow-none hover:bg-transparent hover:text-[#f4f2f9]"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </span>
              </label>

              <Button
                type="submit"
                disabled={busy}
                className="mt-2 h-12 w-full rounded-none border border-[#f4f2f9] bg-[#f4f2f9] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0b0b0f] shadow-none transition-colors hover:bg-transparent hover:text-[#f4f2f9]"
              >
                {busy ? "Signing in..." : "Sign in to admin"}
              </Button>
            </form>

            <div className="mt-8 border-t border-[#232230] pt-6">
              <p className="text-center text-[10px] leading-5 text-[#5c5878]">
                Not a staff member?{" "}
                <Link
                  to="/login"
                  className="text-[#a29db8] underline underline-offset-4 transition-colors hover:text-[#f4f2f9]"
                >
                  Customer sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] text-[#5c5878]">
            © {new Date().getFullYear()} UNTKN. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
}
