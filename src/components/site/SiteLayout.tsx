import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Mail, Menu, MapPin, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOGO_URL } from "@/lib/brand";
import { DEFAULT_CONTACT, telHref, useSiteContent } from "@/lib/site";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/what-we-do", label: "What We Do" },
  { to: "/gallery", label: "Gallery" },
  { to: "/get-involved", label: "Get Involved" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data: c = DEFAULT_CONTACT } = useSiteContent("contact", DEFAULT_CONTACT);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src={LOGO_URL} alt="L.E.A.P. Generation CBO" className="h-10 w-auto" />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-brand-green-soft text-primary" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/get-involved">Join us</Link>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="border-t bg-background px-4 py-3 lg:hidden">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium"
                activeProps={{ className: "bg-brand-green-soft text-primary" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <div className="inline-block rounded-xl bg-logo-surface p-2">
              <img src={LOGO_URL} alt="L.E.A.P. Generation CBO" className="h-12 w-auto" />
            </div>
            <p className="mt-4 text-sm opacity-75">Learn • Empower • Achieve • Progress</p>
            <p className="mt-1 text-xs opacity-60">Reg. No. DSD/14/64/02/136624</p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-gold">Explore</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="opacity-80 hover:opacity-100">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 text-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-gold">Contact</h3>
            <a href={`mailto:${c.email}`} className="flex items-center gap-2 opacity-85 hover:opacity-100"><Mail className="h-4 w-4" />{c.email}</a>
            <a href={telHref(c.phone)} className="flex items-center gap-2 opacity-85 hover:opacity-100"><Phone className="h-4 w-4" />{c.phone}</a>
            <p className="flex gap-2 opacity-85"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{c.address}</p>
          </div>
        </div>
        <div className="border-t border-sidebar-border">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs opacity-60 sm:px-6">
            <span>© {new Date().getFullYear()} L.E.A.P. Generation CBO, Embu County, Kenya</span>
            <Link to="/auth" className="hover:opacity-100">Admin login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="bg-gradient-hero text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg opacity-80">{intro}</p>}
      </div>
    </section>
  );
}

export function meta(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
