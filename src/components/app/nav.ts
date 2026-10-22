import {
  Activity,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Star,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  to:
    | "/dashboard"
    | "/members"
    | "/leadership"
    | "/meetings"
    | "/activities"
    | "/finance"
    | "/compliance"
    | "/documents"
    | "/users"
    | "/settings";
  label: string;
  icon: LucideIcon;
};

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Community",
    items: [
      { to: "/members", label: "Members", icon: Users },
      { to: "/leadership", label: "Leadership", icon: Star },
      { to: "/meetings", label: "Meetings", icon: CalendarDays },
      { to: "/activities", label: "Activities", icon: Activity },
    ],
  },
  {
    label: "Governance",
    items: [
      { to: "/finance", label: "Finance", icon: Wallet },
      { to: "/compliance", label: "Compliance", icon: ShieldCheck },
      { to: "/documents", label: "Documents", icon: FileText },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/users", label: "Users", icon: UserCog },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function navLabelFor(pathname: string): string {
  for (const g of NAV_GROUPS) for (const i of g.items) if (pathname.startsWith(i.to)) return i.label;
  return "Dashboard";
}
