import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, ClipboardList, CreditCard, Settings } from "lucide-react";
import BillingGeneratorHistory from "./BillingGeneratorHistory";
import BillingGeneratorCharges from "./BillingGeneratorCharges";
import BillingGeneratorSettings from "./BillingGeneratorSettings";
import { BillingGeneratorTabContent } from "./BillingGeneratorContent";
import { BillingData } from "@/hooks/use-billing-form";

interface BillingGeneratorTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeStep: number;
  billingData: BillingData;
  updateBillingData: (data: Partial<BillingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetStep: () => void;
  handleSubmit: () => void;
}

const BillingGeneratorTabs = ({ 
  activeTab, 
  setActiveTab,
  activeStep,
  billingData,
  updateBillingData,
  nextStep,
  prevStep,
  resetStep,
  handleSubmit
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

      <TabsContent value="generator" className="mt-6">
        <BillingGeneratorTabContent 
          activeStep={activeStep}
          billingData={billingData}
          updateBillingData={updateBillingData}
          nextStep={nextStep}
          prevStep={prevStep}
          resetStep={resetStep}
          handleSubmit={handleSubmit}
        />
      </TabsContent>
      
      <TabsContent value="history" className="mt-6">
        <BillingGeneratorHistory />
      </TabsContent>
      
      <TabsContent value="charges" className="mt-6">
        <BillingGeneratorCharges />
      </TabsContent>
      
      <TabsContent value="settings" className="mt-6">
        <BillingGeneratorSettings />
      </TabsContent>
    </Tabs>
  );
};

export default BillingGeneratorTabs;
