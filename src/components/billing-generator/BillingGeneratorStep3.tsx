
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { pt } from 'date-fns/locale';

interface BillingGeneratorStep3Props {
  billingData: any;
  updateBillingData: (data: any) => void;
}

const BillingGeneratorStep3 = ({ 
  billingData, 
  updateBillingData 
}: BillingGeneratorStep3Props) => {
  
  const handleDateChange = (field: string, date: Date | undefined) => {
    if (date) {
      if (field === 'startDate') {
        updateBillingData({
          statementPeriod: {
            ...billingData.statementPeriod,
            startDate: date,
          }
        });
      } else if (field === 'endDate') {
        updateBillingData({
          statementPeriod: {
            ...billingData.statementPeriod,
            endDate: date,
          }
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Período de Exibição do Balancete</h3>
        <p className="text-sm text-muted-foreground">
          Define o período a ser considerado no balancete que acompanha o boleto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="statement-start-date">Data Inicial</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                id="statement-start-date"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {billingData.statementPeriod?.startDate ? (
                  format(new Date(billingData.statementPeriod.startDate), "dd 'de' MMMM 'de' yyyy", { locale: pt })
                ) : (
                  <span>Selecione a data inicial</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={billingData.statementPeriod?.startDate ? new Date(billingData.statementPeriod.startDate) : undefined}
                onSelect={(date) => handleDateChange('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="statement-end-date">Data Final</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                id="statement-end-date"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {billingData.statementPeriod?.endDate ? (
                  format(new Date(billingData.statementPeriod.endDate), "dd 'de' MMMM 'de' yyyy", { locale: pt })
                ) : (
                  <span>Selecione a data final</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={billingData.statementPeriod?.endDate ? new Date(billingData.statementPeriod.endDate) : undefined}
                onSelect={(date) => handleDateChange('endDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional-message">Mensagem Adicional nos Boletos</Label>
        <Textarea
          id="additional-message"
          placeholder="Informe aqui mensagens importantes para os condôminos..."
          rows={6}
          value={billingData.additionalMessage}
          onChange={(e) => updateBillingData({ additionalMessage: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Esta mensagem aparecerá impressa nos boletos gerados.
        </p>
      </div>
    </div>
  );
};

export default BillingGeneratorStep3;
