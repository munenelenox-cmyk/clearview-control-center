import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Landmark, ShieldCheck, Users, Wallet } from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCurrentUser, useOrgSettings, useRows } from "@/lib/data";
import { daysSince, formatDate, formatKes } from "@/lib/format";
import { summarizeTransactions } from "@/lib/finance";
import { CORE_ACTIVITIES } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — L.E.A.P. Generation CBO" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: me } = useCurrentUser();
  const { data: org } = useOrgSettings();
  const { data: members = [] } = useRows("members");
  const { data: meetings = [] } = useRows("meetings");
  const { data: txns = [] } = useRows("transactions");
  const { data: tasks = [] } = useRows("compliance_tasks");
  const { data: activities = [] } = useRows("activities");

  const firstName = (me?.profile?.full_name || "").split(" ")[0] || "there";
  const execs = members.filter((m) => m.is_executive).length;
  const { balance, income, expenses } = summarizeTransactions(txns);
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const upcoming = activities.filter((a) => a.status !== "Done").slice(0, 4);
  const journey = [...meetings].sort((a, b) => a.held_on.localeCompare(b.held_on));

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated md:p-10">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 rounded-full border-0 bg-brand-gold text-foreground hover:bg-brand-gold">
            {org?.tagline ?? "Learn • Empower • Achieve • Progress"}
          </Badge>
          <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">Welcome back, {firstName}</h1>
          <p className="mt-2 text-primary-foreground/80">
            Here's where {org?.name ?? "L.E.A.P. Generation CBO"} stands today.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/members">View members <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/finance">Record a transaction</Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-64 w-64 rounded-full bg-brand-blue/30 blur-3xl" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered members" value={members.length} hint={`${execs} on the executive committee`} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Meetings & milestones" value={meetings.length} hint="Recorded in the minutes" tone="blue" icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard label="Days registered" value={daysSince(org?.reg_date)} hint={`Since ${formatDate(org?.reg_date)}`} tone="gold" icon={<Landmark className="h-5 w-5" />} />
        <StatCard label="Group balance" value={formatKes(balance)} hint={`${formatKes(income)} in · ${formatKes(expenses)} out`} tone="muted" icon={<Wallet className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Our journey" description="Key decisions and milestones" actions={<Button asChild variant="ghost" size="sm"><Link to="/meetings">All meetings</Link></Button>}>
          <ol className="relative ml-2 border-l-2 border-border pl-6">
            {journey.map((m) => (
              <li key={m.id} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-primary" />
                <div className="text-xs font-semibold text-primary">{formatDate(m.held_on)}</div>
                <div className="font-semibold">{m.title}</div>
                {m.summary && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{m.summary}</p>}
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-6">
          <Panel title="Official registration">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Registration no." value={org?.reg_no} />
              <Detail label="Serial no." value={org?.serial_no} />
              <Detail label="Ward" value={org?.ward} />
              <Detail label="Sub-county" value={org?.sub_county} />
              <div className="col-span-2">
                <Detail label="Address" value={[org?.postal_address, org?.physical_address].filter(Boolean).join(" · ")} />
              </div>
            </dl>
          </Panel>

          <Panel title="Compliance progress" actions={<ShieldCheck className="h-5 w-5 text-primary" />}>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{done}</span>
              <span className="text-muted-foreground">of {tasks.length} tasks complete</span>
            </div>
            <Progress value={pct} className="mt-3 h-2.5" />
            <Button asChild variant="link" className="mt-2 px-0">
              <Link to="/compliance">Open checklist <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Upcoming activities" actions={<Button asChild variant="ghost" size="sm"><Link to="/activities">Manage</Link></Button>}>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No planned activities yet.</p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.focus_area} · {a.activity_date ? formatDate(a.activity_date) : "Date to be set"}</div>
                  </div>
                  <Badge variant={a.status === "Ongoing" ? "blue" : "gold"}>{a.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Core activities" description="Article 7 of the group constitution">
          <div className="flex flex-wrap gap-2">
            {CORE_ACTIVITIES.map((c) => (
              <Badge key={c} variant="green" className="px-3 py-1 text-sm font-medium">{c}</Badge>
            ))}
          </div>
          {org?.mission && <p className="mt-4 text-sm text-muted-foreground">{org.mission}</p>}
        </Panel>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words font-semibold">{value || "—"}</dd>
    </div>
  );
}
