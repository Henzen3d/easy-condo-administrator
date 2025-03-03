
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Download,
} from "lucide-react";
import BillingGeneratorStep1 from "@/components/billing-generator/BillingGeneratorStep1";
import BillingGeneratorStep2 from "@/components/billing-generator/BillingGeneratorStep2";
import BillingGeneratorStep3 from "@/components/billing-generator/BillingGeneratorStep3";
import BillingGeneratorStep4 from "@/components/billing-generator/BillingGeneratorStep4";
import BillingGeneratorTabs from "@/components/billing-generator/BillingGeneratorTabs";

// Define the steps of the billing generator process
const STEPS = [
  { id: 1, name: "Geral" },
  { id: 2, name: "Itens de Cobrança" },
  { id: 3, name: "Configurações dos Boletos" },
  { id: 4, name: "Confirmar" },
];

const BillingGenerator = () => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [activeTab, setActiveTab] = useState("generator"); // "generator", "history", "charges", "settings"
  
  // Form state
  const [billingData, setBillingData] = useState({
    reference: { month: new Date().getMonth(), year: new Date().getFullYear() },
    name: "",
    dueDate: "",
    includeGasConsumption: false,
    includeWaterConsumption: false,
    earlyPaymentDiscount: {
      enabled: false,
      dueDate: "",
      discountType: "fixed", // "fixed" or "percentage"
      discountValue: 0,
    },
    chargeItems: [],
    targetUnits: "all", // "all" or specific unit ID
    specificUnit: "",
    statementPeriod: {
      startDate: "",
      endDate: "",
    },
    additionalMessage: "",
  });

  // Handle form data changes
  const updateBillingData = (newData) => {
    setBillingData(prevData => ({ ...prevData, ...newData }));
  };

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

  // Handle form submission
  const handleSubmit = () => {
    // Here we would handle the actual submission, API calls, etc.
    toast({
      title: "Faturamento gerado com sucesso!",
      description: "Os boletos foram gerados e estão disponíveis para download.",
    });
    
    // Reset form and go back to step 1
    setActiveStep(1);
    // We would typically reset the form state here too
  };

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
          <BillingGeneratorStep2 
            billingData={billingData} 
            updateBillingData={updateBillingData} 
          />
        );
      case 3:
        return (
          <BillingGeneratorStep3 
            billingData={billingData} 
            updateBillingData={updateBillingData} 
          />
        );
      case 4:
        return (
          <BillingGeneratorStep4 
            billingData={billingData} 
          />
        );
      default:
        return null;
    }
  };

  // Render the navigation buttons
  const renderNavButtons = () => {
    return (
      <div className="flex justify-between mt-6">
        {activeStep > 1 ? (
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        ) : (
          <div></div> // Empty div to maintain space
        )}
        
        {activeStep < STEPS.length ? (
          <Button onClick={nextStep}>
            Avançar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            <Check className="mr-2 h-4 w-4" />
            Confirmar
          </Button>
        )}
      </div>
    );
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
          <div className="flex justify-end">
            <Button className="gap-2">
              <Plus size={16} />
              Gerar Novo Faturamento
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {/* Progress indicators */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  {STEPS.map((step) => (
                    <div 
                      key={step.id}
                      className={`flex flex-col items-center flex-1 ${step.id < activeStep 
                        ? 'text-primary' 
                        : step.id === activeStep 
                          ? 'text-primary font-bold' 
                          : 'text-muted-foreground'}`}
                    >
                      <div className={`rounded-full w-8 h-8 flex items-center justify-center mb-2 ${
                        step.id < activeStep 
                          ? 'bg-primary text-white' 
                          : step.id === activeStep 
                            ? 'border-2 border-primary text-primary' 
                            : 'border border-muted-foreground text-muted-foreground'
                      }`}>
                        {step.id}
                      </div>
                      <span className="text-sm hidden md:block">{step.name}</span>
                    </div>
                  ))}
                </div>
                <div className="relative flex h-1 bg-muted">
                  <div 
                    className="absolute bg-primary h-1 transition-all duration-300"
                    style={{ width: `${((activeStep - 1) / (STEPS.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current step content */}
              {renderStep()}

              {/* Navigation buttons */}
              {renderNavButtons()}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "history" && (
        <div className="grid gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Histórico de Faturamentos</h2>
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Exportar
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhum faturamento encontrado</p>
                <Button className="mt-4" onClick={() => setActiveTab("generator")}>
                  Gerar Novo Faturamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "charges" && (
        <div className="grid gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Cobranças Lançadas</h2>
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Exportar
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhuma cobrança lançada encontrada</p>
                <Button className="mt-4" onClick={() => setActiveTab("generator")}>
                  Gerar Novo Faturamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold">Configurações de Pagamento</h2>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>As configurações de pagamento serão implementadas em breve.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BillingGenerator;
