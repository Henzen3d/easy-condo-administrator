
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export function Sidebar({ className, collapsed = false }: SidebarProps) {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <Home size={20} />,
      href: "/",
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
      icon: <Calendar size={20} />,
      href: "/reports",
    },
    {
      label: "Configurações",
      icon: <Settings size={20} />,
      href: "/settings",
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-white p-4 shadow-sm transition-all dark:bg-gray-900",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-center py-2">
        <Logo showText={!collapsed} size={collapsed ? "sm" : "md"} />
      </div>
      
      <div className="mt-8 flex flex-col gap-1">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size={collapsed ? "icon" : "default"}
                      className={cn(
                        "justify-start transition-all",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                        collapsed ? "w-full" : "w-full"
                      )}
                    >
                      <span className={cn("mr-2", collapsed && "mr-0")}>{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </aside>
  );
}
