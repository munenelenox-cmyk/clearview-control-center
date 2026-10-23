import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, Target } from "lucide-react";
import { PageHero, SiteLayout, meta } from "@/components/site/SiteLayout";
import { DOCUMENTS } from "@/lib/brand";

export const Route = createFileRoute("/about")({
  head: () => meta("About us — L.E.A.P. Generation CBO", "Our story, mission, vision and leadership team in Runyenjes, Embu County, Kenya."),
  component: About,
});

const LEADERS = [
  ["Lenox Munene", "Chairperson"],
  ["Tonny Brian Mutugi", "Vice Chairperson"],
  ["Bonface Muriithi", "Secretary"],
  ["Cynthia Mukami", "Vice Secretary"],
  ["Allan Macharia", "Treasurer"],
  ["Joylily Mwende", "Committee Member"],
];

function About() {
  return (
    <SiteLayout>
      <PageHero eyebrow="About us" title="A youth movement built in Kevote, for Embu County" intro="Founded on 17 August 2025 and registered on 10 September 2025 as a Community Based Organisation." />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-8 shadow-card">
          <Target className="h-7 w-7 text-primary" />
          <h2 className="mt-4 text-xl font-bold">Our mission</h2>
          <p className="mt-2 text-muted-foreground">To empower young people with knowledge, skills, confidence and opportunities to build stronger, more sustainable communities.</p>
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-card">
          <Eye className="h-7 w-7 text-secondary" />
          <h2 className="mt-4 text-xl font-bold">Our vision</h2>
          <p className="mt-2 text-muted-foreground">A generation of empowered youth leading progress in their communities and caring for the environment.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl font-extrabold">Leadership</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEADERS.map(([n, r]) => (
            <div key={n} className="flex items-center gap-4 rounded-2xl border bg-card p-5">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-green-soft font-bold text-primary">
                {n.split(" ").map((x) => x[0]).slice(0, 2).join("")}
              </div>
              <div><p className="font-semibold">{n}</p><p className="text-sm text-muted-foreground">{r}</p></div>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-extrabold">Official documents</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {DOCUMENTS.slice(0, 2).map((d) => (
              <a key={d.title} href={d.url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-5 hover:shadow-card">
                <div><p className="font-semibold">{d.title}</p><p className="mt-1 text-sm text-muted-foreground">{d.description}</p></div>
                <Download className="h-5 w-5 shrink-0 text-primary" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
