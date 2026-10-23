import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, HandHeart, Leaf, Megaphone, Sprout, Users } from "lucide-react";
import { PageHero, SiteLayout, meta } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/what-we-do")({
  head: () => meta("What we do — L.E.A.P. Generation CBO", "Community projects, youth empowerment, advocacy, skills training and environmental conservation in Embu County."),
  component: WhatWeDo,
});

const PROGRAMS = [
  { icon: HandHeart, title: "Community projects", text: "Practical projects that improve daily life in Kevote and surrounding villages." },
  { icon: Users, title: "Community empowerment", text: "Bringing residents together to identify needs and act on them." },
  { icon: Megaphone, title: "Community advocacy", text: "Raising youth voices on issues that affect our families and futures." },
  { icon: Leaf, title: "Environmental conservation", text: "Tree planting, market clean-ups and caring for our land and water." },
  { icon: Sprout, title: "Youth empowerment", text: "Mentorship, leadership and confidence-building for young people." },
  { icon: GraduationCap, title: "Skill development", text: "Training that opens doors to work, business and self-reliance." },
];

function WhatWeDo() {
  return (
    <SiteLayout>
      <PageHero eyebrow="What we do" title="Six ways we help our community leap forward" />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {PROGRAMS.map((p) => (
          <div key={p.title} className="rounded-2xl border bg-card p-7 shadow-card transition-transform hover:-translate-y-1">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gold-soft text-brand-gold-foreground"><p.icon className="h-6 w-6" /></div>
            <h2 className="mt-5 text-lg font-bold">{p.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
