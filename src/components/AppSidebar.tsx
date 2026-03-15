import {
  Home, LayoutDashboard, Trash2, Brain, BarChart3,
  Map, Bell, Leaf, Settings, Trophy, MessageCircle,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Bin Monitoring", url: "/monitoring", icon: Trash2 },
  { title: "AI Detection", url: "/detection", icon: Brain },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Smart Map", url: "/map", icon: Map },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "AI Chat", url: "/chat", icon: MessageCircle },
];

const systemItems = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Awareness", url: "/awareness", icon: Leaf },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const adminItems = isAdmin ? [{ title: "Admin Panel", url: "/admin", icon: Settings }] : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg gradient-eco flex items-center justify-center flex-shrink-0">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-display font-bold text-sidebar-foreground">EcoSort AI</h2>
              <p className="text-[10px] text-sidebar-foreground/60">Smart Waste Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/"} activeClassName="bg-sidebar-accent text-sidebar-primary">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[...systemItems, ...adminItems].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} activeClassName="bg-sidebar-accent text-sidebar-primary">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-[11px] text-sidebar-foreground/70">System Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse-glow" />
              <span className="text-xs text-sidebar-foreground">All systems online</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
