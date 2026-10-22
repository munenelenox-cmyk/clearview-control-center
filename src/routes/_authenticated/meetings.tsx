import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Pencil, Plus, Users } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/app/PageHeader";
import { FormDialog, type FieldDef } from "@/components/app/FormDialog";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser, useDeleteRow, useRows, useSaveRow, type Row } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { canEditRecords } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({ meta: [{ title: "Meetings — L.E.A.P. Generation CBO" }] }),
  component: Meetings,
});

const KINDS = ["Meeting", "AGM", "Executive meeting", "Activity", "Milestone"] as const;
const FIELDS: FieldDef[] = [
  { name: "title", label: "Title", required: true, full: true },
  { name: "held_on", label: "Date", type: "date", required: true },
  { name: "kind", label: "Type", type: "select", options: KINDS },
  { name: "venue", label: "Venue & time", placeholder: "Kevote Market Grounds, 4:00pm" },
  { name: "attendance", label: "Attendance", placeholder: "16 present" },
  { name: "summary", label: "Resolutions / minutes summary", type: "textarea" },
];

function kindVariant(k: string) {
  if (k === "Milestone") return "gold" as const;
  if (k === "Activity") return "blue" as const;
  return "green" as const;
}

function Meetings() {
  const { data: rows = [] } = useRows("meetings");
  const { data: me } = useCurrentUser();
  const editable = canEditRecords(me?.role);
  const save = useSaveRow("meetings", "Meeting");
  const del = useDeleteRow("meetings", "Meeting");
  const [editing, setEditing] = useState<Row<"meetings"> | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Meetings & minutes"
        description="The official record of what the group has decided."
        actions={editable && <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Record meeting</Button>}
      />
      {rows.length === 0 ? (
        <EmptyState title="No meetings recorded yet" />
      ) : (
        <div className="space-y-4">
          {rows.map((m) => (
            <article key={m.id} className="rounded-2xl border bg-card p-5 shadow-card md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                <div className="grid w-16 shrink-0 place-items-center rounded-xl bg-brand-green-soft py-2 text-primary">
                  <div className="text-xl font-extrabold leading-none">{new Date(m.held_on + "T00:00").getDate()}</div>
                  <div className="text-[11px] font-semibold uppercase">
                    {new Date(m.held_on + "T00:00").toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold">{m.title}</h3>
                    <Badge variant={kindVariant(m.kind)}>{m.kind}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{formatDate(m.held_on)}</span>
                    {m.venue && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{m.venue}</span>}
                    {m.attendance && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{m.attendance}</span>}
                  </div>
                  {m.summary && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.summary}</p>}
                </div>
                {editable && (
                  <div className="flex shrink-0 gap-1 self-end md:self-start">
                    <Button variant="ghost" size="icon" aria-label="Edit meeting" onClick={() => { setEditing(m); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmDelete what={m.title} onConfirm={() => del.mutate(m.id)} />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit meeting" : "Record meeting"}
        fields={FIELDS}
        initial={editing ?? { kind: "Meeting", held_on: new Date().toISOString().slice(0, 10) }}
        onSubmit={(p) => save.mutateAsync({ ...(p as Partial<Row<"meetings">>), id: editing?.id })}
      />
    </>
  );
}
