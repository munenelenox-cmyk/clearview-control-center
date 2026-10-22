import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Pencil, Plus, Search, ShieldCheck } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/app/PageHeader";
import { FormDialog, type FieldDef } from "@/components/app/FormDialog";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser, useDeleteRow, useRows, useSaveRow, type Row } from "@/lib/data";
import { formatDate, initials } from "@/lib/format";
import { canEditRecords } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => ({ meta: [{ title: "Members — L.E.A.P. Generation CBO" }] }),
  component: MembersPage,
});

export const POSITIONS = [
  "Chairperson",
  "Vice Chairperson",
  "Secretary",
  "Vice Secretary",
  "Treasurer",
  "Committee Member",
  "Member",
] as const;
const STATUSES = ["Active", "Pending confirmation", "Inactive"] as const;

const FIELDS: FieldDef[] = [
  { name: "full_name", label: "Full name", required: true, full: true },
  { name: "position", label: "Position", type: "select", options: POSITIONS },
  { name: "status", label: "Status", type: "select", options: STATUSES },
  { name: "phone", label: "Phone", type: "tel", placeholder: "07xx xxx xxx" },
  { name: "email", label: "Email", type: "email" },
  { name: "id_number", label: "National ID no.", hint: "Required for group records (Art. 8.3)" },
  { name: "gender", label: "Gender", type: "select", options: ["Not specified", "Female", "Male"] },
  { name: "joined_on", label: "Joined on", type: "date" },
  { name: "is_executive", label: "Executive committee", type: "switch" },
  { name: "is_signatory", label: "Bank signatory", type: "switch" },
  { name: "notes", label: "Notes", type: "textarea" },
];

function statusVariant(s: string) {
  if (s === "Active") return "green" as const;
  if (s === "Inactive") return "muted" as const;
  return "gold" as const;
}

function exportCsv(rows: Row<"members">[]) {
  const head = ["Name", "Position", "Phone", "Email", "ID number", "Status", "Joined", "Signatory"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((m) =>
    [m.full_name, m.position, m.phone, m.email, m.id_number, m.status, m.joined_on, m.is_signatory ? "Yes" : "No"]
      .map(esc)
      .join(","),
  );
  const blob = new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leap-generation-members.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function MembersPage() {
  const { data: rows = [], isLoading } = useRows("members");
  const { data: me } = useCurrentUser();
  const editable = canEditRecords(me?.role);
  const save = useSaveRow("members", "Member");
  const del = useDeleteRow("members", "Member");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [group, setGroup] = useState("all");
  const [editing, setEditing] = useState<Row<"members"> | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return rows.filter(
      (m) =>
        (!s || [m.full_name, m.phone, m.email, m.position].some((v) => v?.toLowerCase().includes(s))) &&
        (status === "all" || m.status === status) &&
        (group === "all" || (group === "exec" ? m.is_executive : !m.is_executive)),
    );
  }, [rows, q, status, group]);

  const pending = rows.filter((r) => r.status === "Pending confirmation").length;

  return (
    <>
      <PageHeader
        title="Members"
        description={`${rows.length} people on the register · founding members recorded from the 17 Aug and 5 Sep 2025 meetings.`}
        actions={
          <>
            <Button variant="outline" onClick={() => exportCsv(filtered)}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            {editable && (
              <Button onClick={() => { setEditing(null); setOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Add member
              </Button>
            )}
          </>
        }
      />

      {pending > 0 && (
        <div className="mb-4 rounded-xl border border-brand-gold/40 bg-brand-gold-soft px-4 py-3 text-sm text-brand-gold-foreground">
          {pending} {pending === 1 ? "person is" : "people are"} named in the minutes but not in the attendance
          lists. Confirm and update their status.
        </div>
      )}

      <Panel>
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, phone, email or position…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              <SelectItem value="exec">Executive committee</SelectItem>
              <SelectItem value="members">General members</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="md:w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No members match" hint="Try a different search or filter." />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Member</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead>Status</TableHead>
                  {editable && <TableHead className="pr-5 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={m.is_executive ? "bg-gradient-brand text-xs font-bold text-primary-foreground" : "bg-muted text-xs font-bold"}>
                            {initials(m.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <span className="truncate">{m.full_name}</span>
                            {m.is_signatory && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-label="Bank signatory" />}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">{m.email || m.phone || "No contact yet"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.is_executive ? "blue" : "muted"}>{m.position}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">{m.phone || "—"}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{formatDate(m.joined_on)}</TableCell>
                    <TableCell><Badge variant={statusVariant(m.status)}>{m.status}</Badge></TableCell>
                    {editable && (
                      <TableCell className="pr-5 text-right">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" aria-label={`Edit ${m.full_name}`} onClick={() => { setEditing(m); setOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <ConfirmDelete what={m.full_name} onConfirm={() => del.mutate(m.id)} />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4 text-xs text-muted-foreground">
          Showing {filtered.length} of {rows.length}
        </div>
      </Panel>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit member" : "Add member"}
        description="Member details are visible only to approved dashboard users."
        fields={FIELDS}
        initial={editing ?? { position: "Member", status: "Active", gender: "Not specified", joined_on: new Date().toISOString().slice(0, 10) }}
        onSubmit={(p) => save.mutateAsync({ ...(p as Partial<Row<"members">>), id: editing?.id })}
      />
    </>
  );
}
