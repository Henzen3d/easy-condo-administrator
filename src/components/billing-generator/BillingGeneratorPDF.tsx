
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
  prepareInvoiceData 
} from "@/utils/pdf";
import BillingGeneratorInvoice from "./BillingGeneratorInvoice";
import BillingGeneratorInvoices from "./BillingGeneratorInvoices";

interface BillingGeneratorPDFProps {
  billingData: any;
}

const BillingGeneratorPDF = ({ billingData }: BillingGeneratorPDFProps) => {
  const { toast } = useToast();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    } else {
      // Return specific unit
      return units.filter(unit => unit.id === parseInt(billingData.targetUnits));
    }
  };

  const relevantUnits = getRelevantUnits();

  // Download invoice for all units
  const handleDownloadAllInvoices = async () => {
    try {
      toast({
        title: "Gerando faturas",
        description: "Iniciando o download de todas as faturas. Isso pode levar alguns instantes.",
      });

      // Generate invoices sequentially to avoid overwhelming the browser
      for (const unit of relevantUnits) {
        const invoiceData = prepareInvoiceData(billingData, unit);
        await generateAndDownloadInvoice(invoiceData);
        
        // Add a small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Faturas geradas",
        description: "Todas as faturas foram geradas com sucesso.",
      });
    } catch (error) {
      console.error('Error generating all invoices:', error);
      toast({
        title: "Erro ao gerar faturas",
        description: "Ocorreu um erro ao gerar as faturas. Tente novamente.",
        variant: "destructive",
      });
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
                      <Button onClick={handleDownloadAllInvoices}>
                        <Download className="mr-2 h-4 w-4" />
                        Gerar Todas as Faturas
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
