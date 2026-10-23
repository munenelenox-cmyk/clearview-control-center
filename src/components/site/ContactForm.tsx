import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm({ interest }: { interest?: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: String(f.get("name")).trim(),
      email: String(f.get("email")).trim(),
      phone: String(f.get("phone") || "").trim() || null,
      interest: interest ?? (String(f.get("interest") || "") || null),
      message: String(f.get("message")).trim(),
    });
    setBusy(false);
    if (error) { toast.error("Could not send your message. Please try again."); return; }
    setDone(true);
  }
  if (done) return <div className="rounded-2xl border bg-brand-green-soft p-8 text-center"><h3 className="text-lg font-bold">Thank you!</h3><p className="mt-1 text-sm text-muted-foreground">We've received your message and will get back to you soon.</p></div>;
  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-card sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="cn">Full name</Label><Input id="cn" name="name" required maxLength={120} /></div>
        <div className="space-y-1.5"><Label htmlFor="ce">Email</Label><Input id="ce" name="email" type="email" required maxLength={255} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="cp">Phone (optional)</Label><Input id="cp" name="phone" maxLength={40} /></div>
        {!interest && (
          <div className="space-y-1.5"><Label htmlFor="ci">I'm interested in</Label>
            <select id="ci" name="interest" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option>General enquiry</option><option>Volunteering</option><option>Membership</option><option>Partnership</option><option>Donation</option>
            </select>
          </div>
        )}
      </div>
      <div className="space-y-1.5"><Label htmlFor="cm">Message</Label><Textarea id="cm" name="message" rows={5} required maxLength={3000} /></div>
      <Button type="submit" size="lg" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send message</Button>
    </form>
  );
}
