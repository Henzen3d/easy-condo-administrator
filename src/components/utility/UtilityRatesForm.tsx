
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
import { UtilityRate } from "@/types/consumption";

export default function UtilityRatesForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gasRate, setGasRate] = useState<UtilityRate | null>(null);
  const [waterRate, setWaterRate] = useState<UtilityRate | null>(null);
  const [newRate, setNewRate] = useState({
    utility_type: "gas" as "gas" | "water",
    rate_per_cubic_meter: "",
    effective_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadLatestRates();
  }, []);

  const loadLatestRates = async () => {
    setLoading(true);
    try {
      // Get latest gas rate
      const { data: gasData, error: gasError } = await supabase
        .from('utility_rates')
        .select('*')
        .eq('utility_type', 'gas')
        .order('effective_date', { ascending: false })
        .limit(1);

      if (gasError) throw gasError;
      if (gasData.length > 0) {
        // Type assertion to ensure the utility_type is correctly typed
        const gasRateData = { 
          ...gasData[0], 
          utility_type: gasData[0].utility_type as "gas" | "water" 
        };
        setGasRate(gasRateData);
      }

      // Get latest water rate
      const { data: waterData, error: waterError } = await supabase
        .from('utility_rates')
        .select('*')
        .eq('utility_type', 'water')
        .order('effective_date', { ascending: false })
        .limit(1);

      if (waterError) throw waterError;
      if (waterData.length > 0) {
        // Type assertion to ensure the utility_type is correctly typed
        const waterRateData = { 
          ...waterData[0], 
          utility_type: waterData[0].utility_type as "gas" | "water" 
        };
        setWaterRate(waterRateData);
      }

    } catch (error) {
      console.error("Error loading rates:", error);
      toast({
        title: "Erro ao carregar taxas",
        description: "Não foi possível carregar as taxas atuais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRate.rate_per_cubic_meter || parseFloat(newRate.rate_per_cubic_meter) <= 0) {
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
        .from('utility_rates')
        .insert([{
          utility_type: newRate.utility_type,
          rate_per_cubic_meter: parseFloat(newRate.rate_per_cubic_meter),
          effective_date: newRate.effective_date
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Taxa atualizada com sucesso",
        description: `A nova taxa de ${newRate.utility_type === 'gas' ? 'gás' : 'água'} foi cadastrada.`
      });

      // Update the state with the new rate
      if (data && data.length > 0) {
        const rateData = {
          ...data[0],
          utility_type: data[0].utility_type as "gas" | "water"
        };
        
        if (newRate.utility_type === 'gas') {
          setGasRate(rateData);
        } else {
          setWaterRate(rateData);
        }
      }

      // Reset form
      setNewRate({
        ...newRate,
        rate_per_cubic_meter: ""
      });

      // Reload rates to ensure we have the latest data
      loadLatestRates();
    } catch (error) {
      console.error("Error saving rate:", error);
      toast({
        title: "Erro ao salvar taxa",
        description: "Não foi possível salvar a nova taxa.",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxas de Consumo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 p-4 border rounded-lg">
            <h3 className="font-medium">Taxa Atual - Gás</h3>
            {gasRate ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold">{formatCurrency(gasRate.rate_per_cubic_meter)}/m³</p>
                <p className="text-sm text-muted-foreground">
                  Atualizado em {formatDate(gasRate.effective_date)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma taxa configurada</p>
            )}
          </div>
          
          <div className="space-y-2 p-4 border rounded-lg">
            <h3 className="font-medium">Taxa Atual - Água</h3>
            {waterRate ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold">{formatCurrency(waterRate.rate_per_cubic_meter)}/m³</p>
                <p className="text-sm text-muted-foreground">
                  Atualizado em {formatDate(waterRate.effective_date)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma taxa configurada</p>
            )}
          </div>
        </div>

        <form className="space-y-4 pt-4 border-t" onSubmit={handleSubmit}>
          <h3 className="font-medium">Cadastrar Nova Taxa</h3>
          
          <div className="space-y-2">
            <Label htmlFor="utility-type">Tipo de Consumo</Label>
            <Select 
              value={newRate.utility_type} 
              onValueChange={(value: "gas" | "water") => setNewRate({...newRate, utility_type: value})}
            >
              <SelectTrigger id="utility-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gas">Gás</SelectItem>
                <SelectItem value="water">Água</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rate-value">Valor por m³ (R$)</Label>
            <Input 
              id="rate-value" 
              type="number" 
              step="0.01" 
              placeholder="0.00"
              value={newRate.rate_per_cubic_meter}
              onChange={(e) => setNewRate({...newRate, rate_per_cubic_meter: e.target.value})}
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
