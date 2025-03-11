import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart4,
  Building,
  CreditCard,
  FileText,
  Home,
  Receipt,
  Settings,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Gauge,
  FilePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export function Sidebar({ 
  className, 
  collapsed = false, 
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose
}: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isHovering, setIsHovering] = useState(false);
  
  // Main navigation items
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <Home size={20} />,
      href: "/dashboard",
    },
    {
      label: "Unidades & Moradores",
      icon: <Users size={20} />,
      href: "/units",
    },
    {
      label: "Contas Bancárias",
      icon: <CreditCard size={20} />,
      href: "/bank-accounts",
    },
    {
      label: "Transações",
      icon: <BarChart4 size={20} />,
      href: "/transactions",
    },
    {
      label: "Cobranças",
      icon: <Receipt size={20} />,
      href: "/billing",
    },
    {
      label: "Faturamento",
      icon: <FilePlus size={20} />,
      href: "/billing-generator",
    },
    {
      label: "Gestão de Utilities",
      icon: <Gauge size={20} />,
      href: "/utility-management",
    },
    {
      label: "Relatórios",
      icon: <Calendar size={20} />,
      href: "/reports",
    },
  ];

  // Footer item (Settings)
  const footerItem: NavItem = {
    label: "Configurações",
    icon: <Settings size={20} />,
    href: "/settings",
  };

  // For mobile view
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      // Close sidebar on route change for mobile
      return () => {
        if (onMobileClose) onMobileClose();
      };
    }
  }, [location.pathname, isMobile, isMobileOpen, onMobileClose]);

  // Determine if sidebar should be shown
  const showSidebar = isMobile ? isMobileOpen : true;
  // Determine if sidebar is in a collapsed visual state
  const isCollapsed = collapsed && !isHovering;

  if (!showSidebar && isMobile) return null;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r bg-white shadow-sm transition-all duration-300 ease-in-out dark:bg-gray-900",
        isCollapsed ? "w-16" : "w-64",
        isMobile && "shadow-lg",
        className
      )}
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center p-4 justify-between">
        <div className="flex items-center">
          <Logo showText={!isCollapsed} size={isCollapsed ? "sm" : "md"} />
        </div>
        
        {isMobile ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMobileClose}
            className="ml-auto"
            aria-label="Close menu"
          >
            <X size={20} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "ml-2 transition-opacity",
              isCollapsed && "rotate-180"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        )}
      </div>
      
      {/* Navigation items */}
      <div className="mt-6 flex flex-1 flex-col gap-1 px-3">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Tooltip key={item.href} delayDuration={400} disableHoverableContent={!isCollapsed}>
                <TooltipTrigger asChild>
                  <Link to={item.href} onClick={isMobile ? onMobileClose : undefined}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size={isCollapsed ? "icon" : "default"}
                      className={cn(
                        "w-full justify-start transition-all",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                    >
                      <span className={cn("shrink-0", isCollapsed ? "" : "mr-2")}>{item.icon}</span>
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="z-50">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Sidebar footer with Settings */}
      <div className="mt-auto border-t px-3 py-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip delayDuration={400} disableHoverableContent={!isCollapsed}>
            <TooltipTrigger asChild>
              <Link to={footerItem.href} onClick={isMobile ? onMobileClose : undefined}>
                <Button
                  variant={location.pathname === footerItem.href ? "default" : "ghost"}
                  size={isCollapsed ? "icon" : "default"}
                  className={cn(
                    "w-full justify-start transition-all",
                    location.pathname === footerItem.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <span className={cn("shrink-0", isCollapsed ? "" : "mr-2")}>{footerItem.icon}</span>
                  {!isCollapsed && <span>{footerItem.label}</span>}
                </Button>
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="z-50">
                {footerItem.label}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
