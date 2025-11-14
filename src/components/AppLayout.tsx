import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Box,
  Settings as SettingsIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  { label: "Settings", path: "/settings", icon: SettingsIcon },
];

export const AppLayout = ({ children, pageTitle }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <aside className="w-60 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-semibold text-foreground">PlanFlow AI</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-foreground">{pageTitle}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Connected:</span>
            <span className="text-foreground font-medium">Fireflies · Confluence · Jira</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
