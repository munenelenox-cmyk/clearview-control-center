import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout, meta } from "@/components/site/SiteLayout";
import { useGallery } from "@/lib/site";

export const Route = createFileRoute("/gallery")({
  head: () => meta("Gallery — L.E.A.P. Generation CBO", "Photos from our clean-ups, tree planting, meetings and youth activities in Embu County."),
  component: Gallery,
});

function Gallery() {
  const { data: items = [] } = useGallery();
  return (
    <SiteLayout>
      <PageHero eyebrow="Gallery" title="Moments from the movement" />
      {items.length === 0 ? (
        <p className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground sm:px-6">Photos coming soon.</p>
      ) : (
        <section className="mx-auto max-w-6xl columns-1 gap-4 px-4 py-16 sm:columns-2 sm:px-6 lg:columns-3">
          {items.map((g) => (
            <figure key={g.id} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border bg-card">
              <img src={g.image_url} alt={g.caption ?? "Gallery photo"} loading="lazy" className="w-full object-cover" />
              {g.caption && <figcaption className="p-3 text-sm text-muted-foreground">{g.caption}</figcaption>}
            </figure>
          ))}
        </section>
      )}
    </SiteLayout>
  );
}
