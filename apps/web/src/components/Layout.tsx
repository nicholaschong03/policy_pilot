import { NavLink, Outlet } from "react-router-dom";
import { MessageSquare, Zap, Database, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const Layout = () => {
  const { profile, signOut, isAdmin } = useAuth();
  
  const navItems = [
    { name: "Chat", path: "/staff", icon: MessageSquare },
    { name: "Triage", path: "/staff/triage", icon: Zap },
    ...(isAdmin ? [{ name: "KB Manager", path: "/staff/knowledge-base", icon: Database }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PolicyPilot
              </h1>
            </div>

            {/* Navigation & User Info */}
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300",
                        "hover:bg-glass/40 hover:scale-105",
                        isActive
                          ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-b-2 border-primary glow-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>

              {/* User Profile & Logout */}
              <div className="flex items-center space-x-3 border-l border-white/20 pl-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{profile?.full_name || profile?.email}</span>
                  <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                    {isAdmin ? "Admin" : "Agent"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;