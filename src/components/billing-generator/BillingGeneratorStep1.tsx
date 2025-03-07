import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays, isWeekend, isValid } from "date-fns";
import { pt } from 'date-fns/locale';

interface BillingGeneratorStep1Props {
  billingData: any;
  updateBillingData: (data: any) => void;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

// Função para calcular o 10º dia útil do mês
const calculateTenthBusinessDay = (year: number, month: number) => {
  // Cria uma data para o primeiro dia do mês
  const date = new Date(year, month, 1);
  let businessDays = 0;
  
  // Conta até encontrar o 10º dia útil
  while (businessDays < 10) {
    // Avança um dia
    date.setDate(date.getDate() + 1);
    
    // Se não for fim de semana (0 = domingo, 6 = sábado)
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }
  
  return date;
};

// Função para gerar o nome do faturamento padrão
const generateDefaultBillingName = (month: number, year: number) => {
  return `Taxa de Condomínio - ${MONTHS[month]} de ${year}`;
};

const BillingGeneratorStep1 = ({ 
  billingData, 
  updateBillingData 
}: BillingGeneratorStep1Props) => {
  const [discountEnabled, setDiscountEnabled] = useState(billingData.earlyPaymentDiscount?.enabled || false);
  
  // Inicializa valores padrão quando o componente é montado
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Se não houver mês/ano de referência definidos, use o mês/ano atual
    if (!billingData.reference || !billingData.reference.month || !billingData.reference.year) {
      updateBillingData({
        reference: {
          month: currentMonth,
          year: currentYear
        }
      });
    }
    
    // Se não houver data de vencimento definida, calcule o 10º dia útil
    if (!billingData.dueDate) {
      const month = billingData.reference?.month !== undefined ? billingData.reference.month : currentMonth;
      const year = billingData.reference?.year !== undefined ? billingData.reference.year : currentYear;
      const tenthBusinessDay = calculateTenthBusinessDay(year, month);
      
      updateBillingData({ dueDate: tenthBusinessDay });
    }
    
    // Se não houver nome de faturamento definido, gere um padrão
    if (!billingData.name) {
      const month = billingData.reference?.month !== undefined ? billingData.reference.month : currentMonth;
      const year = billingData.reference?.year !== undefined ? billingData.reference.year : currentYear;
      const defaultName = generateDefaultBillingName(month, year);
      
      updateBillingData({ name: defaultName });
    }
  }, [billingData.reference?.month, billingData.reference?.year]);
  
  // Atualiza o nome do faturamento quando o mês/ano de referência mudar
  useEffect(() => {
    if (billingData.reference?.month !== undefined && billingData.reference?.year !== undefined) {
      // Só atualiza automaticamente se o nome atual for o padrão ou estiver vazio
      const currentDefaultName = generateDefaultBillingName(billingData.reference.month, billingData.reference.year);
      
      // Verifica se o nome atual é o padrão do mês anterior ou está vazio
      const shouldUpdateName = !billingData.name || 
        billingData.name.startsWith('Taxa de Condomínio - ');
      
      if (shouldUpdateName) {
        updateBillingData({ name: currentDefaultName });
      }
      
      // Recalcula a data de vencimento (10º dia útil) quando o mês/ano mudar
      const tenthBusinessDay = calculateTenthBusinessDay(billingData.reference.year, billingData.reference.month);
      
      // Só atualiza a data de vencimento se não tiver sido manualmente alterada
      const shouldUpdateDueDate = !billingData.dueDate || 
        (billingData.dueDate && billingData.dueDateAutoSet);
      
      if (shouldUpdateDueDate) {
        updateBillingData({ 
          dueDate: tenthBusinessDay,
          dueDateAutoSet: true
        });
      }
    }
  }, [billingData.reference?.month, billingData.reference?.year]);
  
  const handleDiscountToggle = (checked: boolean) => {
    setDiscountEnabled(checked);
    updateBillingData({
      earlyPaymentDiscount: {
        ...billingData.earlyPaymentDiscount,
        enabled: checked,
      }
    });
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    if (date) {
      if (field === 'dueDate') {
        updateBillingData({ 
          dueDate: date,
          dueDateAutoSet: false // Marca que a data foi manualmente alterada
        });
      } else if (field === 'discountDueDate') {
        updateBillingData({
          earlyPaymentDiscount: {
            ...billingData.earlyPaymentDiscount,
            dueDate: date,
          }
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="reference-month">Referência - Mês</Label>
          <Select
            value={String(billingData.reference?.month)}
            onValueChange={(value) => 
              updateBillingData({
                reference: {
                  ...billingData.reference,
                  month: parseInt(value)
                }
              })
            }
          >
            <SelectTrigger id="reference-month">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={index} value={String(index)}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="reference-year">Referência - Ano</Label>
          <Select
            value={String(billingData.reference?.year)}
            onValueChange={(value) => 
              updateBillingData({
                reference: {
                  ...billingData.reference,
                  year: parseInt(value)
                }
              })
            }
          >
            <SelectTrigger id="reference-year">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="billing-name">Nome do Faturamento</Label>
        <Input
          id="billing-name"
          placeholder="Ex: Taxa de Condomínio - Janeiro de 2024"
          value={billingData.name}
          onChange={(e) => updateBillingData({ name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="due-date">Data de Vencimento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              id="due-date"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {billingData.dueDate ? (
                format(new Date(billingData.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: pt })
              ) : (
                <span>Selecione a data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={billingData.dueDate ? new Date(billingData.dueDate) : undefined}
              onSelect={(date) => handleDateChange('dueDate', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground mt-1">
          Data padrão: 10º dia útil do mês de referência
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Incluir Consumo</h3>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="gas-consumption"
            checked={billingData.includeGasConsumption}
            onCheckedChange={(checked) => 
              updateBillingData({ includeGasConsumption: !!checked })
            }
          />
          <Label htmlFor="gas-consumption">
            Cobrar Consumo de Gás referente ao mês selecionado
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="water-consumption"
            checked={billingData.includeWaterConsumption}
            onCheckedChange={(checked) => 
              updateBillingData({ includeWaterConsumption: !!checked })
            }
          />
          <Label htmlFor="water-consumption">
            Cobrar Consumo de Água referente ao mês selecionado
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-discount"
            checked={discountEnabled}
            onCheckedChange={(checked) => handleDiscountToggle(!!checked)}
          />
          <Label htmlFor="enable-discount">
            Aplicar Desconto por Pontualidade
          </Label>
        </div>

        {discountEnabled && (
          <div className="border p-4 rounded-md space-y-4">
            <div>
              <Label htmlFor="discount-due-date">Até a data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="discount-due-date"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {billingData.earlyPaymentDiscount?.dueDate ? (
                      format(new Date(billingData.earlyPaymentDiscount.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: pt })
                    ) : (
                      <span>Selecione a data limite para desconto</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={billingData.earlyPaymentDiscount?.dueDate ? new Date(billingData.earlyPaymentDiscount.dueDate) : undefined}
                    onSelect={(date) => handleDateChange('discountDueDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="discount-type">Tipo de Desconto</Label>
              <Select
                value={billingData.earlyPaymentDiscount?.discountType || "fixed"}
                onValueChange={(value) => 
                  updateBillingData({
                    earlyPaymentDiscount: {
                      ...billingData.earlyPaymentDiscount,
                      discountType: value
                    }
                  })
                }
              >
                <SelectTrigger id="discount-type">
                  <SelectValue placeholder="Selecione o tipo de desconto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                  <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount-value">
                {billingData.earlyPaymentDiscount?.discountType === "percentage" 
                  ? "Porcentagem de Desconto" 
                  : "Valor do Desconto"}
              </Label>
              <div className="relative">
                <Input
                  id="discount-value"
                  type="number"
                  min="0"
                  step={billingData.earlyPaymentDiscount?.discountType === "percentage" ? "0.01" : "1"}
                  placeholder={billingData.earlyPaymentDiscount?.discountType === "percentage" ? "5" : "10"}
                  value={billingData.earlyPaymentDiscount?.discountValue || ""}
                  onChange={(e) => 
                    updateBillingData({
                      earlyPaymentDiscount: {
                        ...billingData.earlyPaymentDiscount,
                        discountValue: parseFloat(e.target.value)
                      }
                    })
                  }
                  className="pl-8"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {billingData.earlyPaymentDiscount?.discountType === "percentage" ? "%" : "R$"}
                </div>
              </div>
            </div>

            <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertDescription>
                A utilização do desconto requer aprovação em Assembleia e outras questões legais. 
                Verifique antes de aplicá-lo nas cobranças do Condomínio.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingGeneratorStep1;
