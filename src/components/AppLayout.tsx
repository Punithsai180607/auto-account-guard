import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export function AppLayout() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Shield className="h-5 w-5 text-foreground" />
              <span className="font-semibold text-sm text-foreground">Account Deactivation System</span>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                  {user.role}
                </Badge>
              </div>
            )}
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
