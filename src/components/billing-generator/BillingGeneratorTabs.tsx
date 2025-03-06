
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ClipboardList, CreditCard, Settings } from "lucide-react";

interface BillingGeneratorTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BillingGeneratorTabs = ({ 
  activeTab, 
  setActiveTab 
}: BillingGeneratorTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="generator" className="gap-2">
          <FileText size={16} />
          <span className="hidden sm:inline">Gerador de Faturamento</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-2">
          <ClipboardList size={16} />
          <span className="hidden sm:inline">Histórico de Faturamentos</span>
        </TabsTrigger>
        <TabsTrigger value="charges" className="gap-2">
          <CreditCard size={16} />
          <span className="hidden sm:inline">Cobranças Lançadas</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-2">
          <Settings size={16} />
          <span className="hidden sm:inline">Configurações de Pagamento</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default BillingGeneratorTabs;
