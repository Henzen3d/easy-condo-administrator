
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import BillingGeneratorTabs from "@/components/billing-generator/BillingGeneratorTabs";
import { BillingGeneratorContent } from "@/components/billing-generator/BillingGeneratorContent";
import { BillingGeneratorTabContent } from "@/components/billing-generator/BillingGeneratorTabContent";
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
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">Faturamento</h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-200">
          Gere e gerencie faturamentos para as unidades do condomínio.
        </p>
      </div>

      <BillingGeneratorTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "generator" && (
        <>
          <div className="grid gap-4">
            <h2 className="text-2xl font-bold">Gerar Faturamento</h2>
          </div>

          <BillingGeneratorContent 
            activeStep={activeStep}
            billingData={billingData}
            updateBillingData={updateBillingData}
            nextStep={nextStep}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
          />
        </>
      )}

      {/* Display other tabs content (history, charges, settings) */}
      <BillingGeneratorTabContent 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
    </div>
  );
};

export default BillingGenerator;
