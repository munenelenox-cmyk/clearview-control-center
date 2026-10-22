import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "L.E.A.P. Generation CBO — Management Dashboard" },
      {
        name: "description",
        content: "Sign in to manage members, meetings, finance and compliance for L.E.A.P. Generation CBO.",
      },
      { property: "og:title", content: "L.E.A.P. Generation CBO — Management Dashboard" },
      {
        property: "og:description",
        content: "Learn • Empower • Achieve • Progress. Internal management workspace for the CBO.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
