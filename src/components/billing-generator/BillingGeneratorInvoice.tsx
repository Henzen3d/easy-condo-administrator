
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

  // Generate invoice and show dialog with preview
  const handleGenerateInvoiceWithPreview = async () => {
    try {
      setIsGenerating(true);
      
      // Prepare invoice data from billing data and unit info
      const invoiceData = prepareInvoiceData(billingData, unit);
      
      // Add a default PIX key if one isn't provided
      if (!invoiceData.pixKey) {
        invoiceData.pixKey = "47988131910"; // Default phone number PIX key
      }
      
      console.log("Generated invoice data for preview:", invoiceData);
      
      // Generate PDF blob
      const pdfBlob = await generateInvoicePDF(invoiceData);
      
      // Create URL for preview
      const url = URL.createObjectURL(pdfBlob);
      setInvoiceUrl(url);
      
      // Open dialog to show preview
      setIsDialogOpen(true);
      
      toast({
        title: "Fatura gerada com sucesso",
        description: `Fatura para unidade ${unit.block}-${unit.number} pronta para visualização.`,
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

  // Generate invoice and handle download directly
  const handleGenerateInvoice = async () => {
    try {
      setIsGenerating(true);
      
      // Prepare invoice data with correct filtering for this unit
      const invoiceData = prepareInvoiceData(billingData, unit);
      
      // Add a default PIX key if one isn't provided
      if (!invoiceData.pixKey) {
        invoiceData.pixKey = "47988131910"; // Default phone number PIX key
      }
      
      console.log("Generating invoice for unit:", unit.id, unit.block, unit.number);
      console.log("Invoice data:", invoiceData);
      
      // Generate and download the invoice directly
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

  // Handle downloading the invoice from dialog
  const handleDownloadInvoice = () => {
    if (invoiceUrl) {
      const link = document.createElement('a');
      link.href = invoiceUrl;
      link.download = `fatura_${unit.block}-${unit.number}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  // Cleanup URL when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && invoiceUrl) {
      URL.revokeObjectURL(invoiceUrl);
      setInvoiceUrl(null);
    }
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
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
