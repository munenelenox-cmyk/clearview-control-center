import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DOCUMENTS } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({ meta: [{ title: "Documents — L.E.A.P. Generation CBO" }] }),
  component: Documents,
});

function size(bytes: number) {
  return bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;
}

function Documents() {
  return (
    <>
      <PageHeader title="Documents" description="Official records of L.E.A.P. Generation CBO." />
      <div className="grid gap-4 md:grid-cols-2">
        {DOCUMENTS.map((d) => (
          <div key={d.title} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-card">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold">{d.title}</h3>
                <Badge variant="muted">{d.type} · {size(d.size)}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <a href={d.url} target="_blank" rel="noreferrer" download>
                  <Download className="mr-2 h-4 w-4" /> Download
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
