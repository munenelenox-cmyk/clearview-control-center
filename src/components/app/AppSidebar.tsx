import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LOGO_URL, MARK_URL } from "@/lib/brand";
import { NAV_GROUPS } from "./nav";
import { useOrgSettings } from "@/lib/data";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile, state, isMobile } = useSidebar();
  const { data: org } = useOrgSettings();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <Link
          to="/dashboard"
          onClick={() => setOpenMobile(false)}
          className="block overflow-hidden rounded-xl bg-logo-surface p-2 shadow-sm"
        >
          {collapsed ? (
            <img src={MARK_URL} alt="L.E.A.P. Generation" className="mx-auto h-7 w-7 object-contain" />
          ) : (
            <img src={LOGO_URL} alt="L.E.A.P. Generation CBO logo" className="mx-auto h-auto w-full max-w-[200px]" />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className="h-10 rounded-lg font-medium data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                      >
                        <Link to={item.to} onClick={() => setOpenMobile(false)}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="px-4 pb-4 text-xs leading-relaxed text-sidebar-foreground/60">
          <div>Reg. No. {org?.reg_no ?? "DSD/14/64/02/136624"}</div>
          <div>
            {org?.sub_county ?? "Runyenjes"}, {org?.county ?? "Embu"} County, Kenya
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
