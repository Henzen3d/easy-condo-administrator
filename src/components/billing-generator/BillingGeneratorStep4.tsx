
import { CalendarIcon, CheckCircle2, Droplet, Flame } from "lucide-react";
import { format } from "date-fns";
import { pt } from 'date-fns/locale';
import { Card, CardContent } from "@/components/ui/card";

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
  // Calculate total amount
  const totalAmount = billingData.chargeItems?.reduce(
    (sum: number, item: any) => sum + parseFloat(item.value || 0), 
    0
  ) || 0;
  
  // Determine discount amount if applicable
  const discountAmount = billingData.earlyPaymentDiscount?.enabled 
    ? billingData.earlyPaymentDiscount.discountType === "percentage"
      ? totalAmount * (billingData.earlyPaymentDiscount.discountValue / 100)
      : billingData.earlyPaymentDiscount.discountValue
    : 0;
  
  // Calculate final amount after discount
  const finalAmount = totalAmount - discountAmount;
  
  // Determine units involved
  const unitsDisplay = billingData.targetUnits === "all"
    ? "Todas as Unidades"
    : mockUnits.find(u => String(u.id) === String(billingData.targetUnits))
      ? `${mockUnits.find(u => String(u.id) === String(billingData.targetUnits))?.block}-${mockUnits.find(u => String(u.id) === String(billingData.targetUnits))?.number}`
      : "Unidade não encontrada";

  // Count consumption items
  const gasItems = billingData.chargeItems?.filter((item: any) => 
    item.description?.includes('Consumo de Gás')
  ).length || 0;
  
  const waterItems = billingData.chargeItems?.filter((item: any) => 
    item.description?.includes('Consumo de Água')
  ).length || 0;

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
                <span className="text-muted-foreground">Data de Vencimento:</span>
                <span className="font-medium">
                  {billingData.dueDate 
                    ? format(new Date(billingData.dueDate), "dd/MM/yyyy") 
                    : "Não informado"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Unidades:</span>
                <span className="font-medium">{unitsDisplay}</span>
              </li>
              
              {billingData.statementPeriod?.startDate && billingData.statementPeriod?.endDate && (
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Período de Consumo:</span>
                  <span className="font-medium">
                    {format(new Date(billingData.statementPeriod.startDate), "dd/MM/yyyy")} a {format(new Date(billingData.statementPeriod.endDate), "dd/MM/yyyy")}
                  </span>
                </li>
              )}
              
              {gasItems > 0 && (
                <li className="flex justify-between text-amber-700 dark:text-amber-500">
                  <span className="flex items-center">
                    <Flame className="h-4 w-4 mr-1" />
                    Consumo de Gás:
                  </span>
                  <span className="font-medium">{gasItems} unidade(s)</span>
                </li>
              )}
              
              {waterItems > 0 && (
                <li className="flex justify-between text-blue-700 dark:text-blue-500">
                  <span className="flex items-center">
                    <Droplet className="h-4 w-4 mr-1" />
                    Consumo de Água:
                  </span>
                  <span className="font-medium">{waterItems} unidade(s)</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Valores</h4>
            
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Valor Total:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                    .format(totalAmount)}
                </span>
              </li>
              
              {billingData.earlyPaymentDiscount?.enabled && (
                <>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Desconto por Pontualidade:</span>
                    <span className="font-medium text-green-600">
                      {billingData.earlyPaymentDiscount.discountType === "percentage"
                        ? `${billingData.earlyPaymentDiscount.discountValue}%`
                        : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                            .format(billingData.earlyPaymentDiscount.discountValue)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Data Limite para Desconto:</span>
                    <span className="font-medium">
                      {billingData.earlyPaymentDiscount.dueDate 
                        ? format(new Date(billingData.earlyPaymentDiscount.dueDate), "dd/MM/yyyy") 
                        : "Não informado"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Valor com Desconto:</span>
                    <span className="font-medium text-green-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                        .format(finalAmount)}
                    </span>
                  </li>
                </>
              )}
              
              <li className="flex justify-between pt-2 mt-2 border-t">
                <span className="text-muted-foreground">Itens de Cobrança:</span>
                <span className="font-medium">{billingData.chargeItems?.length || 0} item(ns)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {billingData.chargeItems?.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Detalhamento dos Itens</h4>
            
            <ul className="divide-y">
              {billingData.chargeItems.map((item: any, index: number) => {
                const category = chargeCategories.find(cat => cat.id === item.category)?.name || item.category;
                const unitDisplay = item.unit === "all" 
                  ? "Todas as Unidades" 
                  : mockUnits.find(u => String(u.id) === String(item.unit))
                    ? `${mockUnits.find(u => String(u.id) === String(item.unit))?.block}-${mockUnits.find(u => String(u.id) === String(item.unit))?.number}`
                    : "Unidade não encontrada";
                
                // Check if this is a gas or water consumption item
                const isGasItem = item.description?.includes('Consumo de Gás');
                const isWaterItem = item.description?.includes('Consumo de Água');
                const icon = isGasItem ? <Flame className="h-4 w-4 mr-1 text-amber-600" /> : 
                       isWaterItem ? <Droplet className="h-4 w-4 mr-1 text-blue-600" /> : null;
                
                return (
                  <li key={item.id || index} className="py-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium flex items-center">
                          {icon}
                          {item.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category} • {unitDisplay}
                        </p>
                      </div>
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(parseFloat(item.value || 0))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {billingData.additionalMessage && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium mb-2">Mensagem Adicional</h4>
            <p className="text-sm whitespace-pre-line">{billingData.additionalMessage}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillingGeneratorStep4;
