import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero, SiteLayout, meta } from "@/components/site/SiteLayout";
import { ContactForm } from "@/components/site/ContactForm";
import { DEFAULT_CONTACT, telHref, useSiteContent } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact us — L.E.A.P. Generation CBO", "Email, call or visit L.E.A.P. Generation CBO at Kevote, Runyenjes, Embu County."),
  component: Contact,
});

function Contact() {
  const { data: c = DEFAULT_CONTACT } = useSiteContent("contact", DEFAULT_CONTACT);
  const cards = [
    { icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}` },
    { icon: Phone, label: "Phone", value: c.phone, href: telHref(c.phone) },
    { icon: MapPin, label: "Visit", value: `${c.address} · ${c.postal}` },
    { icon: Clock, label: "Hours", value: c.hours },
  ];
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="We'd love to hear from you" />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {cards.map((x) => {
            const body = (
              <div className="flex gap-4 rounded-2xl border bg-card p-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-green-soft text-primary"><x.icon className="h-5 w-5" /></div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{x.label}</p><p className="mt-0.5 font-medium break-words">{x.value}</p></div>
              </div>
            );
            return x.href ? <a key={x.label} href={x.href} className="block hover:opacity-90">{body}</a> : <div key={x.label}>{body}</div>;
          })}
        </div>
        <ContactForm />
      </section>
    </SiteLayout>
  );
}
