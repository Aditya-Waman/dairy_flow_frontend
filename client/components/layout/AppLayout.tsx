import { Link, NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  FileDown,
  LayoutDashboard,
  Settings,
  Users2,
} from "lucide-react";
import { ReactNode } from "react";

function Brand() {
  const { user } = useAuth();
  return (
    <Link to={user ? "/dashboard" : "/signin"} className="flex items-center gap-2 text-primary">
      <div className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-extrabold">DF</div>
      <span className="font-extrabold tracking-tight text-lg">DairyFlow</span>
    </Link>
  );
}

function Topbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const initials = user?.name?.split(" ").map(s=>s[0]).slice(0,2).join("") || "DF";
  return (
    <div className="sticky top-0 z-[1] flex h-14 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="md:hidden" />
      <Brand />
      <div className="ml-auto flex items-center gap-2">
        <Input placeholder="Search…" className="h-9 w-44 hidden sm:block" />
        <ThemeToggle />
        <Button variant="secondary" size="sm" asChild className="hidden md:flex">
          <a href="#" onClick={(e)=>{e.preventDefault(); window.print();}} className="flex items-center gap-2"><FileDown className="size-4"/>Export PDF</a>
        </Button>
        {user ? (
          <>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 grid place-items-center font-bold text-primary border-2 border-primary/20" title={user.name}>{initials}</div>
            <Button size="sm" variant="outline" onClick={logout} className="hover-lift">Logout</Button>
          </>
        ) : (
          <NavLink to="/signin" className="text-sm underline">Sign in</NavLink>
        )}
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, children }: { to: string; icon: any; children: ReactNode }) {
  return (
    <SidebarMenuItem>
      <NavLink to={to}
        className={({ isActive }) => cn("rounded-md", isActive && "")}
      >
        {({ isActive }) => (
          <SidebarMenuButton isActive={isActive}>
            <Icon />
            <span className="flex items-center gap-2">{children}</span>
          </SidebarMenuButton>
        )}
      </NavLink>
    </SidebarMenuItem>
  );
}

export default function AppLayout() {
  const { user } = useAuth();
  const { requests } = useData();
  const pendingCount = requests.filter(r=>r.status==="Pending").length;
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="px-3 pt-3">
          <Brand />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
                <NavItem to="/farmers" icon={Users2}>Farmers</NavItem>
                <NavItem to="/stock" icon={Boxes}>Stock</NavItem>
                <NavItem to="/requests" icon={ClipboardList}>Feed Requests {pendingCount>0 && <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">{pendingCount}</span>}</NavItem>
                <NavItem to="/reports" icon={BarChart3}>Reports</NavItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {user?.role === "superadmin" && (
                  <>
                    <NavItem to="/dashboard/superadmin" icon={Users2}>Superadmin</NavItem>
                    <NavItem to="/admins" icon={Users2}>Admins</NavItem>
                  </>
                )}
                {user?.role === "admin" && (
                  <NavItem to="/dashboard/admin" icon={Users2}>Admin</NavItem>
                )}
                <NavItem to="/settings" icon={Settings}>Settings</NavItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-2 pb-2">
          <Button variant="outline" className="w-full" asChild>
            <a href="https://builder.io" target="_blank" rel="noreferrer">Help & Docs</a>
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="max-w-full overflow-x-hidden">
        <Topbar />
        <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
