
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { BillingGeneratorSteps } from "./BillingGeneratorSteps";
import BillingGeneratorStep1 from "./BillingGeneratorStep1";
import BillingGeneratorConsumption from "./BillingGeneratorConsumption";
import BillingGeneratorStep2 from "./BillingGeneratorStep2";
import BillingGeneratorStep3 from "./BillingGeneratorStep3";
import BillingGeneratorStep4 from "./BillingGeneratorStep4";
import BillingGeneratorPDF from "./BillingGeneratorPDF";
import BillingGeneratorNavigation from "./BillingGeneratorNavigation";

import { BillingData } from "@/hooks/use-billing-form";

interface BillingGeneratorContentProps {
  activeStep: number;
  billingData: BillingData;
  updateBillingData: (data: Partial<BillingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: () => void;
}

export const BillingGeneratorContent = ({
  activeStep,
  billingData,
  updateBillingData,
  nextStep,
  prevStep,
  handleSubmit
}: BillingGeneratorContentProps) => {
  const { toast } = useToast();
  
  // Update charge items when moving to step 3
  useEffect(() => {
    if (activeStep === 3) {
      // This logic is moved from the original file
      let allItems = [...billingData.chargeItems];
      
      if (billingData.includeGasConsumption && billingData.gasConsumptionItems.length > 0) {
        allItems = [...allItems, ...billingData.gasConsumptionItems];
      }
      
      if (billingData.includeWaterConsumption && billingData.waterConsumptionItems.length > 0) {
        allItems = [...allItems, ...billingData.waterConsumptionItems];
      }
      
      updateBillingData({ chargeItems: allItems });
    }
  }, [activeStep, billingData, updateBillingData]);

  // Render the current step
  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <BillingGeneratorStep1 
            billingData={billingData} 
            updateBillingData={updateBillingData} 
          />
        );
      case 2:
        return (
          <BillingGeneratorConsumption
            billingData={billingData}
            updateBillingData={updateBillingData}
          />
        );
      case 3:
        return (
          <BillingGeneratorStep2 
            billingData={billingData} 
            updateBillingData={updateBillingData} 
          />
        );
      case 4:
        return (
          <BillingGeneratorStep3 
            billingData={billingData} 
            updateBillingData={updateBillingData} 
          />
        );
      case 5:
        return (
          <BillingGeneratorStep4 
            billingData={billingData} 
          />
        );
      case 6:
        return (
          <BillingGeneratorPDF 
            billingData={billingData} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Progress indicators */}
        <BillingGeneratorSteps activeStep={activeStep} />

        {/* Current step content */}
        {renderStep()}

        {/* Navigation buttons */}
        <BillingGeneratorNavigation 
          activeStep={activeStep} 
          prevStep={prevStep} 
          nextStep={nextStep} 
          handleSubmit={handleSubmit} 
        />
      </CardContent>
    </Card>
  );
};
