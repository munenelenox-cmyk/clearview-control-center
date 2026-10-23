import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout, meta } from "@/components/site/SiteLayout";
import { useGallery } from "@/lib/site";
import hero from "@/assets/hero-youth.jpg";
import cleanup from "@/assets/cleanup.jpg";
import workshop from "@/assets/workshop.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => meta("Gallery — L.E.A.P. Generation CBO", "Photos from our clean-ups, tree planting, meetings and youth activities in Embu County."),
  component: Gallery,
});

const FALLBACK = [
  { id: "a", image_url: hero, caption: "Tree planting in Kevote" },
  { id: "b", image_url: cleanup, caption: "Market clean-up" },
  { id: "c", image_url: workshop, caption: "Youth skills workshop" },
];

function Gallery() {
  const { data } = useGallery();
  const items = data && data.length ? data : FALLBACK;
  return (
    <SiteLayout>
      <PageHero eyebrow="Gallery" title="Moments from the movement" />
      <section className="mx-auto max-w-6xl columns-1 gap-4 px-4 py-16 sm:columns-2 sm:px-6 lg:columns-3">
        {items.map((g) => (
          <figure key={g.id} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border bg-card">
            <img src={g.image_url} alt={g.caption ?? "Gallery photo"} loading="lazy" className="w-full object-cover" />
            {g.caption && <figcaption className="p-3 text-sm text-muted-foreground">{g.caption}</figcaption>}
          </figure>
        ))}
      </section>
    </SiteLayout>
  );
}
