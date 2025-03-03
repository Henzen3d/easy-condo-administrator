
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
  const [period, setPeriod] = useState({
    start_date: billingData.statementPeriod?.startDate || "",
    end_date: billingData.statementPeriod?.endDate || ""
  });

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
      if (gasData.length > 0) setGasRate(gasData[0]);

      // Get latest water rate
      const { data: waterData, error: waterError } = await supabase
        .from('utility_rates')
        .select('*')
        .eq('utility_type', 'water')
        .order('effective_date', { ascending: false })
        .limit(1);

      if (waterError) throw waterError;
      if (waterData.length > 0) setWaterRate(waterData[0]);

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

      return {
        previous: previousData.length > 0 ? previousData[0] : null,
        current: currentData.length > 0 ? currentData[0] : null
      };
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
        
        if (previous && current && gasRate) {
          consumption = Math.max(0, current.reading_value - previous.reading_value);
          total = consumption * gasRate.rate_per_cubic_meter;
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
        
        if (previous && current && waterRate) {
          consumption = Math.max(0, current.reading_value - previous.reading_value);
          total = consumption * waterRate.rate_per_cubic_meter;
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
          </div>
        </div>
        
        <Button 
          onClick={calculateConsumption} 
          disabled={loading || !period.start_date || !period.end_date}
        >
          {loading ? "Calculando..." : "Calcular Consumo"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'gas' | 'water')}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="gas">Consumo de Gás</TabsTrigger>
          <TabsTrigger value="water">Consumo de Água</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gas" className="space-y-4">
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="include-gas"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={billingData.includeGasConsumption}
              onChange={(e) => handleIncludeGasConsumption(e.target.checked)}
            />
            <Label htmlFor="include-gas">
              Incluir consumo de gás no faturamento
            </Label>
          </div>
          
          {!gasRate ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-amber-600">
                  <p>Taxa de consumo de gás não configurada. Configure a taxa antes de prosseguir.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Leitura Anterior</TableHead>
                      <TableHead>Leitura Atual</TableHead>
                      <TableHead>Consumo (m³)</TableHead>
                      <TableHead>Taxa (R$/m³)</TableHead>
                      <TableHead className="text-right">Total</TableHead>
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
                            {item.previous_reading ? (
                              <div className="text-sm">
                                <div>{item.previous_reading.reading_value} m³</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(item.previous_reading.reading_date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-amber-600">Sem leitura</span>
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
                            {item.consumption !== null ? `${item.consumption.toFixed(3)} m³` : "-"}
                          </TableCell>
                          <TableCell>{formatCurrency(item.rate)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.total !== null ? formatCurrency(item.total) : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="water" className="space-y-4">
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="include-water"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={billingData.includeWaterConsumption}
              onChange={(e) => handleIncludeWaterConsumption(e.target.checked)}
            />
            <Label htmlFor="include-water">
              Incluir consumo de água no faturamento
            </Label>
          </div>
          
          {!waterRate ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-amber-600">
                  <p>Taxa de consumo de água não configurada. Configure a taxa antes de prosseguir.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Leitura Anterior</TableHead>
                      <TableHead>Leitura Atual</TableHead>
                      <TableHead>Consumo (m³)</TableHead>
                      <TableHead>Taxa (R$/m³)</TableHead>
                      <TableHead className="text-right">Total</TableHead>
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
                            {item.previous_reading ? (
                              <div className="text-sm">
                                <div>{item.previous_reading.reading_value} m³</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(item.previous_reading.reading_date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-amber-600">Sem leitura</span>
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
                            {item.consumption !== null ? `${item.consumption.toFixed(3)} m³` : "-"}
                          </TableCell>
                          <TableCell>{formatCurrency(item.rate)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.total !== null ? formatCurrency(item.total) : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
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
