import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check, RotateCcw } from "lucide-react";

interface BillingGeneratorNavigationProps {
  activeStep: number;
  prevStep: () => void;
  nextStep: () => void;
  handleSubmit: () => void;
}

const BillingGeneratorNavigation = ({
  activeStep,
  prevStep,
  nextStep,
  handleSubmit
}: BillingGeneratorNavigationProps) => {
  return (
    <div className="flex justify-between mt-6">
      {activeStep > 1 ? (
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      ) : (
        <div></div> // Espaço vazio para manter o layout
      )}
      
      {activeStep < 4 ? (
        <Button onClick={nextStep}>
          Avançar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : activeStep === 4 ? (
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
          <Check className="mr-2 h-4 w-4" />
          Gerar Faturas
        </Button>
      ) : (
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Voltar ao Início
        </Button>
      )}
    </div>
  );
};

export default BillingGeneratorNavigation;
