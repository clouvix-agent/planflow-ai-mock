import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Box,
  Map,
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { ModeBadge } from "./ModeBadge";
import sprintIqLogo from "@/assets/sprint-iq-logo.png";

interface AppLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Meetings", path: "/meetings", icon: Calendar },
  { label: "Context", path: "/context", icon: FileText },
  { label: "Sprint Actions", path: "/actions", icon: CheckSquare },
  { label: "Jira Console", path: "/jira", icon: Box },
  { label: "Roadmap Sprint Planner", path: "/roadmap", icon: Map },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
];

export const AppLayout = ({ children, pageTitle }: AppLayoutProps) => {
  const location = useLocation();
  const { logout, username } = useAuth();

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Premium Sidebar */}
      <aside className="w-64 bg-sidebar flex flex-col shadow-premium-lg">
        <div className="p-6 border-b border-sidebar-border">
          <img src={sprintIqLogo} alt="Sprint IQ" className="h-10 w-auto" />
          <p className="text-xs text-sidebar-foreground/60 mt-2">Product Management Command Center</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-lg"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User section at bottom */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="text-xs font-bold text-sidebar-primary-foreground">
                  {username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-sidebar-foreground font-medium">{username}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Premium Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shadow-premium-sm sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-foreground">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-6">
            <ModeBadge />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Connected:</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-status-success animate-pulse"></div>
                <span className="text-foreground font-medium">Fireflies · Confluence · Jira</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
};
