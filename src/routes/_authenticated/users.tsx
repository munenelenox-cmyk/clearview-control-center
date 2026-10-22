import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, StatCard, EmptyState } from "@/components/app/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, useRows } from "@/lib/data";
import { formatDate, initials } from "@/lib/format";
import { isAdmin, ROLE_DESCRIPTIONS, ROLE_LABELS, type AppRole } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users — L.E.A.P. Generation CBO" }] }),
  component: UsersPage,
});

const ROLES: AppRole[] = ["admin", "editor", "viewer"];

function UsersPage() {
  const { data: me } = useCurrentUser();
  const admin = isAdmin(me?.role);
  const { data: profiles = [] } = useRows("profiles");
  const { data: roles = [] } = useRows("user_roles");
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const roleOf = useMemo(() => new Map(roles.map((r) => [r.user_id, r.role as AppRole])), [roles]);
  const list = profiles.filter((p) =>
    !q || [p.full_name, p.email, p.title].some((v) => v?.toLowerCase().includes(q.toLowerCase())),
  );
  const pending = profiles.filter((p) => !roleOf.has(p.id)).length;

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole | "none" }) => {
      const current = roleOf.get(userId);
      if (role === "none") {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
        if (error) throw error;
      } else if (current) {
        const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Access updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Users"
        description="People who can sign in to this dashboard and what they're allowed to do."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Accounts" value={profiles.length} />
        <StatCard label="Administrators" value={roles.filter((r) => r.role === "admin").length} tone="blue" />
        <StatCard label="Awaiting approval" value={pending} tone="gold" icon={<UserPlus className="h-5 w-5" />} />
      </div>

      <Panel>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            New people create an account on the sign-in page, then appear here for approval.
          </p>
        </div>
        {list.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">User</TableHead>
                  <TableHead className="hidden md:table-cell">Title</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="pr-5">Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => {
                  const role = roleOf.get(p.id);
                  const self = p.id === me?.id;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-gradient-brand text-xs font-bold text-primary-foreground">
                              {initials(p.full_name || p.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="truncate font-semibold">
                              {p.full_name || "Unnamed"} {self && <span className="text-xs font-normal text-muted-foreground">(you)</span>}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">{p.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm md:table-cell">{p.title || "—"}</TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{formatDate(p.created_at)}</TableCell>
                      <TableCell className="pr-5">
                        {admin && !self ? (
                          <Select
                            value={role ?? "none"}
                            onValueChange={(v) => setRole.mutate({ userId: p.id, role: v as AppRole | "none" })}
                          >
                            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r} value={r}>
                                  <div>{ROLE_LABELS[r]}</div>
                                  <div className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</div>
                                </SelectItem>
                              ))}
                              <SelectItem value="none">No access</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : role ? (
                          <Badge variant={role === "admin" ? "blue" : role === "editor" ? "green" : "muted"}>{ROLE_LABELS[role]}</Badge>
                        ) : (
                          <Badge variant="gold">Awaiting approval</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
    </>
  );
}
