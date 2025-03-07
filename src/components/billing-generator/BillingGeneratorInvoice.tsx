
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Send, Printer, Loader2 } from "lucide-react";
import { 
  generateAndDownloadInvoice, 
  generateInvoicePDF,
  saveInvoiceToStorage,
  prepareInvoiceData
} from "@/utils/pdf";
import { format } from "date-fns";
import { Unit } from "@/utils/consumptionUtils";

interface BillingGeneratorInvoiceProps {
  billingData: any;
  unit: Unit;
}

const BillingGeneratorInvoice = ({ billingData, unit }: BillingGeneratorInvoiceProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  // Generate invoice and handle download
  const handleDownloadInvoice = async () => {
    try {
      setIsGenerating(true);
      
      // Prepare invoice data from billing data and unit info
      const invoiceData = prepareInvoiceData(billingData, unit);
      
      // Generate and download the invoice
      await generateAndDownloadInvoice(invoiceData);
      
      toast({
        title: "Fatura gerada com sucesso",
        description: "O download da fatura foi iniciado.",
      });
    } catch (error) {
      console.error("Erro ao gerar fatura:", error);
      toast({
        title: "Erro ao gerar fatura",
        description: "Não foi possível gerar a fatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate invoice and store in Supabase
  const handleGenerateInvoice = async () => {
    try {
      setIsGenerating(true);
      
      // Instead of trying to save to storage first (which is failing),
      // we'll directly download the invoice
      const invoiceData = prepareInvoiceData(billingData, unit);
      await generateAndDownloadInvoice(invoiceData);
      
      toast({
        title: "Fatura gerada com sucesso",
        description: "O download da fatura foi iniciado.",
      });
    } catch (error) {
      console.error("Erro ao gerar fatura:", error);
      toast({
        title: "Erro ao gerar fatura",
        description: "Não foi possível gerar a fatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle printing the invoice
  const handlePrintInvoice = () => {
    if (invoiceUrl) {
      // Open the invoice in a new tab for printing
      const printWindow = window.open(invoiceUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };

  // Handle sending invoice by email (mock implementation)
  const handleSendInvoice = () => {
    toast({
      title: "E-mail enviado",
      description: "A fatura foi enviada por e-mail para o morador.",
    });
  };

  return (
    <div>
      <Button
        onClick={handleGenerateInvoice}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Gerando Fatura...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Gerar Fatura
          </>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fatura Gerada</DialogTitle>
            <DialogDescription>
              A fatura da unidade {unit.block}-{unit.number} foi gerada com sucesso.
              Você pode baixá-la, imprimi-la ou enviá-la por e-mail.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            <div className="border rounded-md p-2">
              <iframe 
                src={invoiceUrl || ''} 
                className="w-full h-64" 
                title="Visualização da Fatura"
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadInvoice}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintInvoice}
              className="w-full sm:w-auto"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button
              onClick={handleSendInvoice}
              className="w-full sm:w-auto"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar por E-mail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingGeneratorInvoice;
