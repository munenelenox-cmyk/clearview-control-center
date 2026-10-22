import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/app/PageHeader";
import { FormDialog, type FieldDef } from "@/components/app/FormDialog";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentUser, useDeleteRow, useRows, useSaveRow, type Row } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { canEditRecords } from "@/lib/permissions";
import { CORE_ACTIVITIES } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({ meta: [{ title: "Activities — L.E.A.P. Generation CBO" }] }),
  component: Activities,
});

const STATUSES = ["Planned", "Ongoing", "Done"] as const;
const FIELDS: FieldDef[] = [
  { name: "name", label: "Activity name", required: true, full: true },
  { name: "activity_date", label: "Date", type: "date" },
  { name: "status", label: "Status", type: "select", options: STATUSES },
  { name: "focus_area", label: "Focus area", type: "select", options: CORE_ACTIVITIES, full: true },
  { name: "description", label: "Description", type: "textarea" },
];

function Activities() {
  const { data: rows = [] } = useRows("activities");
  const { data: me } = useCurrentUser();
  const editable = canEditRecords(me?.role);
  const save = useSaveRow("activities", "Activity");
  const del = useDeleteRow("activities", "Activity");
  const [editing, setEditing] = useState<Row<"activities"> | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Activities"
        description="Projects and events carried out by members."
        actions={editable && <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add activity</Button>}
      />
      <Panel>
        {rows.length === 0 ? (
          <EmptyState title="No activities yet" />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Activity</TableHead>
                  <TableHead className="hidden md:table-cell">Focus area</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {editable && <TableHead className="pr-5 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-5">
                      <div className="font-semibold">{a.name}</div>
                      {a.description && <div className="line-clamp-1 max-w-md text-xs text-muted-foreground">{a.description}</div>}
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">{a.focus_area || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{a.activity_date ? formatDate(a.activity_date) : "To be set"}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "Done" ? "green" : a.status === "Ongoing" ? "blue" : "gold"}>{a.status}</Badge>
                    </TableCell>
                    {editable && (
                      <TableCell className="pr-5 text-right">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" aria-label="Edit activity" onClick={() => { setEditing(a); setOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <ConfirmDelete what={a.name} onConfirm={() => del.mutate(a.id)} />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
      <Panel title="Core activities (Article 7)" className="mt-6">
        <div className="flex flex-wrap gap-2">
          {CORE_ACTIVITIES.map((c) => <Badge key={c} variant="green" className="px-3 py-1 text-sm font-medium">{c}</Badge>)}
        </div>
      </Panel>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit activity" : "Add activity"}
        fields={FIELDS}
        initial={editing ?? { status: "Planned", focus_area: CORE_ACTIVITIES[0] }}
        onSubmit={(p) => save.mutateAsync({ ...(p as Partial<Row<"activities">>), id: editing?.id })}
      />
    </>
  );
}
