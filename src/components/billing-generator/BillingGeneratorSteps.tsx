
import { ReactNode } from "react";

// Define the steps of the billing generator process
export const STEPS = [
  { id: 1, name: "Geral" },
  { id: 2, name: "Consumo" },
  { id: 3, name: "Itens de Cobrança" },
  { id: 4, name: "Configurações dos Boletos" },
  { id: 5, name: "Confirmar" },
  { id: 6, name: "Gerar Faturas" },
];

interface BillingGeneratorStepsProps {
  activeStep: number;
}

export const BillingGeneratorSteps = ({ activeStep }: BillingGeneratorStepsProps) => {
  return (
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
  );
};
