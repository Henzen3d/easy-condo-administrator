import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { BillingGeneratorSteps } from "./BillingGeneratorSteps";
import BillingGeneratorStep1 from "./BillingGeneratorStep1";
import BillingGeneratorConsumption from "./BillingGeneratorConsumption";
import BillingGeneratorStep3 from "./BillingGeneratorStep3";
import BillingGeneratorStep4 from "./BillingGeneratorStep4";
import BillingGeneratorPDF from "./BillingGeneratorPDF";
import BillingGeneratorNavigation from "./BillingGeneratorNavigation";

import { BillingData } from "@/hooks/use-billing-form";

interface BillingGeneratorContentProps {
  activeTab: string;
  activeStep: number;
  billingData: BillingData;
  updateBillingData: (data: Partial<BillingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetStep: () => void;
  handleSubmit: () => void;
}

// Este componente não é mais necessário, pois o conteúdo das abas foi movido para BillingGeneratorTabs
export const BillingGeneratorContent = ({
  activeTab,
  activeStep,
  billingData,
  updateBillingData,
  nextStep,
  prevStep,
  resetStep,
  handleSubmit
}: BillingGeneratorContentProps) => {
  const { toast } = useToast();
  
  // Update charge items when moving to step 3
  useEffect(() => {
    if (activeStep === 3) {
      // Create a map of existing items by description to avoid duplicates
      const existingItemsMap = new Map(
        billingData.chargeItems.map(item => [item.description, item])
      );

      let allItems = [...billingData.chargeItems];
      
      if (billingData.includeGasConsumption && billingData.gasConsumptionItems.length > 0) {
        billingData.gasConsumptionItems.forEach(item => {
          if (!existingItemsMap.has(item.description)) {
            allItems.push(item);
            existingItemsMap.set(item.description, item);
          }
        });
      }
      
      if (billingData.includeWaterConsumption && billingData.waterConsumptionItems.length > 0) {
        billingData.waterConsumptionItems.forEach(item => {
          if (!existingItemsMap.has(item.description)) {
            allItems.push(item);
            existingItemsMap.set(item.description, item);
          }
        });
      }
      
      updateBillingData({ chargeItems: allItems });
    }
  }, [activeStep, billingData, updateBillingData]);

  // Este componente não renderiza mais nada, pois o conteúdo foi movido para BillingGeneratorTabs
  return null;
};

export const BillingGeneratorTabContent = ({
  activeStep,
  billingData,
  updateBillingData,
  nextStep,
  prevStep,
  resetStep,
  handleSubmit
}: Omit<BillingGeneratorContentProps, 'activeTab'>) => {
  return (
    <div className="space-y-6">
      {/* Exibir os passos numerados */}
      <BillingGeneratorSteps activeStep={activeStep} />
      
      {/* Conteúdo do passo atual */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {activeStep === 1 && (
          <BillingGeneratorStep1 
            billingData={billingData}
            updateBillingData={updateBillingData}
            nextStep={nextStep}
          />
        )}
        
        {activeStep === 2 && (
          <BillingGeneratorConsumption 
            billingData={billingData}
            updateBillingData={updateBillingData}
            nextStep={nextStep}
          />
        )}
        
        {activeStep === 3 && (
          <BillingGeneratorStep3 
            billingData={billingData}
            updateBillingData={updateBillingData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        
        {activeStep === 4 && (
          <BillingGeneratorStep4 
            billingData={billingData}
            updateBillingData={updateBillingData}
            prevStep={prevStep}
            resetStep={resetStep}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
      
      {/* Botões de navegação - Remover para o passo 2, pois o componente BillingGeneratorConsumption já tem seu próprio botão */}
      {activeStep !== 2 && (
        <BillingGeneratorNavigation
          activeStep={activeStep}
          nextStep={nextStep}
          prevStep={prevStep}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
