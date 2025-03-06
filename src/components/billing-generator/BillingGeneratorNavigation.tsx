
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

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
        <div></div> // Empty div to maintain space
      )}
      
      {activeStep < 5 ? (
        <Button onClick={nextStep}>
          Avançar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : activeStep === 5 ? (
        <Button onClick={handleSubmit}>
          <Check className="mr-2 h-4 w-4" />
          Confirmar
        </Button>
      ) : (
        <Button variant="outline" onClick={() => alert("Este botão precisa ser ligado à função que reinicia o processo")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Início
        </Button>
      )}
    </div>
  );
};

export default BillingGeneratorNavigation;
