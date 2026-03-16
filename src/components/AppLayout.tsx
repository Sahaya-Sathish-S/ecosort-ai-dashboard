import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ecosortLogo from "@/assets/ecosort-logo.png";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden sm:flex items-center gap-2">
                <img src={ecosortLogo} alt="" className="h-6 w-6 object-contain" />
                <span className="text-sm font-display font-semibold text-muted-foreground">
                  Smart Waste Management
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full gradient-eco text-primary-foreground">ADMIN</span>
              )}
              <span className="text-xs text-muted-foreground hidden sm:block max-w-[150px] truncate">{user?.email}</span>
              <Link to="/profile" className="p-2 rounded-lg hover:bg-primary/10 transition-colors" title="Profile">
                <User className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-primary/10 transition-colors" title="Notifications">
                <Bell className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out" className="hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
