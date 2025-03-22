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
  FilePlus,
  HomeIcon,
  BuildingIcon,
  CreditCardIcon,
  ListChecksIcon,
  ArrowRightLeft,
  BanknoteIcon,
  BarChart3Icon,
  FlaskConicalIcon
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
      href: "dashboard",
    },
    {
      label: "Unidades & Moradores",
      icon: <Users size={20} />,
      href: "units",
    },
    {
      label: "Contas Bancárias",
      icon: <CreditCard size={20} />,
      href: "bank-accounts",
    },
    {
      label: "Transações",
      icon: <BarChart4 size={20} />,
      href: "transactions",
    },
    {
      label: "Cobranças",
      icon: <Receipt size={20} />,
      href: "billing",
    },
    {
      label: "Consumos",
      icon: <Gauge size={20} />,
      href: "utility-management",
    },
    {
      label: "Relatórios",
      icon: <Calendar size={20} />,
      href: "reports",
    },
  ];

  // Footer item (Settings)
  const footerItem: NavItem = {
    label: "Configurações",
    icon: <Settings size={20} />,
    href: "settings",
  };

  // Determine if a nav item is active
  const isActive = (href: string) => {
    // Match the current pathname with the nav item's href
    return location.pathname === href || location.pathname === `/${href}`;
  };

  // Monitor for hover events only on non-mobile
  useEffect(() => {
    if (isMobile) {
      setIsHovering(false);
    }
  }, [isMobile]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full border-r bg-background transition-all duration-300 ease-in-out",
          collapsed && !isHovering ? "w-16" : "w-64",
          isMobile && "hidden",
          className
        )}
        onMouseEnter={() => collapsed && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
              <Logo 
                className="h-8" 
                showText={!collapsed || isHovering} 
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={cn(
                "transition-all",
                collapsed && !isHovering ? "ml-auto" : ""
              )}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent/50",
                            isActive(item.href) && "bg-accent text-accent-foreground hover:bg-accent",
                            collapsed && !isHovering ? "justify-center" : ""
                          )}
                        >
                          {item.icon}
                          {(!collapsed || isHovering) && (
                            <span>{item.label}</span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && !isHovering && (
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer nav */}
          <div className="border-t py-4">
            <ul className="px-2">
              <li>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={footerItem.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent/50",
                          isActive(footerItem.href) && "bg-accent text-accent-foreground hover:bg-accent",
                          collapsed && !isHovering ? "justify-center" : ""
                        )}
                      >
                        {footerItem.icon}
                        {(!collapsed || isHovering) && (
                          <span>{footerItem.label}</span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && !isHovering && (
                      <TooltipContent side="right">
                        {footerItem.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar (slide-in) */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 border-r bg-background transition-transform duration-300 ease-in-out",
          !isMobileOpen && "-translate-x-full",
          !isMobile && "hidden"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2" onClick={onMobileClose}>
              <Logo className="h-8" showText={true} />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              aria-label="Close sidebar"
            >
              <X size={16} />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent/50",
                      isActive(item.href) && "bg-accent text-accent-foreground hover:bg-accent"
                    )}
                    onClick={onMobileClose}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t py-4">
            <ul className="px-2">
              <li>
                <Link
                  to={footerItem.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent/50",
                    isActive(footerItem.href) && "bg-accent text-accent-foreground hover:bg-accent"
                  )}
                  onClick={onMobileClose}
                >
                  {footerItem.icon}
                  <span>{footerItem.label}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
