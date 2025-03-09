import { useState, useEffect } from "react";
import { CalendarIcon, CheckCircle2, Droplet, Flame, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { pt } from 'date-fns/locale';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateBillingsSummaryPDF } from "@/lib/pdfService";
import { markBillingAsPrinted } from "@/lib/billingService";
import { createInvoice } from "@/lib/invoiceService";
import { supabase } from "@/integrations/supabase/client";

interface BillingGeneratorStep4Props {
  billingData: any;
}

// Mock data for units
const mockUnits = [
  { id: 1, number: "101", block: "A" },
  { id: 2, number: "102", block: "A" },
  { id: 3, number: "201", block: "A" },
  { id: 4, number: "202", block: "A" },
  { id: 5, number: "101", block: "B" },
  { id: 6, number: "102", block: "B" },
];

// Mock categories for charges
const chargeCategories = [
  { id: "taxa", name: "Taxa Regular" },
  { id: "extra", name: "Taxa Extra" },
  { id: "multa", name: "Multa" },
  { id: "consumo", name: "Consumo" },
  { id: "outros", name: "Outros" },
];

const getMonthName = (month: number) => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[month];
};

const BillingGeneratorStep4 = ({ billingData }: BillingGeneratorStep4Props) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [generatedInvoices, setGeneratedInvoices] = useState<string[]>([]);
  
  // Carregar unidades do banco de dados
  useEffect(() => {
    async function loadUnits() {
      try {
        const { data, error } = await supabase
          .from('units')
          .select('*')
          .order('block')
          .order('number');
          
        if (error) throw error;
        setUnits(data || []);
      } catch (error) {
        console.error("Erro ao carregar unidades:", error);
      }
    }
    
    loadUnits();
  }, []);
  
  // Calcular o total das cobranças selecionadas
  const selectedBillings = billingData.existingBillings?.filter(
    (billing: any) => billingData.selectedBillings?.includes(billing.id)
  ) || [];
  
  const totalAmount = selectedBillings.reduce(
    (sum: number, billing: any) => sum + billing.amount, 
    0
  );
  
  // Agrupar cobranças por unidade
  const billingsByUnit = selectedBillings.reduce((acc: any, billing: any) => {
    if (!acc[billing.unit]) {
      acc[billing.unit] = {
        unit: billing.unit,
        unit_id: billing.unit_id,
        resident: billing.resident,
        billings: [],
        total: 0
      };
    }
    
    acc[billing.unit].billings.push(billing);
    acc[billing.unit].total += billing.amount;
    
    return acc;
  }, {});
  
  const unitGroups = Object.values(billingsByUnit);
  
  // Função para gerar PDF para uma unidade específica
  const generatePDFForUnit = async (unitData: any) => {
    try {
      setIsGeneratingPDF(true);
      
      // Verificar se já foi gerada uma fatura para esta unidade
      if (generatedInvoices.includes(unitData.unit)) {
        toast.info(`Fatura para a unidade ${unitData.unit} já foi gerada`);
        return;
      }
      
      // Extrair os IDs das cobranças
      const billingIds = unitData.billings.map((billing: any) => billing.id);
      
      // Criar a fatura no banco de dados
      const invoice = await createInvoice(
        unitData.unit_id,
        unitData.unit,
        unitData.resident,
        billingData.dueDate || new Date().toISOString().split('T')[0],
        billingIds,
        billingData.reference.month,
        billingData.reference.year,
        billingData.notes
      );
      
      if (!invoice) {
        toast.error(`Falha ao criar fatura para a unidade ${unitData.unit}`);
        return;
      }
      
      // Adicionar à lista de faturas geradas
      setGeneratedInvoices(prev => [...prev, unitData.unit]);
      
      // Gerar PDF usando o serviço
      const pdfUrl = generateBillingsSummaryPDF(
        unitData.unit,
        unitData.resident,
        unitData.billings,
        unitData.total
      );
      
      // Abrir o PDF em uma nova aba
      window.open(pdfUrl, '_blank');
      
      // Marcar as cobranças como impressas
      for (const billing of unitData.billings) {
        await markBillingAsPrinted(billing.id);
      }
      
      toast.success(`Fatura gerada com sucesso para a unidade ${unitData.unit}`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error(`Erro ao gerar fatura para a unidade ${unitData.unit}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Função para gerar todos os PDFs
  const generateAllPDFs = async () => {
    try {
      setIsGeneratingPDF(true);
      
      for (const unitData of unitGroups) {
        // Verificar se já foi gerada uma fatura para esta unidade
        if (generatedInvoices.includes(unitData.unit)) {
          console.log(`Fatura para a unidade ${unitData.unit} já foi gerada, pulando...`);
          continue;
        }
        
        // Extrair os IDs das cobranças
        const billingIds = unitData.billings.map((billing: any) => billing.id);
        
        // Criar a fatura no banco de dados
        const invoice = await createInvoice(
          unitData.unit_id,
          unitData.unit,
          unitData.resident,
          billingData.dueDate || new Date().toISOString().split('T')[0],
          billingIds,
          billingData.reference.month,
          billingData.reference.year,
          billingData.notes
        );
        
        if (!invoice) {
          console.error(`Falha ao criar fatura para a unidade ${unitData.unit}`);
          continue;
        }
        
        // Adicionar à lista de faturas geradas
        setGeneratedInvoices(prev => [...prev, unitData.unit]);
        
        // Gerar PDF usando o serviço
        const pdfUrl = generateBillingsSummaryPDF(
          unitData.unit,
          unitData.resident,
          unitData.billings,
          unitData.total
        );
        
        // Abrir o PDF em uma nova aba
        window.open(pdfUrl, '_blank');
        
        // Marcar as cobranças como impressas
        for (const billing of unitData.billings) {
          await markBillingAsPrinted(billing.id);
        }
        
        // Pequeno atraso para não sobrecarregar o navegador
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success(`${unitGroups.length} faturas geradas com sucesso`);
    } catch (error) {
      console.error("Erro ao gerar PDFs:", error);
      toast.error("Erro ao gerar faturas");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="text-xl font-bold">Resumo do Faturamento</h3>
        <p className="text-muted-foreground">
          Verifique as informações abaixo antes de confirmar a geração dos boletos.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4 flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Informações Gerais
            </h4>
            
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Nome do Faturamento:</span>
                <span className="font-medium">{billingData.name || "Não informado"}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Período de Referência:</span>
                <span className="font-medium">
                  {billingData.reference 
                    ? `${getMonthName(billingData.reference.month)} de ${billingData.reference.year}` 
                    : "Não informado"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Período do Balancete:</span>
                <span className="font-medium">
                  {billingData.statementPeriod?.startDate && billingData.statementPeriod?.endDate
                    ? `${format(new Date(billingData.statementPeriod.startDate), "dd/MM/yyyy")} a ${format(new Date(billingData.statementPeriod.endDate), "dd/MM/yyyy")}`
                    : "Não informado"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Data de Vencimento:</span>
                <span className="font-medium">
                  {billingData.dueDate
                    ? format(new Date(billingData.dueDate), "dd/MM/yyyy")
                    : "Não informado"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Cobranças Selecionadas:</span>
                <span className="font-medium">{selectedBillings.length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Unidades com Cobranças:</span>
                <span className="font-medium">{unitGroups.length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Valor Total:</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Faturas Geradas:</span>
                <span className="font-medium">{generatedInvoices.length} de {unitGroups.length}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Cobranças por Unidade</h4>
            
            {unitGroups.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma cobrança selecionada.
              </p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {unitGroups.map((unitData: any) => (
                  <Card key={unitData.unit} className={`border ${generatedInvoices.includes(unitData.unit) ? 'border-green-500 bg-green-50' : 'border-muted'}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{unitData.unit}</h5>
                        <span className="text-sm font-bold">{formatCurrency(unitData.total)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{unitData.resident}</p>
                      <ul className="text-sm space-y-1">
                        {unitData.billings.map((billing: any) => (
                          <li key={billing.id} className="flex justify-between">
                            <span className="truncate max-w-[200px]">{billing.description}</span>
                            <span>{formatCurrency(billing.amount)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="p-2 pt-0 flex justify-end">
                      <Button 
                        variant={generatedInvoices.includes(unitData.unit) ? "secondary" : "outline"}
                        size="sm" 
                        className="gap-1"
                        onClick={() => generatePDFForUnit(unitData)}
                        disabled={isGeneratingPDF}
                      >
                        <FileText size={14} />
                        <span>{generatedInvoices.includes(unitData.unit) ? "Reimprimir" : "Gerar Fatura"}</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {unitGroups.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            className="gap-2"
            onClick={generateAllPDFs}
            disabled={isGeneratingPDF || generatedInvoices.length === unitGroups.length}
          >
            <Download size={18} />
            <span>
              {isGeneratingPDF 
                ? "Gerando Faturas..." 
                : generatedInvoices.length === unitGroups.length
                  ? "Todas as Faturas Geradas"
                  : `Gerar ${unitGroups.length - generatedInvoices.length} Faturas Restantes`
              }
            </span>
          </Button>
        </div>
      )}
      
      {billingData.notes && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h4 className="font-medium mb-2">Observações</h4>
            <p className="text-sm whitespace-pre-line">{billingData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillingGeneratorStep4;
