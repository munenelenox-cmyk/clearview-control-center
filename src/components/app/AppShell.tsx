import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, LogOut, Settings, UserCircle } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/data";
import { initials } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/permissions";
import { LOGO_URL } from "@/lib/brand";
import { AppSidebar } from "./AppSidebar";
import { navLabelFor } from "./nav";

export function useSignOut() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
}

function UserMenu() {
  const { data: me } = useCurrentUser();
  const signOut = useSignOut();
  const name = me?.profile?.full_name || me?.email || "Account";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-muted">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-brand text-sm font-bold text-primary-foreground">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <div className="max-w-[160px] truncate text-sm font-semibold leading-tight">{name}</div>
            <div className="text-xs text-muted-foreground">
              {me?.role ? ROLE_LABELS[me.role] : "Awaiting approval"}
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="truncate text-sm font-semibold">{name}</div>
          <div className="truncate text-xs text-muted-foreground">{me?.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <UserCircle className="mr-2 h-4 w-4" /> My profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AwaitingApproval() {
  const signOut = useSignOut();
  const { data: me } = useCurrentUser();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-card">
        <img src={LOGO_URL} alt="L.E.A.P. Generation CBO" className="mx-auto mb-6 w-48" />
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-gold-soft text-brand-gold-foreground">
          <Clock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold">Your account is awaiting approval</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You're signed in as <strong className="text-foreground">{me?.email}</strong>. An administrator
          of L.E.A.P. Generation CBO needs to give you access before you can see the group's records.
        </p>
        <Button variant="outline" className="mt-6" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}

export function AppShell() {
  const { data: me, isLoading } = useCurrentUser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }
  if (me && !me.role) return <AwaitingApproval />;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">L.E.A.P. Generation CBO</div>
            <div className="truncate text-sm font-semibold">{navLabelFor(pathname)}</div>
          </div>
          {me?.role === "viewer" && (
            <Badge variant="muted" className="hidden sm:inline-flex">
              Read-only
            </Badge>
          )}
          <UserMenu />
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
