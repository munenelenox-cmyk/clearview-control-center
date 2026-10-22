import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/leadership")({
  head: () => ({ meta: [{ title: "Leadership — L.E.A.P. Generation CBO" }] }),
  component: Leadership,
});

function Leadership() {
  const { data: members = [] } = useRows("members");
  const execs = members.filter((m) => m.is_executive);

  return (
    <>
      <PageHeader
        title="Leadership"
        description="Executive committee elected by secret ballot on 17 August 2025."
        actions={<Button asChild variant="outline"><Link to="/members">Edit in members</Link></Button>}
      />
      {execs.length === 0 ? (
        <EmptyState title="No executive members yet" hint="Mark members as 'Executive committee' on the Members page." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {execs.map((e) => (
            <div key={e.id} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-brand text-lg font-extrabold text-primary-foreground">
                  {initials(e.full_name)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold">{e.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{e.position}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {e.is_signatory && <Badge variant="gold">Bank signatory</Badge>}
                {e.status !== "Active" && <Badge variant="gold">{e.status}</Badge>}
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {e.phone || "Phone not recorded"}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <span className="truncate">{e.email || "Email not recorded"}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Panel title="Terms of office" className="mt-6">
        <p className="text-sm text-muted-foreground">
          Leaders are elected by secret ballot every 3 years and may serve a maximum of 2 terms. Withdrawals
          require the signatures of at least three officials, including the Treasurer. Members get two months'
          notice of elections (Art. 16.3).
        </p>
      </Panel>
    </>
  );
}
