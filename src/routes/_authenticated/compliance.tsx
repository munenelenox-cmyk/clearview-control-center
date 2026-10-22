import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { PageHeader, Panel } from "@/components/app/PageHeader";
import { FormDialog, type FieldDef } from "@/components/app/FormDialog";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCurrentUser, useDeleteRow, useRows, useSaveRow, type Row } from "@/lib/data";
import { canEditRecords } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/compliance")({
  head: () => ({ meta: [{ title: "Compliance — L.E.A.P. Generation CBO" }] }),
  component: Compliance,
});

const FIELDS: FieldDef[] = [
  { name: "title", label: "Task", required: true, full: true },
  { name: "reference", label: "Reference", placeholder: "e.g. Art. 11" },
  { name: "sort_order", label: "Order", type: "number" },
];

function Compliance() {
  const { data: rows = [] } = useRows("compliance_tasks");
  const { data: me } = useCurrentUser();
  const editable = canEditRecords(me?.role);
  const save = useSaveRow("compliance_tasks", "Task");
  const del = useDeleteRow("compliance_tasks", "Task");
  const [editing, setEditing] = useState<Row<"compliance_tasks"> | null>(null);
  const [open, setOpen] = useState(false);
  const done = rows.filter((r) => r.done).length;

  return (
    <>
      <PageHeader
        title="Compliance & governance"
        description="Obligations drawn from the group constitution and minutes."
        actions={editable && <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add task</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Checklist" description={`${done} of ${rows.length} complete`}>
          <Progress value={rows.length ? (done / rows.length) * 100 : 0} className="mb-4 h-2" />
          <ul className="divide-y">
            {rows.map((t) => (
              <li key={t.id} className="flex items-start gap-3 py-3">
                <Checkbox
                  id={t.id}
                  checked={t.done}
                  disabled={!editable}
                  onCheckedChange={(c) => save.mutate({ id: t.id, done: c === true })}
                  className="mt-0.5 h-5 w-5"
                />
                <label htmlFor={t.id} className={`flex-1 cursor-pointer text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}>
                  {t.title}
                  {t.reference && <Badge variant="muted" className="ml-2 align-middle text-[10px]">{t.reference}</Badge>}
                </label>
                {editable && (
                  <div className="flex shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit task" onClick={() => { setEditing(t); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <ConfirmDelete what="this task" onConfirm={() => del.mutate(t.id)} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Key rules at a glance">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Quorum:</strong> two-thirds of members for meetings and the AGM; 75% to amend the constitution or dissolve the group.</p>
            <p><strong className="text-foreground">Exits:</strong> members who leave or are removed receive 80% of their shares and savings after one month.</p>
            <p><strong className="text-foreground">Withdrawals:</strong> need at least three officials' signatures, including the Treasurer.</p>
            <div className="rounded-xl bg-brand-gold-soft p-3 text-brand-gold-foreground">
              Constitution check: Art. 15.1 sets the AGM for December while Art. 16.3 says elections happen at an
              AGM in November. Consider aligning these at the next amendment.
            </div>
          </div>
        </Panel>
      </div>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit task" : "Add task"}
        fields={FIELDS}
        initial={editing ?? { sort_order: rows.length + 1 }}
        onSubmit={(p) => save.mutateAsync({ ...(p as Partial<Row<"compliance_tasks">>), id: editing?.id })}
      />
    </>
  );
}
