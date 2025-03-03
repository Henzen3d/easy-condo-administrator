
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Auto-collapse for medium size screens
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse for medium screens (between 768px and 1024px)
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setSidebarCollapsed(false);
      }
    };

    // Initial setup
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Sidebar for desktop/tablet */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={closeMobileMenu}
      />
      
      {/* Main content area */}
      <div 
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${
          !isMobile ? (sidebarCollapsed ? "ml-16" : "ml-64") : "ml-0"
        }`}
      >
        <Header>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMobileMenu}
              className="mr-2"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </Button>
          )}
        </Header>
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile menu */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 animate-fade-in" 
          onClick={closeMobileMenu}
        />
      )}
    </div>
  );
}
