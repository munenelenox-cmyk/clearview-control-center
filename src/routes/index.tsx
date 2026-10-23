import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, HandHeart, Leaf, Megaphone, Sprout, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout, meta } from "@/components/site/SiteLayout";
import { DEFAULT_HOME, useSiteContent } from "@/lib/site";
import hero from "@/assets/hero-youth.jpg";
import cleanup from "@/assets/cleanup.jpg";
import workshop from "@/assets/workshop.jpg";

export const Route = createFileRoute("/")({
  head: () =>
    meta(
      "L.E.A.P. Generation CBO — Youth empowerment in Embu County",
      "A youth-led community-based organisation in Runyenjes, Embu County, Kenya: empowerment, skills, advocacy and environmental conservation.",
    ),
  component: Home,
});

const PILLARS = [
  { icon: BookOpen, title: "Learn", text: "Mentorship, training and access to knowledge for young people." },
  { icon: Users, title: "Empower", text: "Building confidence, leadership and a voice in the community." },
  { icon: Sprout, title: "Achieve", text: "Skills and projects that turn ideas into real livelihoods." },
  { icon: ArrowRight, title: "Progress", text: "Sustainable growth for families, villages and the environment." },
];

function Home() {
  const { data: home = DEFAULT_HOME } = useSiteContent("home", DEFAULT_HOME);
  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Young people planting trees in Embu County" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar via-sidebar/80 to-sidebar/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-sidebar-foreground sm:px-6 sm:py-32">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Learn • Empower • Achieve • Progress</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">{home.headline}</h1>
          <p className="mt-5 max-w-xl text-lg opacity-85">{home.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/get-involved">Get involved <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="secondary"><Link to="/what-we-do">What we do</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl border bg-card p-6 shadow-card transition-transform hover:-translate-y-1">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-green-soft text-primary"><p.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <img src={cleanup} alt="Community clean-up" loading="lazy" width={1200} height={912} className="aspect-[4/5] w-full rounded-2xl object-cover shadow-elevated" />
            <img src={workshop} alt="Youth skills workshop" loading="lazy" width={1200} height={912} className="mt-10 aspect-[4/5] w-full rounded-2xl object-cover shadow-elevated" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Who we are</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Registered, rooted and run by young people of Kevote</h2>
            <p className="mt-4 text-muted-foreground">
              Founded in August 2025 and registered under the Community Groups Registration Act, 2022, we bring youth
              together around projects that matter: clean-ups, tree planting, skills training and advocacy.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[[Leaf, "Environmental conservation"], [HandHeart, "Community projects & empowerment"], [Megaphone, "Community and youth advocacy"]].map(([Icon, t]) => {
                const I = Icon as typeof Leaf;
                return <li key={t as string} className="flex items-center gap-3"><I className="h-5 w-5 text-primary" />{t as string}</li>;
              })}
            </ul>
            <Button asChild variant="outline" className="mt-8"><Link to="/about">Our story</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl bg-gradient-hero p-10 text-primary-foreground sm:p-14">
          <h2 className="max-w-2xl text-3xl font-extrabold sm:text-4xl">Ready to take the leap with us?</h2>
          <p className="mt-3 max-w-xl opacity-80">Volunteer, partner or become a member — every hand grows the movement.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/get-involved">Get involved</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/contact">Contact us</Link></Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
