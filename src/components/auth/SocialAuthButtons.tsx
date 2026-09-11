import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Provider = "google" | "apple" | "microsoft";

const PROVIDERS: { id: Provider; label: string; icon: React.ReactNode }[] = [
  {
    id: "google",
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.08 7.94-2.93l-3.86-3c-1.07.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.26a7.2 7.2 0 0 1 0-4.52v-3.1H1.29a12 12 0 0 0 0 10.72l3.98-3.1Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.2 15.23 0 12 0A12 12 0 0 0 1.29 6.64l3.98 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
        />
      </svg>
    ),
  },
  {
    id: "apple",
    label: "Apple",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M16.36 12.72c.02 2.66 2.33 3.55 2.36 3.56-.02.06-.37 1.28-1.22 2.53-.73 1.08-1.5 2.15-2.7 2.17-1.18.02-1.56-.7-2.9-.7-1.35 0-1.77.68-2.88.72-1.16.04-2.04-1.16-2.78-2.23-1.51-2.2-2.67-6.2-1.11-8.91.77-1.34 2.15-2.19 3.65-2.21 1.14-.02 2.21.77 2.9.77.7 0 2-.95 3.37-.81.57.02 2.18.23 3.21 1.74-.08.05-1.92 1.12-1.9 3.37ZM14.2 4.4c.61-.74 1.02-1.77.91-2.8-.88.04-1.94.59-2.57 1.33-.56.65-1.05 1.7-.92 2.7.98.08 1.98-.5 2.58-1.23Z" />
      </svg>
    ),
  },
  {
    id: "microsoft",
    label: "Microsoft",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
        <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
        <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
        <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
      </svg>
    ),
  },
];

export function SocialAuthButtons({ label = "or continue with" }: { label?: string }) {
  const [pending, setPending] = useState<Provider | null>(null);

  const signIn = async (provider: Provider) => {
    setPending(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/account`,
      },
    });
    if (error) {
      setPending(null);
      toast.error(error.message ?? "Sign-in failed. Please try again.");
      return;
    }
  };

  return (
    <div className="pt-1">
      <div className="flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[9px] uppercase text-muted-foreground">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PROVIDERS.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant="outline"
            disabled={pending !== null}
            onClick={() => void signIn(p.id)}
            aria-label={`Continue with ${p.label}`}
            className="h-12 w-full gap-2 rounded-none bg-transparent px-2 text-[10px] uppercase shadow-none hover:border-gallery-ink hover:bg-transparent"
          >
            {p.icon}
            <span className="truncate">{p.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
