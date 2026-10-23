import { createFileRoute } from "@tanstack/react-router";
import { Handshake, HeartHandshake, UserPlus } from "lucide-react";
import { PageHero, SiteLayout, meta } from "@/components/site/SiteLayout";
import { ContactForm } from "@/components/site/ContactForm";

export const Route = createFileRoute("/get-involved")({
  head: () => meta("Get involved — L.E.A.P. Generation CBO", "Volunteer, become a member or partner with L.E.A.P. Generation CBO in Embu County."),
  component: GetInvolved,
});

const WAYS = [
  { icon: HeartHandshake, title: "Volunteer", text: "Join clean-ups, tree planting and community events." },
  { icon: UserPlus, title: "Become a member", text: "Young people from Kevote and nearby can register and help lead." },
  { icon: Handshake, title: "Partner or donate", text: "Organisations and well-wishers can support our projects." },
];

function GetInvolved() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Get involved" title="Every hand grows the movement" intro="Tell us how you'd like to help and we'll be in touch." />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:px-6 md:grid-cols-3">
        {WAYS.map((w) => (
          <div key={w.title} className="rounded-2xl border bg-card p-7 shadow-card">
            <w.icon className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-lg font-bold">{w.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{w.text}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6"><ContactForm /></section>
    </SiteLayout>
  );
}
