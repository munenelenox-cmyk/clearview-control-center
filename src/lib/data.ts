import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";
import type { AppRole } from "@/lib/permissions";

export type TableName = keyof Database["public"]["Tables"];
export type Row<T extends TableName> = Tables<T>;

type Order = { column: string; ascending?: boolean };

const ORDERS: Partial<Record<TableName, Order[]>> = {
  members: [{ column: "sort_order" }, { column: "full_name" }],
  meetings: [{ column: "held_on", ascending: false }],
  transactions: [{ column: "txn_date", ascending: false }, { column: "created_at", ascending: false }],
  activities: [{ column: "activity_date", ascending: false }],
  compliance_tasks: [{ column: "sort_order" }, { column: "created_at" }],
  profiles: [{ column: "created_at" }],
  user_roles: [{ column: "created_at" }],
};

// The generated client is strongly typed per table; this thin wrapper keeps the
// generic CRUD helpers simple while callers still receive typed rows.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useRows<T extends TableName>(table: T) {
  return useQuery({
    queryKey: [table],
    queryFn: async (): Promise<Row<T>[]> => {
      let q = db.from(table).select("*");
      for (const o of ORDERS[table] ?? []) {
        q = q.order(o.column, { ascending: o.ascending ?? true, nullsFirst: false });
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveRow<T extends TableName>(table: T, label = "Record") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown> & { id?: string | number | undefined }) => {
      const { id, ...rest } = values;
      const res = id
        ? await db.from(table).update(rest).eq("id", id)
        : await db.from(table).insert(rest);
      if (res.error) throw res.error;
      return Boolean(id);
    },
    onSuccess: (wasUpdate) => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success(`${label} ${wasUpdate ? "updated" : "added"}`);
    },
    onError: (e: Error) => toast.error(e.message || "Could not save"),
  });
}

export function useDeleteRow<T extends TableName>(table: T, label = "Record") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success(`${label} deleted`);
    },
    onError: (e: Error) => toast.error(e.message || "Could not delete"),
  });
}

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: Row<"profiles"> | null;
  role: AppRole | null;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async (): Promise<CurrentUser | null> => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return null;
      const [{ data: profile }, { data: roleRow }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
      ]);
      return {
        id: user.id,
        email: user.email ?? null,
        profile: profile ?? null,
        role: (roleRow?.role as AppRole | undefined) ?? null,
      };
    },
    staleTime: 60_000,
  });
}

export function useOrgSettings() {
  return useQuery({
    queryKey: ["org_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("org_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
