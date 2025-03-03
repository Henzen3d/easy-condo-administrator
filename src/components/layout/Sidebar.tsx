
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
  Menu,
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
      icon: <FileText size={20} />,
      href: "/billing-generator",
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
        "fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r bg-white p-4 shadow-sm transition-all duration-300 dark:bg-gray-900",
        isCollapsed ? "w-16" : "w-64",
        isMobile && "shadow-lg",
        className
      )}
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
    >
      <div className="flex items-center justify-between py-2">
        <Logo showText={!isCollapsed} size={isCollapsed ? "sm" : "md"} />
        
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMobileClose}
            className="ml-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        )}
      </div>
      
      <div className="mt-8 flex flex-1 flex-col gap-1">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Tooltip key={item.href} disableHoverableContent={!isCollapsed}>
                <TooltipTrigger asChild>
                  <Link to={item.href} onClick={isMobile ? onMobileClose : undefined}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size={isCollapsed ? "icon" : "default"}
                      className={cn(
                        "justify-start transition-all",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                        isCollapsed ? "w-full" : "w-full"
                      )}
                    >
                      <span className={cn("mr-2", isCollapsed && "mr-0")}>{item.icon}</span>
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Sidebar footer with Settings */}
      <div className="mt-4 border-t pt-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip disableHoverableContent={!isCollapsed}>
            <TooltipTrigger asChild>
              <Link to={footerItem.href} onClick={isMobile ? onMobileClose : undefined}>
                <Button
                  variant={location.pathname === footerItem.href ? "default" : "ghost"}
                  size={isCollapsed ? "icon" : "default"}
                  className={cn(
                    "justify-start transition-all w-full",
                    location.pathname === footerItem.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <span className={cn("mr-2", isCollapsed && "mr-0")}>{footerItem.icon}</span>
                  {!isCollapsed && <span>{footerItem.label}</span>}
                </Button>
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                {footerItem.label}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Manual collapse toggle button (only on desktop) */}
      {!isMobile && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleCollapse} 
          className="mt-2 justify-center"
        >
          {collapsed ? (
            <>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
              {!isCollapsed && <span>Recolher</span>}
            </>
          ) : (
            <>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Recolher</span>
            </>
          )}
        </Button>
      )}
    </aside>
  );
}
