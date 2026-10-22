import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Pencil, Plus, Wallet } from "lucide-react";
import { PageHeader, Panel, StatCard, EmptyState } from "@/components/app/PageHeader";
import { FormDialog, type FieldDef } from "@/components/app/FormDialog";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentUser, useDeleteRow, useRows, useSaveRow, type Row } from "@/lib/data";
import { formatDate, formatKes } from "@/lib/format";
import { isExpense, summarizeTransactions, TRANSACTION_KINDS } from "@/lib/finance";
import { canEditRecords } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({ meta: [{ title: "Finance — L.E.A.P. Generation CBO" }] }),
  component: Finance,
});

const FIELDS: FieldDef[] = [
  { name: "txn_date", label: "Date", type: "date", required: true },
  { name: "kind", label: "Type", type: "select", options: TRANSACTION_KINDS },
  { name: "amount", label: "Amount (KES)", type: "number", required: true, full: true },
  { name: "note", label: "Note", type: "textarea", placeholder: "e.g. Monthly contribution – Lenox Munene" },
];

function Finance() {
  const { data: rows = [] } = useRows("transactions");
  const { data: me } = useCurrentUser();
  const editable = canEditRecords(me?.role);
  const save = useSaveRow("transactions", "Transaction");
  const del = useDeleteRow("transactions", "Transaction");
  const [editing, setEditing] = useState<Row<"transactions"> | null>(null);
  const [open, setOpen] = useState(false);
  const s = summarizeTransactions(rows);

  return (
    <>
      <PageHeader
        title="Finance"
        description="Record contributions, donations and expenses transparently."
        actions={editable && <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add transaction</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Income" value={formatKes(s.income)} icon={<ArrowUpRight className="h-5 w-5" />} />
        <StatCard label="Expenses" value={formatKes(s.expenses)} tone="gold" icon={<ArrowDownRight className="h-5 w-5" />} />
        <StatCard label="Balance" value={formatKes(s.balance)} tone="blue" icon={<Wallet className="h-5 w-5" />} />
      </div>

      <div className="my-6 rounded-xl border border-brand-gold/40 bg-brand-gold-soft px-4 py-3 text-sm text-brand-gold-foreground">
        Enter real figures only. Per the constitution, every spend needs authorisation through signed minutes,
        and the Treasurer reports to the executive every quarter.
      </div>

      <Panel title="Ledger">
        {rows.length === 0 ? (
          <EmptyState title="No transactions recorded yet" hint="Add the first contribution or registration fee." />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {editable && <TableHead className="pr-5 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => {
                  const out = isExpense(t.kind);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap pl-5 text-sm">{formatDate(t.txn_date)}</TableCell>
                      <TableCell><Badge variant={out ? "gold" : "green"}>{t.kind}</Badge></TableCell>
                      <TableCell className="hidden max-w-sm truncate text-sm text-muted-foreground md:table-cell">{t.note || "—"}</TableCell>
                      <TableCell className={`whitespace-nowrap text-right font-semibold ${out ? "text-destructive" : "text-primary"}`}>
                        {out ? "−" : "+"}{formatKes(Number(t.amount))}
                      </TableCell>
                      {editable && (
                        <TableCell className="pr-5 text-right">
                          <div className="flex justify-end">
                            <Button variant="ghost" size="icon" aria-label="Edit transaction" onClick={() => { setEditing(t); setOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <ConfirmDelete what="this transaction" onConfirm={() => del.mutate(t.id)} />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit transaction" : "Add transaction"}
        fields={FIELDS}
        initial={editing ?? { kind: "Contribution", txn_date: new Date().toISOString().slice(0, 10) }}
        onSubmit={(p) => save.mutateAsync({ ...(p as Partial<Row<"transactions">>), id: editing?.id })}
      />
    </>
  );
}
