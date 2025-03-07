import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { MeterReading, UtilityRate } from "@/types/consumption";
import { CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface Unit {
  id: number;
  block: string;
  number: string;
}

interface ConsumptionData {
  unit_id: number;
  unit_name: string;
  utility_type: 'gas' | 'water';
  previous_reading: MeterReading | null;
  current_reading: MeterReading | null;
  consumption: number | null;
  rate: number;
  total: number | null;
}

export default function BillingGeneratorConsumption({ 
  billingData,
  updateBillingData
}: { 
  billingData: any; 
  updateBillingData: (data: any) => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'gas' | 'water'>('gas');
  const [units, setUnits] = useState<Unit[]>([]);
  const [gasRate, setGasRate] = useState<UtilityRate | null>(null);
  const [waterRate, setWaterRate] = useState<UtilityRate | null>(null);
  const [gasConsumptionData, setGasConsumptionData] = useState<ConsumptionData[]>([]);
  const [waterConsumptionData, setWaterConsumptionData] = useState<ConsumptionData[]>([]);
  const [editingReading, setEditingReading] = useState<{
    unitId: number;
    utilityType: 'gas' | 'water';
    value: string;
  } | null>(null);
  const [period, setPeriod] = useState({
    start_date: billingData.statementPeriod?.startDate || "",
    end_date: billingData.statementPeriod?.endDate || ""
  });

  useEffect(() => {
    if (billingData.reference?.month !== undefined && billingData.reference?.year !== undefined) {
      const year = billingData.reference.year;
      const month = billingData.reference.month;
      
      // Primeiro dia do mês
      const firstDay = new Date(year, month, 1);
      // Último dia do mês (dia 0 do próximo mês é o último dia do mês atual)
      const lastDay = new Date(year, month + 1, 0);
      
      // Formatar as datas como strings YYYY-MM-DD
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      // Só atualiza se as datas não tiverem sido definidas manualmente
      if (!period.start_date || !period.end_date || 
          (billingData.periodAutoSet && !billingData.periodManuallyEdited)) {
        const newPeriod = {
          start_date: formatDate(firstDay),
          end_date: formatDate(lastDay)
        };
        
        setPeriod(newPeriod);
        
        // Atualiza o billingData
        updateBillingData({
          statementPeriod: {
            startDate: newPeriod.start_date,
            endDate: newPeriod.end_date
          },
          periodAutoSet: true
        });
      }
    }
  }, [billingData.reference?.month, billingData.reference?.year]);

  useEffect(() => {
    loadUnits();
    loadUtilityRates();
  }, []);

  useEffect(() => {
    if (units.length > 0 && (gasRate || waterRate)) {
      calculateConsumption();
    }
  }, [units, gasRate, waterRate, period.start_date, period.end_date]);

  useEffect(() => {
    // Update parent component with consumption data
    if (billingData.includeGasConsumption && gasConsumptionData.length > 0) {
      const gasChargeItems = gasConsumptionData
        .filter(item => item.consumption !== null && item.total !== null)
        .map(item => ({
          id: `gas-${item.unit_id}`,
          description: `Consumo de Gás - Unidade ${item.unit_name}`,
          value: item.total,
          unit: item.unit_id.toString(),
          category: "consumo"
        }));
      
      updateBillingData({
        gasConsumptionItems: gasChargeItems
      });
    }

    if (billingData.includeWaterConsumption && waterConsumptionData.length > 0) {
      const waterChargeItems = waterConsumptionData
        .filter(item => item.consumption !== null && item.total !== null)
        .map(item => ({
          id: `water-${item.unit_id}`,
          description: `Consumo de Água - Unidade ${item.unit_name}`,
          value: item.total,
          unit: item.unit_id.toString(),
          category: "consumo"
        }));
      
      updateBillingData({
        waterConsumptionItems: waterChargeItems
      });
    }
  }, [billingData.includeGasConsumption, billingData.includeWaterConsumption, gasConsumptionData, waterConsumptionData]);

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

  const loadUtilityRates = async () => {
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
    }
  };

  const fetchReadingsForPeriod = async (unit_id: number, utility_type: 'gas' | 'water') => {
    if (!period.start_date || !period.end_date) return { previous: null, current: null };

    try {
      // Get previous reading (before start date)
      const { data: previousData, error: previousError } = await supabase
        .from('meter_readings')
        .select('*')
        .eq('unit_id', unit_id)
        .eq('utility_type', utility_type)
        .lt('reading_date', period.start_date)
        .order('reading_date', { ascending: false })
        .limit(1);

      if (previousError) throw previousError;

      // If no previous reading found, try to get the initial reading (oldest reading for this unit)
      let previous = null;
      if (previousData.length > 0) {
        previous = {
          ...previousData[0],
          utility_type: previousData[0].utility_type as "gas" | "water"
        };
      } else {
        // Buscar a leitura inicial (a mais antiga) caso não exista leitura anterior ao período
        const { data: initialData, error: initialError } = await supabase
          .from('meter_readings')
          .select('*')
          .eq('unit_id', unit_id)
          .eq('utility_type', utility_type)
          .order('reading_date', { ascending: true }) // Ordena pela mais antiga primeiro
          .limit(1);
          
        if (!initialError && initialData.length > 0) {
          previous = {
            ...initialData[0],
            utility_type: initialData[0].utility_type as "gas" | "water"
          };
          console.log(`Usando leitura inicial como anterior para ${utility_type} da unidade ${unit_id}:`, previous);
        }
      }

      // Get current reading (closest to end date)
      const { data: currentData, error: currentError } = await supabase
        .from('meter_readings')
        .select('*')
        .eq('unit_id', unit_id)
        .eq('utility_type', utility_type)
        .lte('reading_date', period.end_date)
        .order('reading_date', { ascending: false })
        .limit(1);

      if (currentError) throw currentError;

      const current = currentData.length > 0 ? {
        ...currentData[0],
        utility_type: currentData[0].utility_type as "gas" | "water"
      } : null;

      // Se a leitura atual e anterior forem as mesmas, não considerar como leitura anterior
      if (previous && current && previous.id === current.id) {
        previous = null;
        console.log(`Leitura anterior e atual são iguais para ${utility_type} da unidade ${unit_id}, considerando sem leitura anterior`);
      }

      return { previous, current };
    } catch (error) {
      console.error(`Error fetching readings for unit ${unit_id}:`, error);
      return { previous: null, current: null };
    }
  };

  const calculateConsumption = async () => {
    if (!period.start_date || !period.end_date) {
      toast({
        title: "Período não definido",
        description: "Por favor, defina o período para calcular o consumo.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const gasConsumptionPromises = units.map(async (unit) => {
        const { previous, current } = await fetchReadingsForPeriod(unit.id, 'gas');
        
        let consumption = null;
        let total = null;
        
        // Calcular consumo somente se tiver ambas as leituras
        if (previous && current && gasRate) {
          // Verifica se a leitura atual é maior que a anterior
          if (current.reading_value >= previous.reading_value) {
            consumption = current.reading_value - previous.reading_value;
            total = consumption * gasRate.rate_per_cubic_meter;
          } else {
            console.warn(`Leitura atual de gás (${current.reading_value}) é menor que a anterior (${previous.reading_value}) para unidade ${unit.id}`);
            consumption = 0;
            total = 0;
          }
        }

        return {
          unit_id: unit.id,
          unit_name: `${unit.block}-${unit.number}`,
          utility_type: 'gas' as const,
          previous_reading: previous,
          current_reading: current,
          consumption,
          rate: gasRate?.rate_per_cubic_meter || 0,
          total
        };
      });

      const waterConsumptionPromises = units.map(async (unit) => {
        const { previous, current } = await fetchReadingsForPeriod(unit.id, 'water');
        
        let consumption = null;
        let total = null;
        
        // Calcular consumo somente se tiver ambas as leituras
        if (previous && current && waterRate) {
          // Verifica se a leitura atual é maior que a anterior
          if (current.reading_value >= previous.reading_value) {
            consumption = current.reading_value - previous.reading_value;
            total = consumption * waterRate.rate_per_cubic_meter;
          } else {
            console.warn(`Leitura atual de água (${current.reading_value}) é menor que a anterior (${previous.reading_value}) para unidade ${unit.id}`);
            consumption = 0;
            total = 0;
          }
        }

        return {
          unit_id: unit.id,
          unit_name: `${unit.block}-${unit.number}`,
          utility_type: 'water' as const,
          previous_reading: previous,
          current_reading: current,
          consumption,
          rate: waterRate?.rate_per_cubic_meter || 0,
          total
        };
      });

      const gasResults = await Promise.all(gasConsumptionPromises);
      const waterResults = await Promise.all(waterConsumptionPromises);

      setGasConsumptionData(gasResults);
      setWaterConsumptionData(waterResults);

      // Update parent component's period
      updateBillingData({
        statementPeriod: {
          startDate: period.start_date,
          endDate: period.end_date
        }
      });

    } catch (error) {
      console.error("Error calculating consumption:", error);
      toast({
        title: "Erro ao calcular consumo",
        description: "Ocorreu um erro ao calcular o consumo das unidades.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const handleIncludeGasConsumption = (include: boolean) => {
    updateBillingData({ includeGasConsumption: include });
  };

  const handleIncludeWaterConsumption = (include: boolean) => {
    updateBillingData({ includeWaterConsumption: include });
  };

  const handlePeriodChange = (field: 'start_date' | 'end_date', value: string) => {
    setPeriod(prev => ({ ...prev, [field]: value }));
    
    // Marca que o período foi editado manualmente
    updateBillingData({
      periodManuallyEdited: true
    });
  };

  // Função para iniciar a edição de uma leitura anterior
  const startEditingReading = (unitId: number, utilityType: 'gas' | 'water') => {
    setEditingReading({
      unitId,
      utilityType,
      value: ""
    });
  };

  // Função para salvar uma leitura anterior
  const saveInitialReading = async () => {
    if (!editingReading || !editingReading.value || parseFloat(editingReading.value) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido para a leitura.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Salvar a leitura no banco de dados
      const readingDate = period.start_date;
      const { error } = await supabase
        .from('meter_readings')
        .insert([{
          unit_id: editingReading.unitId,
          utility_type: editingReading.utilityType,
          reading_value: parseFloat(editingReading.value),
          reading_date: readingDate
        }]);

      if (error) throw error;

      toast({
        title: "Leitura salva com sucesso",
        description: "A leitura inicial foi registrada e será usada para cálculos futuros."
      });

      // Recalcular o consumo
      calculateConsumption();
      
      // Limpar o estado de edição
      setEditingReading(null);
    } catch (error) {
      console.error("Erro ao salvar leitura inicial:", error);
      toast({
        title: "Erro ao salvar leitura",
        description: "Não foi possível salvar a leitura inicial.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para cancelar a edição
  const cancelEditingReading = () => {
    setEditingReading(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Período de Leitura</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Data Inicial</Label>
            <input
              id="start-date"
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={period.start_date}
              onChange={(e) => handlePeriodChange('start_date', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Padrão: Primeiro dia do mês de referência
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-date">Data Final</Label>
            <input
              id="end-date"
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={period.end_date}
              onChange={(e) => handlePeriodChange('end_date', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Padrão: Último dia do mês de referência
            </p>
          </div>
        </div>
        
        <Button 
          onClick={calculateConsumption} 
          disabled={loading || !period.start_date || !period.end_date}
        >
          {loading ? "Calculando..." : "Calcular Consumo"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'gas' | 'water')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gas">Consumo de Gás</TabsTrigger>
          <TabsTrigger value="water">Consumo de Água</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gas" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-gas-consumption"
              checked={billingData.includeGasConsumption}
              onCheckedChange={(checked) => handleIncludeGasConsumption(!!checked)}
            />
            <Label htmlFor="include-gas-consumption">
              Incluir consumo de gás no faturamento
            </Label>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Leitura Anterior</TableHead>
                    <TableHead>Leitura Atual</TableHead>
                    <TableHead>Consumo (m³)</TableHead>
                    <TableHead>Taxa (R$/m³)</TableHead>
                    <TableHead>Total (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gasConsumptionData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        {loading ? "Calculando consumo..." : "Nenhum dado de consumo disponível"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    gasConsumptionData.map((item) => (
                      <TableRow key={`gas-${item.unit_id}`}>
                        <TableCell>{item.unit_name}</TableCell>
                        <TableCell>
                          {editingReading && 
                           editingReading.unitId === item.unit_id && 
                           editingReading.utilityType === 'gas' ? (
                            <div className="flex flex-col gap-2">
                              <Input
                                type="number"
                                step="0.001"
                                placeholder="Valor da leitura"
                                value={editingReading.value}
                                onChange={(e) => setEditingReading({
                                  ...editingReading,
                                  value: e.target.value
                                })}
                                className="w-32"
                              />
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={saveInitialReading}
                                  disabled={loading}
                                >
                                  Salvar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={cancelEditingReading}
                                  disabled={loading}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : item.previous_reading ? (
                            <div className="text-sm">
                              <div>{item.previous_reading.reading_value} m³</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(item.previous_reading.reading_date)}
                                {item.current_reading && item.previous_reading.reading_date === item.current_reading.reading_date ? (
                                  <span className="ml-1 text-blue-600 font-medium">(Leitura Inicial)</span>
                                ) : ""}
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="text-amber-600 hover:text-amber-800 hover:underline focus:outline-none"
                              onClick={() => startEditingReading(item.unit_id, 'gas')}
                            >
                              Sem leitura anterior
                              <div className="text-xs">Clique para adicionar</div>
                            </button>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.current_reading ? (
                            <div className="text-sm">
                              <div>{item.current_reading.reading_value} m³</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(item.current_reading.reading_date)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-amber-600">Sem leitura</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.consumption !== null ? (
                            <span>{item.consumption.toFixed(3)}</span>
                          ) : (
                            <span className="text-amber-600">-</span>
                          )}
                        </TableCell>
                        <TableCell>{item.rate.toFixed(2)}</TableCell>
                        <TableCell>
                          {item.total !== null ? (
                            <span className="font-medium">{formatCurrency(item.total)}</span>
                          ) : (
                            <span className="text-amber-600">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="water" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-water-consumption"
              checked={billingData.includeWaterConsumption}
              onCheckedChange={(checked) => handleIncludeWaterConsumption(!!checked)}
            />
            <Label htmlFor="include-water-consumption">
              Incluir consumo de água no faturamento
            </Label>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Leitura Anterior</TableHead>
                    <TableHead>Leitura Atual</TableHead>
                    <TableHead>Consumo (m³)</TableHead>
                    <TableHead>Taxa (R$/m³)</TableHead>
                    <TableHead>Total (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waterConsumptionData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        {loading ? "Calculando consumo..." : "Nenhum dado de consumo disponível"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    waterConsumptionData.map((item) => (
                      <TableRow key={`water-${item.unit_id}`}>
                        <TableCell>{item.unit_name}</TableCell>
                        <TableCell>
                          {editingReading && 
                           editingReading.unitId === item.unit_id && 
                           editingReading.utilityType === 'water' ? (
                            <div className="flex flex-col gap-2">
                              <Input
                                type="number"
                                step="0.001"
                                placeholder="Valor da leitura"
                                value={editingReading.value}
                                onChange={(e) => setEditingReading({
                                  ...editingReading,
                                  value: e.target.value
                                })}
                                className="w-32"
                              />
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={saveInitialReading}
                                  disabled={loading}
                                >
                                  Salvar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={cancelEditingReading}
                                  disabled={loading}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : item.previous_reading ? (
                            <div className="text-sm">
                              <div>{item.previous_reading.reading_value} m³</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(item.previous_reading.reading_date)}
                                {item.current_reading && item.previous_reading.reading_date === item.current_reading.reading_date ? (
                                  <span className="ml-1 text-blue-600 font-medium">(Leitura Inicial)</span>
                                ) : ""}
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="text-amber-600 hover:text-amber-800 hover:underline focus:outline-none"
                              onClick={() => startEditingReading(item.unit_id, 'water')}
                            >
                              Sem leitura anterior
                              <div className="text-xs">Clique para adicionar</div>
                            </button>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.current_reading ? (
                            <div className="text-sm">
                              <div>{item.current_reading.reading_value} m³</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(item.current_reading.reading_date)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-amber-600">Sem leitura</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.consumption !== null ? (
                            <span>{item.consumption.toFixed(3)}</span>
                          ) : (
                            <span className="text-amber-600">-</span>
                          )}
                        </TableCell>
                        <TableCell>{item.rate.toFixed(2)}</TableCell>
                        <TableCell>
                          {item.total !== null ? (
                            <span className="font-medium">{formatCurrency(item.total)}</span>
                          ) : (
                            <span className="text-amber-600">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(billingData.includeGasConsumption || billingData.includeWaterConsumption) && (
        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-400">
            Consumo selecionado será incluído automaticamente no faturamento.
          </span>
        </div>
      )}
    </div>
  );
}
