export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatKes(amount: number): string {
  const sign = amount < 0 ? "−" : "";
  return `${sign}KES ${Math.abs(amount).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function daysSince(date: string | null | undefined, now = new Date()): number {
  if (!date) return 0;
  const d = new Date(`${date}T00:00:00`);
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86_400_000));
}
