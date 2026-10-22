import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LOGO_URL } from "@/lib/brand";

type Search = { redirect?: string | undefined };

function safePath(p?: string) {
  if (!p) return "/dashboard";
  try {
    const u = new URL(p, "http://x");
    const path = u.pathname + u.search;
    return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/auth") ? path : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — L.E.A.P. Generation CBO" },
      { name: "description", content: "Sign in to the L.E.A.P. Generation CBO management dashboard." },
      { property: "og:title", content: "Sign in — L.E.A.P. Generation CBO" },
      { property: "og:description", content: "Members' workspace for L.E.A.P. Generation CBO, Embu County." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const target = safePath(redirectTo);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [sent, setSent] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: target, replace: true });
    });
  }, [navigate, target]);

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    navigate({ to: target, replace: true });
  }

  async function signUp(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (data.session) { navigate({ to: target, replace: true }); return; }
    setSent(`We've sent a confirmation link to ${email}. Open it to activate your account.`);
  }

  async function forgot(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setSent(`If an account exists for ${email}, a password reset link is on its way.`);
  }

  async function google() {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (res.error) {
      setBusy(false);
      { toast.error(res.error.message); return; }
    }
    if (res.redirected) return;
    navigate({ to: target, replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-hero p-12 text-primary-foreground lg:flex lg:flex-col">
        <div className="w-56 rounded-2xl bg-logo-surface p-3 shadow-elevated">
          <img src={LOGO_URL} alt="L.E.A.P. Generation CBO logo" className="w-full" />
        </div>
        <div className="mt-auto max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Learn • Empower • Achieve • Progress
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight xl:text-5xl">
            Youth-powered. Community-led. A bold leap toward a brighter future.
          </h1>
          <p className="mt-4 text-primary-foreground/75">
            The management workspace for L.E.A.P. Generation CBO — members, meetings, finances and
            compliance in one place.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-primary-foreground/15 pt-6 text-sm">
            <div>
              <dt className="text-primary-foreground/60">Registration no.</dt>
              <dd className="font-semibold">DSD/14/64/02/136624</dd>
            </div>
            <div>
              <dt className="text-primary-foreground/60">Based in</dt>
              <dd className="font-semibold">Runyenjes, Embu County</dd>
            </div>
          </dl>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <img src={LOGO_URL} alt="L.E.A.P. Generation CBO logo" className="mx-auto mb-8 w-44 lg:hidden" />

          {sent ? (
            <div className="rounded-2xl border bg-card p-6 text-center shadow-card">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-green-soft text-primary">
                <MailCheck className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold">Check your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">{sent}</p>
              <Button variant="outline" className="mt-5 w-full" onClick={() => { setSent(null); setMode("signin"); }}>
                Back to sign in
              </Button>
            </div>
          ) : mode === "forgot" ? (
            <form onSubmit={forgot} className="space-y-4">
              <div>
                <h2 className="text-2xl font-extrabold">Reset your password</h2>
                <p className="mt-1 text-sm text-muted-foreground">We'll email you a secure link.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fe">Email</Label>
                <Input id="fe" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send reset link
              </Button>
              <Button type="button" variant="link" className="w-full" onClick={() => setMode("signin")}>
                Back to sign in
              </Button>
            </form>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold">Welcome</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to the L.E.A.P. Generation dashboard.</p>

              <Button variant="outline" className="mt-6 w-full" onClick={google} disabled={busy}>
                <GoogleIcon /> <span className="ml-2">Continue with Google</span>
              </Button>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or with email <div className="h-px flex-1 bg-border" />
              </div>

              <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={signIn} className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="se">Email</Label>
                      <Input id="se" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sp">Password</Label>
                        <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => setMode("forgot")}>
                          Forgot password?
                        </button>
                      </div>
                      <Input id="sp" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={signUp} className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="un">Full name</Label>
                      <Input id="un" required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ue">Email</Label>
                      <Input id="ue" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="up">Password</Label>
                      <Input id="up" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
                      <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      New accounts need approval from an administrator.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
