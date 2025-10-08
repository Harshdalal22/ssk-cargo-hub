import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Truck,
  FileText,
  Database,
  TrendingUp,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserEmail(session.user.email || "");
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", openInNewTab: false },
    { icon: TrendingUp, label: "Analytics", path: "/analytics", openInNewTab: false },
    { icon: Truck, label: "Vehicle Hiring", path: "/vehicle-hiring", openInNewTab: false },
    { icon: FileText, label: "Booking Register", path: "/booking-register", openInNewTab: false },
    { icon: Database, label: "Data Management", path: "/data-management", openInNewTab: false },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Mobile Top Navigation - Horizontal */}
      <div className="lg:hidden sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <Truck className="h-4 w-4" />
            </div>
            <h2 className="font-bold text-sm">SSK Cargo</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        {/* Horizontal scrollable nav */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-2 pb-2 min-w-max">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="whitespace-nowrap text-xs h-8 px-3"
                >
                  <item.icon className="h-3.5 w-3.5 mr-1.5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Overlay Sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        >
          <aside
            className="w-64 h-full bg-card border-r border-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                  <Truck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-lg">SSK Cargo</h2>
                  <p className="text-xs text-muted-foreground">Management System</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsSidebarOpen(false)}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-border space-y-3">
              <div className="text-sm text-muted-foreground px-3 truncate">
                {userEmail}
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1 w-full">
        {/* Desktop Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "w-64" : "w-0"
          } transition-all duration-300 bg-card border-r border-border flex flex-col overflow-hidden`}
        >
          <div className="p-6 flex items-center gap-3 border-b border-border">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Truck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">SSK Cargo</h2>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              item.openInNewTab ? (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </a>
              ) : (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-3">
            <div className="text-sm text-muted-foreground px-3 truncate">
              {userEmail}
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Desktop Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 border-b border-border bg-card flex items-center px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </header>

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Main Content */}
      <main className="lg:hidden flex-1 p-4">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
