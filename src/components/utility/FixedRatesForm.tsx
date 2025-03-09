import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FixedRate } from "@/types/consumption";

export default function FixedRatesForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [condoRate, setCondoRate] = useState<FixedRate | null>(null);
  const [reserveRate, setReserveRate] = useState<FixedRate | null>(null);
  const [newRate, setNewRate] = useState({
    rate_type: "condo" as "condo" | "reserve",
    billing_method: "fixed" as "fixed" | "prorated",
    expense_type: "ordinary" as "ordinary" | "extraordinary",
    amount: "",
    effective_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadLatestRates();
  }, []);

  const loadLatestRates = async () => {
    setLoading(true);
    try {
      // Get latest condo rate
      const { data: condoData, error: condoError } = await supabase
        .from('fixed_rates')
        .select('*')
        .eq('rate_type', 'condo')
        .order('effective_date', { ascending: false })
        .limit(1);

      if (condoError) throw condoError;
      if (condoData && condoData.length > 0) {
        // Type assertion to ensure the rate_type is correctly typed
        const condoRateData = { 
          ...condoData[0], 
          rate_type: condoData[0].rate_type as "condo" | "reserve",
          billing_method: condoData[0].billing_method as "fixed" | "prorated",
          expense_type: condoData[0].expense_type as "ordinary" | "extraordinary"
        };
        setCondoRate(condoRateData);
      }

      // Get latest reserve fund rate
      const { data: reserveData, error: reserveError } = await supabase
        .from('fixed_rates')
        .select('*')
        .eq('rate_type', 'reserve')
        .order('effective_date', { ascending: false })
        .limit(1);

      if (reserveError) throw reserveError;
      if (reserveData && reserveData.length > 0) {
        // Type assertion to ensure the rate_type is correctly typed
        const reserveRateData = { 
          ...reserveData[0], 
          rate_type: reserveData[0].rate_type as "condo" | "reserve",
          billing_method: reserveData[0].billing_method as "fixed" | "prorated",
          expense_type: reserveData[0].expense_type as "ordinary" | "extraordinary"
        };
        setReserveRate(reserveRateData);
      }

    } catch (error) {
      console.error("Error loading fixed rates:", error);
      toast({
        title: "Erro ao carregar taxas fixas",
        description: "Não foi possível carregar as taxas fixas atuais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRate.amount || parseFloat(newRate.amount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fixed_rates')
        .insert([{
          rate_type: newRate.rate_type,
          billing_method: newRate.billing_method,
          expense_type: newRate.expense_type,
          amount: parseFloat(newRate.amount),
          effective_date: newRate.effective_date
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Taxa fixa atualizada com sucesso",
        description: `A nova ${newRate.rate_type === 'condo' ? 'Taxa de Condomínio' : 'Taxa de Fundo de Reserva'} foi cadastrada.`
      });

      // Update the state with the new rate
      if (data && data.length > 0) {
        const rateData = {
          ...data[0],
          rate_type: data[0].rate_type as "condo" | "reserve",
          billing_method: data[0].billing_method as "fixed" | "prorated",
          expense_type: data[0].expense_type as "ordinary" | "extraordinary"
        };
        
        if (newRate.rate_type === 'condo') {
          setCondoRate(rateData);
        } else {
          setReserveRate(rateData);
        }
      }

      // Reset form
      setNewRate({
        ...newRate,
        amount: ""
      });

      // Reload rates to ensure we have the latest data
      loadLatestRates();
    } catch (error) {
      console.error("Error saving fixed rate:", error);
      toast({
        title: "Erro ao salvar taxa fixa",
        description: "Não foi possível salvar a nova taxa fixa.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getBillingMethodLabel = (method: string) => {
    return method === 'fixed' ? 'Valor Fixo' : 'Rateio';
  };

  const getExpenseTypeLabel = (type: string) => {
    return type === 'ordinary' ? 'Ordinária' : 'Extraordinária';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxas Fixas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 p-4 border rounded-lg">
            <h3 className="font-medium">Taxa de Condomínio Atual</h3>
            {condoRate ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold">{formatCurrency(condoRate.amount)}</p>
                <p className="text-sm text-muted-foreground">
                  Método: {getBillingMethodLabel(condoRate.billing_method)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tipo: {getExpenseTypeLabel(condoRate.expense_type)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Atualizado em {formatDate(condoRate.effective_date)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma taxa configurada</p>
            )}
          </div>
          
          <div className="space-y-2 p-4 border rounded-lg">
            <h3 className="font-medium">Taxa de Fundo de Reserva Atual</h3>
            {reserveRate ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold">{formatCurrency(reserveRate.amount)}</p>
                <p className="text-sm text-muted-foreground">
                  Método: {getBillingMethodLabel(reserveRate.billing_method)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tipo: {getExpenseTypeLabel(reserveRate.expense_type)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Atualizado em {formatDate(reserveRate.effective_date)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma taxa configurada</p>
            )}
          </div>
        </div>

        <form className="space-y-4 pt-4 border-t" onSubmit={handleSubmit}>
          <h3 className="font-medium">Cadastrar Nova Taxa Fixa</h3>
          
          <div className="space-y-2">
            <Label htmlFor="rate-type">Tipo de Taxa</Label>
            <Select 
              value={newRate.rate_type} 
              onValueChange={(value: "condo" | "reserve") => setNewRate({...newRate, rate_type: value})}
            >
              <SelectTrigger id="rate-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="condo">Taxa de Condomínio</SelectItem>
                <SelectItem value="reserve">Fundo de Reserva</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billing-method">Método de Cobrança</Label>
            <Select 
              value={newRate.billing_method} 
              onValueChange={(value: "fixed" | "prorated") => setNewRate({...newRate, billing_method: value})}
            >
              <SelectTrigger id="billing-method">
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Valor Fixo</SelectItem>
                <SelectItem value="prorated">Rateio</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {newRate.billing_method === 'fixed' 
                ? 'Valor constante aprovado em assembleia.' 
                : 'Valor varia a cada mês, com base nas despesas realizadas.'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expense-type">Tipo de Despesa</Label>
            <Select 
              value={newRate.expense_type} 
              onValueChange={(value: "ordinary" | "extraordinary") => setNewRate({...newRate, expense_type: value})}
            >
              <SelectTrigger id="expense-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordinary">Ordinária</SelectItem>
                <SelectItem value="extraordinary">Extraordinária</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {newRate.expense_type === 'ordinary' 
                ? 'Despesas de manutenção do condomínio (luz, água, gás, salários, etc.).' 
                : 'Despesas com reformas, aquisição patrimonial, benfeitorias, etc.'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rate-value">Valor (R$)</Label>
            <Input 
              id="rate-value" 
              type="number" 
              step="0.01" 
              placeholder="0.00"
              value={newRate.amount}
              onChange={(e) => setNewRate({...newRate, amount: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="effective-date">Data de Vigência</Label>
            <Input 
              id="effective-date" 
              type="date" 
              value={newRate.effective_date}
              onChange={(e) => setNewRate({...newRate, effective_date: e.target.value})}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Nova Taxa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
