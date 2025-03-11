import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import BillingGeneratorTabs from "@/components/billing-generator/BillingGeneratorTabs";
import { useBillingForm } from "@/hooks/use-billing-form";
import { STEPS } from "@/components/billing-generator/BillingGeneratorSteps";

const BillingGenerator = () => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [activeTab, setActiveTab] = useState("generator"); // "generator", "history", "charges", "settings"
  
  // Use the custom hook for form state management
  const { billingData, updateBillingData } = useBillingForm();

  // Navigate to next step
  const nextStep = () => {
    if (activeStep < STEPS.length) {
      setActiveStep(activeStep + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  // Reset the step to 1
  const resetStep = () => {
    setActiveStep(1);
  };

  // Handle form submission
  const handleSubmit = () => {
    // Here we would handle the actual submission, API calls, etc.
    toast({
      title: "Faturamento gerado com sucesso!",
      description: "Os boletos foram gerados e estão disponíveis para download.",
    });
    
    // Move to the next step (PDF generation)
    nextStep();
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Faturamento</h1>
        <p className="text-muted-foreground">
          Gere faturas para as unidades do condomínio
        </p>
      </div>
      
      <BillingGeneratorTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        activeStep={activeStep}
        billingData={billingData}
        updateBillingData={updateBillingData}
        nextStep={nextStep}
        prevStep={prevStep}
        resetStep={resetStep}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default BillingGenerator;
