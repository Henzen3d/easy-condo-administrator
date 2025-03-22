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
  const [activeItem, setActiveItem] = useState<string>("dashboard");

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { label: "Dashboard", icon: <Home className="h-5 w-5" />, path: "dashboard" },
    { label: "Moradores", icon: <Users className="h-5 w-5" />, path: "units" },
    { label: "Contas", icon: <CreditCard className="h-5 w-5" />, path: "bank-accounts" },
    { label: "Consumos", icon: <Gauge className="h-5 w-5" />, path: "utility-management" },
  ];

  // More menu items
  const moreMenuItems: NavItem[] = [
    { label: "Cobranças", icon: <Receipt className="h-5 w-5" />, path: "billing" },
    { label: "Transações", icon: <BarChart4 className="h-5 w-5" />, path: "transactions" },
    { label: "Relatórios", icon: <Calendar className="h-5 w-5" />, path: "reports" },
    { label: "Configurações", icon: <Settings className="h-5 w-5" />, path: "settings" },
  ];

  useEffect(() => {
    // Remover a barra inicial do pathname para comparação
    const path = location.pathname.startsWith('/') 
      ? location.pathname.substring(1) 
      : location.pathname;
    
    setActiveItem(path);
  }, [location.pathname]);

  // Para verificar se um item está ativo
  const isActive = (path: string) => {
    // O path pode estar com ou sem a barra inicial
    const currentPath = location.pathname.startsWith('/') 
      ? location.pathname.substring(1) 
      : location.pathname;
    
    return currentPath === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setActiveItem(path);
  };

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-4">
      {mainNavItems.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          size="sm"
          className={`flex flex-col items-center justify-center space-y-1 h-full w-full max-w-[4.5rem] p-0 ${
            isActive(item.path) ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => handleNavigation(item.path)}
        >
          {item.icon}
          <span className="text-xs">{item.label}</span>
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center justify-center space-y-1 h-full w-full max-w-[4.5rem] p-0 text-muted-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-xs">Mais</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          className="w-[200px] p-2"
          side="top"
          sideOffset={15}
        >
          <div className="grid grid-cols-2 gap-2">
            {moreMenuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={`flex h-14 w-full flex-col items-center justify-center space-y-1 p-0 ${
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => {
                  handleNavigation(item.path);
                }}
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
