import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home,
  Users,
  CreditCard,
  Gauge,
  MoreHorizontal,
  BarChart4,
  Calendar,
  Settings,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile"; // Importar o hook useIsMobile

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(); // Usar o hook useIsMobile
  const [activeItem, setActiveItem] = useState<string>("/dashboard");

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { label: "Dashboard", icon: <Home className="h-5 w-5" />, path: "/dashboard" },
    { label: "Moradores", icon: <Users className="h-5 w-5" />, path: "/units" },
    { label: "Contas", icon: <CreditCard className="h-5 w-5" />, path: "/bank-accounts" },
    { label: "Consumos", icon: <Gauge className="h-5 w-5" />, path: "/utility-management" },
  ];

  // More menu items
  const moreMenuItems: NavItem[] = [
    { label: "Cobranças", icon: <Receipt className="h-5 w-5" />, path: "/billing" },
    { label: "Transações", icon: <BarChart4 className="h-5 w-5" />, path: "/transactions" },
    { label: "Relatórios", icon: <Calendar className="h-5 w-5" />, path: "/reports" },
    { label: "Configurações", icon: <Settings className="h-5 w-5" />, path: "/settings" },
  ];

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setActiveItem(path);
  };

  // Não renderizar na página inicial
  if (location.pathname === "/") return null;

  // Não renderizar em desktop
  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-background/80 backdrop-blur-sm border rounded-full shadow-lg z-[9999]">
      <div className="grid h-14 grid-cols-5 items-center">
        {mainNavItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`flex h-full w-full flex-col items-center justify-center gap-1 rounded-full ${
              activeItem === item.path ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </Button>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-full"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px]">Mais</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-48 p-0" 
            align="end"
            side="top"
          >
            <div className="flex flex-col">
              {moreMenuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`flex w-full items-center justify-start gap-2 rounded-none px-4 py-2 ${
                    activeItem === item.path ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
};
