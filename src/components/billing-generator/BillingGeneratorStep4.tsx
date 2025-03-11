import { useState, useEffect } from "react";
import { CalendarIcon, CheckCircle2, Droplet, Flame, Download, FileText, Archive } from "lucide-react";
import { format } from "date-fns";
import { pt } from 'date-fns/locale';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateBillingsSummaryPDF } from "@/lib/pdfService";
import { markBillingAsPrinted } from "@/lib/billingService";
import { createInvoice } from "@/lib/invoiceService";
import { supabase } from "@/integrations/supabase/client";
import { BillingData } from "@/hooks/use-billing-form";
import JSZip from "jszip";
import { prepareInvoiceData, generateInvoicePDF } from "@/utils/pdf/generators";
import { hasBankAccountWithPix } from "@/lib/pixService";

interface BillingGeneratorStep4Props {
  billingData: BillingData;
  updateBillingData: (data: Partial<BillingData>) => void;
  prevStep: () => void;
  resetStep: () => void;
  handleSubmit: () => void;
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
  return months[month - 1]; // Ajuste para índice baseado em 1
};

const BillingGeneratorStep4 = ({ 
  billingData, 
  updateBillingData,
  prevStep,
  resetStep,
  handleSubmit 
}: BillingGeneratorStep4Props) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [generatedInvoices, setGeneratedInvoices] = useState<Record<string, boolean>>({});
  const [hasPixAccount, setHasPixAccount] = useState(false);
  
  // Carregar unidades do banco de dados e verificar se há conta com PIX
  useEffect(() => {
    async function loadData() {
      try {
        console.log("Carregando dados para o passo 4...");
        
        // Carregar unidades
        const { data, error } = await supabase
          .from('units')
          .select('*')
          .order('block')
          .order('number');

        if (error) {
          console.error("Erro ao carregar unidades:", error);
          throw error;
        }
        
        console.log("Unidades carregadas:", data);
        setUnits(data || []);
        
        // Verificar se há conta com PIX
        try {
          console.log("Verificando se há conta com PIX...");
          const hasPix = await hasBankAccountWithPix();
          console.log("Resultado da verificação de PIX:", hasPix);
          setHasPixAccount(hasPix);
          
          if (!hasPix) {
            toast({
              title: "Aviso",
              description: "Não há conta bancária com chave PIX configurada. Os QR codes PIX não serão gerados."
            });
          }
        } catch (pixError) {
          console.error("Erro ao verificar contas com PIX:", pixError);
          toast({
            title: "Aviso",
            description: "Não foi possível verificar se há conta bancária com PIX. Os QR codes PIX podem não ser gerados corretamente."
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados. Algumas funcionalidades podem não estar disponíveis.",
          variant: "destructive"
        });
      }
    }

    loadData();
  }, [toast]);
  
  // Calcular o total das cobranças
  const totalAmount = billingData.chargeItems?.reduce(
    (sum, item) => sum + (item.value || 0), 
    0
  ) || 0;
  
  // Função para gerar uma fatura individual
  const generateInvoiceForUnit = async (unit: any) => {
    try {
      // Verificar se a fatura já foi gerada para esta unidade
      const unitKey = `${unit.block}-${unit.number}`;
      console.log(`Iniciando geração de fatura para a unidade ${unitKey}...`);
      
      if (generatedInvoices[unitKey]) {
        console.log(`Fatura para a unidade ${unitKey} já foi gerada.`);
        toast({
          title: "Informação",
          description: `A fatura para a unidade ${unitKey} já foi gerada.`
        });
        return;
      }

      setIsGeneratingPDF(true);
      
      // Filtrar os itens de cobrança para esta unidade
      const unitItems = billingData.chargeItems.filter(item => 
        item.unit === "all" || item.unit === unit.id.toString()
      );
      console.log(`Itens de cobrança para a unidade ${unitKey}:`, unitItems);

      // Adicionar itens de consumo de gás se habilitado
      if (billingData.includeGasConsumption) {
        const gasItems = billingData.gasConsumptionItems.filter(item => 
          item.unit === unit.id.toString()
        );
        console.log(`Itens de consumo de gás para a unidade ${unitKey}:`, gasItems);
        unitItems.push(...gasItems);
      }

      // Adicionar itens de consumo de água se habilitado
      if (billingData.includeWaterConsumption) {
        const waterItems = billingData.waterConsumptionItems.filter(item => 
          item.unit === unit.id.toString()
        );
        console.log(`Itens de consumo de água para a unidade ${unitKey}:`, waterItems);
        unitItems.push(...waterItems);
      }

      // Se não houver itens para esta unidade, não gerar fatura
      if (unitItems.length === 0) {
        console.log(`Não há itens de cobrança para a unidade ${unitKey}.`);
        toast({
          title: "Informação",
          description: `Não há itens de cobrança para a unidade ${unitKey}.`
        });
        setIsGeneratingPDF(false);
        return;
      }

      // Calcular o total para esta unidade
      const unitTotal = unitItems.reduce((sum, item) => sum + (item.value || 0), 0);
      console.log(`Total para a unidade ${unitKey}: ${unitTotal}`);

      // Inspecionar a estrutura dos itens para entender como extrair os IDs
      console.log("Estrutura detalhada dos itens:", JSON.stringify(unitItems, null, 2));
      
      // Converter a data para string ISO se for um objeto Date
      const dueDateString = typeof billingData.dueDate === 'string' 
        ? billingData.dueDate 
        : billingData.dueDate instanceof Date 
          ? billingData.dueDate.toISOString() 
          : new Date().toISOString();
      
      // Criar novos itens de cobrança no banco de dados se necessário
      const createdItemIds = await Promise.all(unitItems.map(async (item) => {
        try {
          // Se o item já tem um ID válido, usá-lo
          if (item.id && !isNaN(parseInt(item.id.toString()))) {
            return parseInt(item.id.toString());
          }
          
          // Caso contrário, criar um novo item de cobrança no banco de dados
          console.log(`Criando novo item de cobrança para: ${item.description}`);
          
          // Criar objeto com apenas as propriedades que existem na tabela billings
          const billingData = {
            unit: unitKey,
            unit_id: unit.id,
            resident: unit.owner || "Proprietário",
            description: item.description,
            amount: item.value || 0,
            due_date: dueDateString,
            status: 'pending',
            is_printed: false,
            is_sent: false
          };
          
          const { data, error } = await supabase
            .from('billings')
            .insert([billingData])
            .select();
            
          if (error) {
            console.error(`Erro ao criar item de cobrança: ${error.message}`);
            return null;
          }
          
          if (data && data.length > 0) {
            console.log(`Item de cobrança criado com ID: ${data[0].id}`);
            return data[0].id;
          }
          
          return null;
        } catch (itemError) {
          console.error(`Erro ao processar item: ${itemError.message}`);
          return null;
        }
      }));
      
      // Filtrar apenas os IDs válidos
      const newValidItemIds = createdItemIds.filter(id => id !== null);
      
      console.log(`Novos IDs válidos para a unidade ${unitKey}:`, newValidItemIds);
      
      if (newValidItemIds.length === 0) {
        console.error(`Não foi possível criar itens de cobrança válidos para a unidade ${unitKey}`);
        throw new Error("Não foi possível criar itens de cobrança válidos para esta unidade");
      }
      
      return newValidItemIds;
    } catch (error) {
      console.error(`Erro ao processar itens de cobrança para a unidade ${unit.block}-${unit.number}:`, error);
      throw error;
    }
  };

  // Função para processar a geração de fatura
  const processFaturaGeneration = async (unit: any) => {
    try {
      const unitKey = `${unit.block}-${unit.number}`;
      
      // Obter IDs válidos para os itens de cobrança
      const validItemIds = await generateInvoiceForUnit(unit);
      
      // Converter a data para string ISO se for um objeto Date
      const dueDateString = typeof billingData.dueDate === 'string' 
        ? billingData.dueDate 
        : billingData.dueDate instanceof Date 
          ? billingData.dueDate.toISOString() 
          : new Date().toISOString();
      
      // Criar a fatura no banco de dados
      console.log("Criando fatura no banco de dados com os seguintes dados:", {
        unitId: unit.id,
        unitKey,
        owner: unit.owner || "Proprietário",
        dueDate: dueDateString,
        validItemIds,
        month: billingData.reference.month,
        year: billingData.reference.year,
        notes: billingData.notes
      });
      
      // Garantir que todos os IDs sejam números
      const numericItemIds = validItemIds.map(id => Number(id));
      
      const invoice = await createInvoice(
        unit.id,
        unitKey,
        unit.owner || "Proprietário",
        dueDateString,
        numericItemIds,
        billingData.reference.month,
        billingData.reference.year,
        billingData.notes
      );

      if (!invoice) {
        console.error(`Falha ao criar a fatura no banco de dados para a unidade ${unitKey}`);
        throw new Error("Falha ao criar a fatura no banco de dados");
      }
      
      console.log(`Fatura criada com sucesso para a unidade ${unitKey}:`, invoice);

      // Preparar os dados da fatura com apenas as propriedades necessárias
      const filteredChargeItems = billingData.chargeItems
        .filter(item => item.unit === "all" || item.unit === unit.id.toString())
        .map(item => ({
          id: item.id,
          description: item.description,
          value: item.value
          // Removendo a propriedade 'category' que pode causar problemas
        }));
      
      // Preparar os dados da fatura
      const invoiceData = prepareInvoiceData({
        ...billingData,
        chargeItems: filteredChargeItems,
        resident: unit.owner || "Proprietário"
      }, unit);
      
      console.log("Dados da fatura preparados:", invoiceData);
      
      // Gerar o PDF da fatura
      console.log("Gerando PDF da fatura...");
      const pdfBlob = await generateInvoicePDF(invoiceData);
      
      if (!pdfBlob || pdfBlob.size === 0) {
        console.error("PDF gerado está vazio");
        throw new Error("PDF gerado está vazio");
      }
      
      console.log(`PDF gerado com sucesso, tamanho: ${pdfBlob.size} bytes`);
      
      return {
        invoice,
        pdfBlob,
        unitKey
      };
    } catch (error) {
      console.error(`Erro ao processar fatura para a unidade ${unit.block}-${unit.number}:`, error);
      throw error;
    }
  };

  // Função para gerar e baixar uma fatura individual
  const handleGenerateInvoiceForUnit = async (unit: any) => {
    try {
      // Verificar se a fatura já foi gerada para esta unidade
      const unitKey = `${unit.block}-${unit.number}`;
      
      if (generatedInvoices[unitKey]) {
        toast({
          title: "Informação",
          description: `A fatura para a unidade ${unitKey} já foi gerada.`
        });
        return;
      }

      setIsGeneratingPDF(true);
      
      // Processar a geração da fatura
      const { pdfBlob, unitKey: processedUnitKey } = await processFaturaGeneration(unit);
      
      // Criar URL para download
      const url = URL.createObjectURL(pdfBlob);
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `fatura_${unit.block}-${unit.number}_${billingData.reference.month}_${billingData.reference.year}.pdf`;
      document.body.appendChild(link); // Adicionar o link ao DOM
      link.click();
      
      // Pequeno atraso antes de remover o link e revogar a URL
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      // Marcar a fatura como gerada
      setGeneratedInvoices(prev => ({
        ...prev,
        [processedUnitKey]: true
      }));
      
      console.log(`Fatura para a unidade ${processedUnitKey} gerada com sucesso!`);
      toast({
        title: "Sucesso",
        description: `Fatura para a unidade ${processedUnitKey} gerada com sucesso!`
      });
    } catch (error) {
      console.error(`Erro ao gerar fatura para a unidade ${unit.block}-${unit.number}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao gerar fatura para a unidade ${unit.block}-${unit.number}: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Função para gerar todas as faturas
  const generateAllInvoices = async () => {
    try {
      setIsGeneratingZip(true);
      console.log("Iniciando geração de todas as faturas...");
      
      // Criar um objeto ZIP para armazenar todos os PDFs
      const zip = new JSZip();
      let successCount = 0;
      let errorCount = 0;
      
      // Gerar faturas para cada unidade
      for (const unit of units) {
        try {
          const unitKey = `${unit.block}-${unit.number}`;
          console.log(`Processando unidade: ${unitKey}`);
          
          // Processar a geração da fatura
          const { pdfBlob, unitKey: processedUnitKey } = await processFaturaGeneration(unit);
          
          // Nome do arquivo no ZIP
          const fileName = `fatura_${processedUnitKey}_${billingData.reference.month}_${billingData.reference.year}.pdf`;
          
          // Adicionar o PDF ao ZIP
          zip.file(fileName, pdfBlob);
          
          // Marcar a fatura como gerada
          setGeneratedInvoices(prev => ({
            ...prev,
            [processedUnitKey]: true
          }));
          
          successCount++;
        } catch (unitError) {
          console.error(`Erro ao processar a unidade ${unit.block}-${unit.number}:`, unitError);
          errorCount++;
          // Continuar com as próximas unidades mesmo se houver erro
        }
      }
      
      // Verificar se alguma fatura foi gerada com sucesso
      if (successCount === 0) {
        console.error("Nenhuma fatura foi gerada com sucesso");
        throw new Error("Nenhuma fatura foi gerada com sucesso");
      }
      
      console.log(`Gerando arquivo ZIP com ${successCount} faturas`);
      
      // Gerar o arquivo ZIP
      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      });
      
      console.log(`Arquivo ZIP gerado com sucesso, tamanho: ${zipBlob.size} bytes`);
      
      if (!zipBlob || zipBlob.size === 0) {
        console.error("Arquivo ZIP gerado está vazio");
        throw new Error("Arquivo ZIP gerado está vazio");
      }
      
      // Criar URL para download
      const url = URL.createObjectURL(zipBlob);
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `faturas_${billingData.reference.month}_${billingData.reference.year}.zip`;
      document.body.appendChild(link); // Adicionar o link ao DOM
      link.click();
      
      // Pequeno atraso antes de remover o link e revogar a URL
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      // Exibir mensagem de sucesso
      console.log(`${successCount} faturas geradas com sucesso${errorCount > 0 ? ` (${errorCount} com erro)` : ''}.`);
      toast({
        title: "Sucesso",
        description: `${successCount} faturas geradas com sucesso${errorCount > 0 ? ` (${errorCount} com erro)` : ''}.`,
      });
      
    } catch (error) {
      console.error("Erro ao gerar todas as faturas:", error);
      toast({
        title: "Erro",
        description: `Erro ao gerar todas as faturas: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Geração de Faturas</h2>
        <p className="text-muted-foreground">
          Revise as informações e gere as faturas para as unidades selecionadas.
        </p>
      </div>
      
        <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold">Resumo do Faturamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="font-medium text-sm text-muted-foreground mb-1">Mês de Referência</div>
                  <div className="font-semibold">
                    {getMonthName(billingData.reference.month || 1)} / {billingData.reference.year || new Date().getFullYear()}
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="font-medium text-sm text-muted-foreground mb-1">Data de Vencimento</div>
                  <div className="font-semibold">
                    {billingData.dueDate ? format(new Date(billingData.dueDate), 'dd/MM/yyyy') : 'Não definida'}
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="font-medium text-sm text-muted-foreground mb-1">Total a Faturar</div>
                  <div className="font-semibold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold">Itens de Cobrança</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left">Descrição</th>
                      <th className="px-4 py-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingData.chargeItems?.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-right">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted">
                    <tr>
                      <td className="px-4 py-2 font-semibold">Total</td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="grid gap-2">
              <h3 className="text-lg font-semibold">Gerar Todas as Faturas</h3>
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={isGeneratingPDF || isGeneratingZip}
                >
                  Voltar
                </Button>
                <Button 
                  variant="default" 
                  onClick={generateAllInvoices}
                  disabled={isGeneratingPDF || isGeneratingZip}
                >
                  {isGeneratingZip ? (
                    <>
                      <Archive className="mr-2 h-4 w-4 animate-spin" />
                      Gerando ZIP...
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 h-4 w-4" />
                      Gerar Todas as Faturas (ZIP)
                    </>
                  )}
                </Button>
              </div>
            </div>
      
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold">Faturas Individuais</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left">Unidade</th>
                      <th className="px-4 py-2 text-left">Proprietário</th>
                      <th className="px-4 py-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((unit) => (
                      <tr key={unit.id} className="border-t">
                        <td className="px-4 py-2">{unit.block}-{unit.number}</td>
                        <td className="px-4 py-2">{unit.owner || "Proprietário"}</td>
                        <td className="px-4 py-2 text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleGenerateInvoiceForUnit(unit)}
                            disabled={isGeneratingPDF || isGeneratingZip || generatedInvoices[`${unit.block}-${unit.number}`]}
                          >
                            {generatedInvoices[`${unit.block}-${unit.number}`] ? (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                Gerada
                              </>
                            ) : isGeneratingPDF ? (
                              <>
                                <FileText className="mr-2 h-4 w-4 animate-spin" />
                                Gerando...
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-4 w-4" />
                                Gerar Fatura
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingGeneratorStep4;
