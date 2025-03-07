
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, FileText, Download, BuildingIcon } from "lucide-react";
import { fetchUnits, Unit } from "@/utils/consumptionUtils";
import { 
  generateAndDownloadInvoice, 
  prepareInvoiceData,
  generateInvoicePDF
} from "@/utils/pdf";
import BillingGeneratorInvoice from "./BillingGeneratorInvoice";
import BillingGeneratorInvoices from "./BillingGeneratorInvoices";
import JSZip from "jszip";
import { format } from "date-fns";
import { getMonthName } from "@/utils/pdf";

interface BillingGeneratorPDFProps {
  billingData: any;
}

const BillingGeneratorPDF = ({ billingData }: BillingGeneratorPDFProps) => {
  const { toast } = useToast();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");

  // Fetch all units on component mount
  useEffect(() => {
    const loadUnits = async () => {
      try {
        setIsLoading(true);
        const fetchedUnits = await fetchUnits();
        console.log("Fetched units:", fetchedUnits);
        setUnits(fetchedUnits);
      } catch (error) {
        console.error("Error fetching units:", error);
        toast({
          title: "Erro ao carregar unidades",
          description: "Não foi possível carregar as unidades. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUnits();
  }, [toast]);

  // Filter units based on billing data
  const getRelevantUnits = () => {
    if (billingData.targetUnits === "all") {
      // Return all units
      return units;
    } else if (typeof billingData.targetUnits === 'string' && billingData.targetUnits !== "all") {
      // Return specific unit by ID
      return units.filter(unit => String(unit.id) === String(billingData.targetUnits));
    } else {
      // Return all units as fallback
      return units;
    }
  };

  const relevantUnits = getRelevantUnits();

  // Download all invoices as a ZIP file
  const handleDownloadAllInvoices = async () => {
    try {
      setIsGeneratingZip(true);
      toast({
        title: "Gerando faturas",
        description: "Iniciando a geração de todas as faturas em um arquivo zip.",
      });

      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Show how many invoices are being generated
      console.log(`Generating invoices for ${relevantUnits.length} units`);
      
      // Generate invoices for each unit and add to zip
      for (const unit of relevantUnits) {
        console.log(`Gerando fatura para unidade ${unit.block}-${unit.number}`);
        const invoiceData = prepareInvoiceData(billingData, unit);
        
        try {
          const pdfBlob = await generateInvoicePDF(invoiceData);
          
          // Generate filename based on unit and date
          const fileName = `fatura_${unit.block}-${unit.number}_${getMonthName(invoiceData.referenceMonth)}_${invoiceData.referenceYear}.pdf`;
          
          // Add the PDF to the zip file
          zip.file(fileName, pdfBlob);
          console.log(`Added invoice for unit ${unit.block}-${unit.number} to zip`);
        } catch (err) {
          console.error(`Error generating invoice for unit ${unit.block}-${unit.number}:`, err);
        }
      }
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create a download link for the zip file
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use the month and year from billing data for ZIP file name
      const month = billingData.reference?.month !== undefined 
                    ? getMonthName(billingData.reference.month) 
                    : format(new Date(), 'MMMM');
      const year = billingData.reference?.year || new Date().getFullYear();
      
      link.download = `faturas_${month}_${year}.zip`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Faturas geradas",
        description: "Todas as faturas foram geradas com sucesso e compactadas em um arquivo ZIP.",
      });
    } catch (error) {
      console.error('Error generating all invoices:', error);
      toast({
        title: "Erro ao gerar faturas",
        description: "Ocorreu um erro ao gerar as faturas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Gerar Faturas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geração de Faturas</CardTitle>
              <CardDescription>
                Gere faturas individuais para cada unidade do condomínio ou para todas as unidades de uma vez.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : relevantUnits.length > 0 ? (
                <div className="space-y-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Proprietário</TableHead>
                        <TableHead className="text-right">Gerar Fatura</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relevantUnits.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">
                            {unit.block}-{unit.number}
                          </TableCell>
                          <TableCell>{unit.owner}</TableCell>
                          <TableCell className="text-right">
                            <BillingGeneratorInvoice
                              billingData={billingData}
                              unit={unit}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {relevantUnits.length > 1 && (
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleDownloadAllInvoices} 
                        disabled={isGeneratingZip}
                      >
                        {isGeneratingZip ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gerando ZIP...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Gerar Todas as Faturas (ZIP)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BuildingIcon className="mx-auto h-12 w-12 mb-4" />
                  <p>Nenhuma unidade encontrada para gerar faturas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <BillingGeneratorInvoices />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingGeneratorPDF;
