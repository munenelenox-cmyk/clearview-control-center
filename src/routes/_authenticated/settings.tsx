import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, useOrgSettings } from "@/lib/data";
import { isAdmin, ROLE_LABELS } from "@/lib/permissions";
import { LOGO_URL } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — L.E.A.P. Generation CBO" }] }),
  component: SettingsPage,
});

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled,
  textarea,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  textarea?: boolean;
  className?: string;
}) {
  const id = `s-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      {textarea ? (
        <Textarea id={id} rows={3} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} type={type} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

const ORG_FIELDS = [
  ["name", "Organisation name", "full"],
  ["tagline", "Tagline", "full"],
  ["mission", "Mission", "textarea"],
  ["reg_no", "Registration no."],
  ["serial_no", "Serial no."],
  ["reg_date", "Registration date", "date"],
  ["bank", "Bank"],
  ["county", "County"],
  ["sub_county", "Sub-county"],
  ["ward", "Ward"],
  ["location", "Location"],
  ["sub_location", "Sub-location"],
  ["email", "Email", "email"],
  ["phone", "Phone", "tel"],
  ["postal_address", "Postal address", "full"],
  ["physical_address", "Physical address", "full"],
] as const;

type OrgKey = (typeof ORG_FIELDS)[number][0];

function OrgSettings({ canEdit }: { canEdit: boolean }) {
  const { data: org } = useOrgSettings();
  const qc = useQueryClient();
  const [v, setV] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!org) return;
    const next: Record<string, string> = {};
    for (const [k] of ORG_FIELDS) next[k] = (org[k as OrgKey] as string | null) ?? "";
    setV(next);
  }, [org]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload: Record<string, string | null> = {};
    for (const [k] of ORG_FIELDS) payload[k] = v[k]?.trim() ? v[k].trim() : null;
    if (!payload["name"]) payload["name"] = "L.E.A.P. Generation CBO";
    const { error } = await supabase.from("org_settings").update(payload as { name: string }).eq("id", 1);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["org_settings"] });
    toast.success("Organisation details saved");
  }

  return (
    <form onSubmit={save}>
      <Panel title="Organisation profile" description={canEdit ? "Shown across the dashboard." : "Only administrators can change these details."}>
        <div className="mb-6 flex items-center gap-4">
          <div className="w-40 rounded-xl border bg-logo-surface p-2"><img src={LOGO_URL} alt="L.E.A.P. Generation CBO logo" /></div>
          <p className="text-sm text-muted-foreground">Official L.E.A.P. Generation logo.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {ORG_FIELDS.map(([k, label, kind]) => (
            <Field
              key={k}
              label={label}
              value={v[k] ?? ""}
              onChange={(x) => setV((s) => ({ ...s, [k]: x }))}
              type={kind === "date" || kind === "email" || kind === "tel" ? kind : "text"}
              textarea={kind === "textarea"}
              disabled={!canEdit}
              className={kind === "full" || kind === "textarea" ? "sm:col-span-2" : ""}
            />
          ))}
        </div>
        {canEdit && (
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
            </Button>
          </div>
        )}
      </Panel>
    </form>
  );
}

function ProfileSettings() {
  const { data: me } = useCurrentUser();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(me?.profile?.full_name ?? "");
    setPhone(me?.profile?.phone ?? "");
    setTitle(me?.profile?.title ?? "");
  }, [me]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!me) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() || null, phone: phone.trim() || null, title: title.trim() || null })
      .eq("id", me.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["current-user"] });
    qc.invalidateQueries({ queryKey: ["profiles"] });
    toast.success("Profile updated");
  }

  return (
    <form onSubmit={save}>
      <Panel title="My profile" description={`Signed in as ${me?.email ?? ""} · ${me?.role ? ROLE_LABELS[me.role] : ""}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={name} onChange={setName} className="sm:col-span-2" />
          <Field label="Title / position" value={title} onChange={setTitle} />
          <Field label="Phone" type="tel" value={phone} onChange={setPhone} />
          <Field label="Email" value={me?.email ?? ""} onChange={() => {}} disabled className="sm:col-span-2" />
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save profile
          </Button>
        </div>
      </Panel>
    </form>
  );
}

function SecuritySettings() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (next.length < 8) { toast.error("Use at least 8 characters"); return; }
    if (next !== confirm) { toast.error("New passwords don't match"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: next, current_password: current });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setCurrent(""); setNext(""); setConfirm("");
    toast.success("Password changed");
  }

  return (
    <form onSubmit={save}>
      <Panel title="Change password" description="If you signed in with Google, you can skip this.">
        <div className="grid max-w-md gap-4">
          <Field label="Current password" type="password" value={current} onChange={setCurrent} />
          <Field label="New password" type="password" value={next} onChange={setNext} />
          <Field label="Confirm new password" type="password" value={confirm} onChange={setConfirm} />
        </div>
        <div className="mt-6">
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update password
          </Button>
        </div>
      </Panel>
    </form>
  );
}

function SettingsPage() {
  const { data: me } = useCurrentUser();
  return (
    <>
      <PageHeader title="Settings" description="Organisation details, your profile and security." />
      <Tabs defaultValue="organisation">
        <TabsList className="mb-6">
          <TabsTrigger value="organisation">Organisation</TabsTrigger>
          <TabsTrigger value="profile">My profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="organisation"><OrgSettings canEdit={isAdmin(me?.role)} /></TabsContent>
        <TabsContent value="profile"><ProfileSettings /></TabsContent>
        <TabsContent value="security"><SecuritySettings /></TabsContent>
      </Tabs>
    </>
  );
}
