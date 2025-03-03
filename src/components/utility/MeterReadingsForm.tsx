
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
import { MeterReading } from "@/types/consumption";

interface Unit {
  id: number;
  block: string;
  number: string;
}

export default function MeterReadingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [previousGasReading, setPreviousGasReading] = useState<MeterReading | null>(null);
  const [previousWaterReading, setPreviousWaterReading] = useState<MeterReading | null>(null);
  const [meterReading, setMeterReading] = useState({
    unit_id: "",
    utility_type: "gas",
    reading_value: "",
    reading_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    if (meterReading.unit_id && meterReading.utility_type) {
      loadPreviousReading();
    }
  }, [meterReading.unit_id, meterReading.utility_type]);

  const loadUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, block, number')
        .order('block')
        .order('number');

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error("Error loading units:", error);
      toast({
        title: "Erro ao carregar unidades",
        description: "Não foi possível carregar a lista de unidades.",
        variant: "destructive"
      });
    }
  };

  const loadPreviousReading = async () => {
    if (!meterReading.unit_id) return;
    
    setLoading(true);
    try {
      // Get latest reading for the selected unit and utility type
      const { data, error } = await supabase
        .from('meter_readings')
        .select('*')
        .eq('unit_id', meterReading.unit_id)
        .eq('utility_type', meterReading.utility_type)
        .order('reading_date', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (meterReading.utility_type === 'gas') {
        setPreviousGasReading(data.length > 0 ? data[0] : null);
      } else {
        setPreviousWaterReading(data.length > 0 ? data[0] : null);
      }
    } catch (error) {
      console.error("Error loading previous reading:", error);
      toast({
        title: "Erro ao carregar leitura anterior",
        description: "Não foi possível carregar os dados da leitura anterior.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meterReading.reading_value || parseFloat(meterReading.reading_value) < 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor de leitura válido.",
        variant: "destructive"
      });
      return;
    }

    // Check if new reading is less than previous reading
    const previousReading = meterReading.utility_type === 'gas' 
      ? previousGasReading 
      : previousWaterReading;
      
    if (previousReading && parseFloat(meterReading.reading_value) < previousReading.reading_value) {
      toast({
        title: "Leitura inválida",
        description: "A nova leitura não pode ser menor que a leitura anterior.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meter_readings')
        .insert([{
          unit_id: parseInt(meterReading.unit_id),
          utility_type: meterReading.utility_type,
          reading_value: parseFloat(meterReading.reading_value),
          reading_date: meterReading.reading_date
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Leitura registrada com sucesso",
        description: `A leitura de ${meterReading.utility_type === 'gas' ? 'gás' : 'água'} foi registrada.`
      });

      // Reset form
      setMeterReading({
        ...meterReading,
        reading_value: ""
      });

      // Reload previous reading
      loadPreviousReading();
    } catch (error) {
      console.error("Error saving reading:", error);
      toast({
        title: "Erro ao salvar leitura",
        description: "Não foi possível salvar a leitura do medidor.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leituras de Medidores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="unit-id">Unidade</Label>
            <Select 
              value={meterReading.unit_id} 
              onValueChange={(value) => setMeterReading({...meterReading, unit_id: value})}
            >
              <SelectTrigger id="unit-id">
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={String(unit.id)}>
                    {unit.block}-{unit.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="utility-type">Tipo de Consumo</Label>
            <Select 
              value={meterReading.utility_type} 
              onValueChange={(value) => setMeterReading({...meterReading, utility_type: value})}
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
          
          {meterReading.unit_id && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <h3 className="font-medium mb-2">Leitura Anterior</h3>
              {meterReading.utility_type === 'gas' ? (
                previousGasReading ? (
                  <div className="text-sm">
                    <p><strong>Valor:</strong> {previousGasReading.reading_value} m³</p>
                    <p><strong>Data:</strong> {formatDate(previousGasReading.reading_date)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma leitura anterior registrada</p>
                )
              ) : (
                previousWaterReading ? (
                  <div className="text-sm">
                    <p><strong>Valor:</strong> {previousWaterReading.reading_value} m³</p>
                    <p><strong>Data:</strong> {formatDate(previousWaterReading.reading_date)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma leitura anterior registrada</p>
                )
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reading-value">Valor da Leitura (m³)</Label>
            <Input 
              id="reading-value" 
              type="number" 
              step="0.001" 
              placeholder="0.000"
              value={meterReading.reading_value}
              onChange={(e) => setMeterReading({...meterReading, reading_value: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reading-date">Data da Leitura</Label>
            <Input 
              id="reading-date" 
              type="date" 
              value={meterReading.reading_date}
              onChange={(e) => setMeterReading({...meterReading, reading_date: e.target.value})}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading || !meterReading.unit_id}>
            {loading ? "Salvando..." : "Registrar Leitura"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
