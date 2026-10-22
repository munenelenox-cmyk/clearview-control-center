import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "date" | "number" | "select" | "switch";
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
  full?: boolean;
  hint?: string;
};

type Values = Record<string, string | boolean>;

function toFormValues(fields: FieldDef[], initial?: Record<string, unknown> | null): Values {
  const v: Values = {};
  for (const f of fields) {
    const raw = initial?.[f.name];
    if (f.type === "switch") v[f.name] = Boolean(raw);
    else if (raw === null || raw === undefined) v[f.name] = f.type === "select" ? (f.options?.[0] ?? "") : "";
    else v[f.name] = String(raw);
  }
  return v;
}

export function toPayload(fields: FieldDef[], values: Values): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const val = values[f.name];
    if (f.type === "switch") out[f.name] = Boolean(val);
    else if (f.type === "number") out[f.name] = val === "" ? null : Number(val);
    else out[f.name] = typeof val === "string" && val.trim() === "" ? null : typeof val === "string" ? val.trim() : val;
  }
  return out;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial,
  onSubmit,
  submitLabel = "Save",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FieldDef[];
  initial?: Record<string, unknown> | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<unknown>;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Values>(() => toFormValues(fields, initial));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setValues(toFormValues(fields, initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = (name: string, v: string | boolean) => setValues((s) => ({ ...s, [name]: v }));

  async function handle(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(toPayload(fields, values));
      onOpenChange(false);
    } catch {
      // errors are surfaced by the mutation's toast
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handle} className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => {
            const id = `f-${f.name}`;
            const full = f.full || f.type === "textarea";
            return (
              <div key={f.name} className={full ? "sm:col-span-2" : ""}>
                {f.type === "switch" ? (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label htmlFor={id}>{f.label}</Label>
                      {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                    </div>
                    <Switch id={id} checked={Boolean(values[f.name])} onCheckedChange={(c) => set(f.name, c)} />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor={id}>
                      {f.label}
                      {f.required && <span className="text-destructive"> *</span>}
                    </Label>
                    {f.type === "textarea" ? (
                      <Textarea
                        id={id}
                        rows={4}
                        value={String(values[f.name] ?? "")}
                        placeholder={f.placeholder}
                        required={f.required}
                        onChange={(e) => set(f.name, e.target.value)}
                      />
                    ) : f.type === "select" ? (
                      <Select value={String(values[f.name] ?? "")} onValueChange={(v) => set(f.name, v)}>
                        <SelectTrigger id={id}>
                          <SelectValue placeholder={f.placeholder ?? "Choose"} />
                        </SelectTrigger>
                        <SelectContent>
                          {f.options?.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={id}
                        type={f.type ?? "text"}
                        value={String(values[f.name] ?? "")}
                        placeholder={f.placeholder}
                        required={f.required}
                        min={f.type === "number" ? 0 : undefined}
                        step={f.type === "number" ? "0.01" : undefined}
                        onChange={(e) => set(f.name, e.target.value)}
                      />
                    )}
                    {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                  </div>
                )}
              </div>
            );
          })}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
