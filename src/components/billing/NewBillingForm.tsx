import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  getLatestMeterReading, 
  getCurrentUtilityRate, 
  calculateConsumptionTotal, 
  Billing,
  fetchUnits,
  Unit
} from "@/utils/consumptionUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Droplets, Banknote, Check, CreditCard, Info, Flame, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Resident {
  id: number;
  name: string;
  unit_id: number;
}

interface NewBillingFormProps {
  onClose: () => void;
  onSave?: () => void;
}

const ALL_UNITS_VALUE = "all-units";

const NewBillingForm = ({ onClose, onSave }: NewBillingFormProps) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [unit, setUnit] = useState("");
  const [unitId, setUnitId] = useState<number | null>(null);
  const [resident, setResident] = useState("");
  const [chargeType, setChargeType] = useState("fixed");
  const [fixedChargeType, setFixedChargeType] = useState("condo");
  const [extraChargeType, setExtraChargeType] = useState("renovation");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  
  const [includeGas, setIncludeGas] = useState(false);
  const [gasPrevious, setGasPrevious] = useState<number | "">("");
  const [gasCurrent, setGasCurrent] = useState<number | "">("");
  const [gasRate, setGasRate] = useState<number | "">("");
  const [gasTotal, setGasTotal] = useState<number>(0);
  const [isInitialGasReading, setIsInitialGasReading] = useState(true);
  
  const [includeWater, setIncludeWater] = useState(false);
  const [waterPrevious, setWaterPrevious] = useState<number | "">("");
  const [waterCurrent, setWaterCurrent] = useState<number | "">("");
  const [waterRate, setWaterRate] = useState<number | "">("");
  const [waterTotal, setWaterTotal] = useState<number>(0);
  const [isInitialWaterReading, setIsInitialWaterReading] = useState(true);

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    async function fetchUnitsAndResidents() {
      try {
        setIsLoadingUnits(true);
        console.log("Fetching units and residents...");
        
        const unitsData = await fetchUnits();
        console.log("Units data fetched:", unitsData);
        
        if (unitsData.length === 0) {
          console.log("No units found in the database. This could indicate an empty table or permissions issue.");
        }
        
        setUnits(unitsData);
        
        const { data: residentsData, error: residentsError } = await supabase
          .from('residents')
          .select('*');
        
        if (residentsError) {
          console.error('Error fetching residents:', residentsError);
          throw residentsError;
        }
        
        console.log("Residents data fetched:", residentsData);
        setResidents(residentsData || []);
      } catch (error) {
        console.error('Error fetching units and residents:', error);
        toast.error('Erro ao carregar unidades e moradores');
      } finally {
        setIsLoadingUnits(false);
      }
    }
    
    fetchUnitsAndResidents();
  }, []);

  useEffect(() => {
    if (typeof gasPrevious === 'number' && typeof gasCurrent === 'number' && typeof gasRate === 'number') {
      const { total } = calculateConsumptionTotal(gasPrevious, gasCurrent, gasRate);
      setGasTotal(total);
    } else {
      setGasTotal(0);
    }
  }, [gasPrevious, gasCurrent, gasRate]);

  useEffect(() => {
    if (typeof waterPrevious === 'number' && typeof waterCurrent === 'number' && typeof waterRate === 'number') {
      const { total } = calculateConsumptionTotal(waterPrevious, waterCurrent, waterRate);
      setWaterTotal(total);
    } else {
      setWaterTotal(0);
    }
  }, [waterPrevious, waterCurrent, waterRate]);

  useEffect(() => {
    let total = 0;
    
    if (typeof amount === 'number') {
      total += amount;
    }
    
    if (includeGas) {
      total += gasTotal;
    }
    
    if (includeWater) {
      total += waterTotal;
    }
    
    setTotalAmount(total);
  }, [amount, includeGas, gasTotal, includeWater, waterTotal]);

  useEffect(() => {
    async function fetchRates() {
      if (includeGas && gasRate === "") {
        const gasRateData = await getCurrentUtilityRate('gas');
        if (gasRateData) {
          setGasRate(gasRateData.rate_per_cubic_meter);
        }
      }
      
      if (includeWater && waterRate === "") {
        const waterRateData = await getCurrentUtilityRate('water');
        if (waterRateData) {
          setWaterRate(waterRateData.rate_per_cubic_meter);
        }
      }
    }
    
    fetchRates();
  }, [includeGas, includeWater, gasRate, waterRate]);

  useEffect(() => {
    async function fetchPreviousReadings() {
      if (!unitId) return;
      console.log("Fetching previous readings for unit ID:", unitId);
      
      if (includeGas) {
        const latestGasReading = await getLatestMeterReading(unitId, 'gas');
        console.log("Latest gas reading:", latestGasReading);
        if (latestGasReading) {
          setGasPrevious(latestGasReading.reading_value);
          setIsInitialGasReading(false);
        } else {
          setGasPrevious("");
          setIsInitialGasReading(true);
        }
      }
      
      if (includeWater) {
        const latestWaterReading = await getLatestMeterReading(unitId, 'water');
        console.log("Latest water reading:", latestWaterReading);
        if (latestWaterReading) {
          setWaterPrevious(latestWaterReading.reading_value);
          setIsInitialWaterReading(false);
        } else {
          setWaterPrevious("");
          setIsInitialWaterReading(true);
        }
      }
    }
    
    fetchPreviousReadings();
  }, [unitId, includeGas, includeWater]);

  useEffect(() => {
    // Desabilitar opções de consumo quando "Todas as unidades" estiver selecionado
    if (unit === ALL_UNITS_VALUE) {
      setChargeType('fixed');
      setIncludeGas(false);
      setIncludeWater(false);
    }
  }, [unit]);

  const handleUnitChange = (value: string) => {
    console.log("Unit selected:", value);
    setUnit(value);
    
    if (value === ALL_UNITS_VALUE) {
      setUnitId(null);
      setResident("Todos os moradores");
      return;
    }
    
    const unitId = parseInt(value);
    
    if (!isNaN(unitId)) {
      setUnitId(unitId);
      
      const selectedUnitObj = units.find(u => u.id === unitId);
      console.log("Selected unit object:", selectedUnitObj);
      
      if (selectedUnitObj) {
        console.log("Setting resident to owner:", selectedUnitObj.owner);
        setResident(selectedUnitObj.owner);
        
        const unitResident = residents.find(r => r.unit_id === selectedUnitObj.id);
        if (unitResident) {
          console.log("Found resident for unit:", unitResident);
          setResident(unitResident.name);
        }
      }
    } else {
      setUnitId(null);
      setResident("");
    }
  };

  const saveMeterReadings = async () => {
    if (!unitId) return;
    
    const readings = [];
    
    if (includeGas) {
      if (isInitialGasReading && typeof gasPrevious === 'number' && gasPrevious > 0) {
        readings.push({
          unit_id: unitId,
          utility_type: 'gas',
          reading_value: gasPrevious,
          reading_date: new Date().toISOString().split('T')[0]
        });
        console.log("Saving initial gas reading:", gasPrevious);
      }
      
      if (typeof gasCurrent === 'number' && gasCurrent > 0) {
        readings.push({
          unit_id: unitId,
          utility_type: 'gas',
          reading_value: gasCurrent,
          reading_date: new Date().toISOString().split('T')[0]
        });
        console.log("Saving current gas reading:", gasCurrent);
      }
    }
    
    if (includeWater) {
      if (isInitialWaterReading && typeof waterPrevious === 'number' && waterPrevious > 0) {
        readings.push({
          unit_id: unitId,
          utility_type: 'water',
          reading_value: waterPrevious,
          reading_date: new Date().toISOString().split('T')[0]
        });
        console.log("Saving initial water reading:", waterPrevious);
      }
      
      if (typeof waterCurrent === 'number' && waterCurrent > 0) {
        readings.push({
          unit_id: unitId,
          utility_type: 'water',
          reading_value: waterCurrent,
          reading_date: new Date().toISOString().split('T')[0]
        });
        console.log("Saving current water reading:", waterCurrent);
      }
    }
    
    if (readings.length > 0) {
      console.log("Saving meter readings:", readings);
      const { error } = await supabase
        .from('meter_readings')
        .insert(readings);
        
      if (error) {
        console.error('Error saving meter readings:', error);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    try {
      // Validação básica
      if (!description || !dueDate || totalAmount <= 0) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }
      
      if (unit === ALL_UNITS_VALUE) {
        // Mostrar diálogo de confirmação para cobranças em todas as unidades
        setShowConfirmDialog(true);
        return;
      }
      
      // Continuar com a lógica para uma única unidade
      await createBilling();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Erro ao processar formulário');
    }
  };
  
  // Função para criar cobranças para todas as unidades após confirmação
  const createBillingsForAllUnits = async () => {
    try {
      setIsLoading(true);
      
      // Validação para "Todas as unidades"
      if (!description || !dueDate || totalAmount <= 0) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        setIsLoading(false);
        return;
      }
      
      // Não permitir cobranças de consumo para todas as unidades
      if (chargeType === 'consumption') {
        toast.error('Cobranças de consumo não podem ser aplicadas a todas as unidades');
        setIsLoading(false);
        return;
      }
      
      // Criar uma cobrança para cada unidade
      const billings = units.map(unitObj => {
        const unitDisplay = `${unitObj.block}${unitObj.number}`;
        const unitResident = residents.find(r => r.unit_id === unitObj.id)?.name || unitObj.owner;
        
        return {
          unit: unitDisplay,
          unit_id: unitObj.id,
          resident: unitResident,
          description: description,
          amount: totalAmount,
          due_date: dueDate,
          status: "pending",
          is_printed: false,
          is_sent: false
        };
      });
      
      console.log(`Criando ${billings.length} cobranças para todas as unidades:`, billings);
      
      // Inserir todas as cobranças de uma vez
      const { error } = await supabase
        .from('billings')
        .insert(billings);
        
      if (error) {
        console.error('Erro ao salvar cobranças para todas as unidades:', error);
        throw error;
      } else {
        toast.success(`${billings.length} cobranças criadas com sucesso!`);
        if (onSave) onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving billings for all units:', error);
      toast.error('Erro ao salvar cobranças para todas as unidades');
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };
  
  // Função para criar cobrança para uma única unidade
  const createBilling = async () => {
    try {
      setIsLoading(true);
      
      // Validação para unidade única
      if (!unitId || !unit || !resident || !description || !dueDate || totalAmount <= 0) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        setIsLoading(false);
        return;
      }

      if (chargeType === 'consumption') {
        if (includeGas) {
          if (isInitialGasReading && (!gasPrevious || typeof gasPrevious === 'string' || gasPrevious <= 0)) {
            toast.error('Por favor, informe a leitura inicial de gás');
            setIsLoading(false);
            return;
          }
          
          if (!gasCurrent || typeof gasCurrent === 'string' || gasCurrent <= 0) {
            toast.error('Por favor, informe a leitura atual de gás');
            setIsLoading(false);
            return;
          }
          
          if (!isInitialGasReading && typeof gasPrevious === 'number' && typeof gasCurrent === 'number' && gasCurrent <= gasPrevious) {
            toast.error('A leitura atual de gás deve ser maior que a leitura anterior');
            setIsLoading(false);
            return;
          }
        }
        
        if (includeWater) {
          if (isInitialWaterReading && (!waterPrevious || typeof waterPrevious === 'string' || waterPrevious <= 0)) {
            toast.error('Por favor, informe a leitura inicial de água');
            setIsLoading(false);
            return;
          }
          
          if (!waterCurrent || typeof waterCurrent === 'string' || waterCurrent <= 0) {
            toast.error('Por favor, informe a leitura atual de água');
            setIsLoading(false);
            return;
          }
          
          if (!isInitialWaterReading && typeof waterPrevious === 'number' && typeof waterCurrent === 'number' && waterCurrent <= waterPrevious) {
            toast.error('A leitura atual de água deve ser maior que a leitura anterior');
            setIsLoading(false);
            return;
          }
        }
      }
      
      const readingsSaved = await saveMeterReadings();
      if (!readingsSaved) {
        toast.error('Erro ao salvar leituras de medidores');
        setIsLoading(false);
        return;
      }
      
      const selectedUnitObj = units.find(u => u.id === unitId);
      const unitDisplay = selectedUnitObj ? `${selectedUnitObj.block}${selectedUnitObj.number}` : unit;
      
      const newBilling: Omit<Billing, 'id'> = {
        unit: unitDisplay,
        unit_id: unitId,
        resident: resident,
        description: description,
        amount: totalAmount,
        due_date: dueDate,
        status: "pending",
        is_printed: false,
        is_sent: false
      };
      
      console.log("Creating new billing:", newBilling);
      const { error } = await supabase
        .from('billings')
        .insert([newBilling]);
        
      if (error) {
        console.error('Error saving billing:', error);
        throw error;
      } else {
        toast.success("Cobrança criada com sucesso!");
        if (onSave) onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving billing:', error);
      toast.error('Erro ao salvar cobrança');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unit">Unidade</Label>
            <Select 
              value={unit}
              onValueChange={handleUnitChange}
            >
              <SelectTrigger id="unit">
                <SelectValue placeholder={isLoadingUnits ? "Carregando unidades..." : "Selecione uma unidade"} />
              </SelectTrigger>
              <SelectContent>
                {units.length === 0 && !isLoadingUnits ? (
                  <SelectItem value="no-units" disabled>Nenhuma unidade encontrada</SelectItem>
                ) : (
                  <>
                    <SelectItem value={ALL_UNITS_VALUE}>Todas as unidades</SelectItem>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {`${unit.block}${unit.number}`}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resident">Morador</Label>
            <Input 
              id="resident" 
              placeholder="Nome do morador" 
              value={resident}
              onChange={(e) => setResident(e.target.value)}
              readOnly={unitId !== null}
              className={unitId !== null ? "bg-gray-50" : ""}
            />
          </div>
        </div>
        
        {/* Adicionar alerta informativo quando "Todas as unidades" estiver selecionado */}
        {unit === ALL_UNITS_VALUE && (
          <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Cobrança para todas as unidades</p>
                <p className="text-xs text-blue-600">
                  Esta opção criará uma cobrança com o mesmo valor para cada unidade do condomínio.
                  Ideal para taxas condominiais, fundos de reserva e outras cobranças fixas.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="charge-type">Tipo de Cobrança</Label>
          <Select 
            value={chargeType}
            onValueChange={setChargeType}
            disabled={unit === ALL_UNITS_VALUE}
          >
            <SelectTrigger id="charge-type">
              <SelectValue placeholder="Selecione o tipo de cobrança" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Taxa Fixa</SelectItem>
              <SelectItem value="consumption" disabled={unit === ALL_UNITS_VALUE}>Consumo</SelectItem>
              <SelectItem value="extra">Taxa Extra</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          {unit === ALL_UNITS_VALUE && chargeType === 'fixed' && (
            <p className="text-xs text-muted-foreground">
              Cobranças de consumo não estão disponíveis para todas as unidades.
            </p>
          )}
        </div>
        
        {chargeType === "fixed" && (
          <div className="space-y-2">
            <Label>Taxa Fixa</Label>
            <Select 
              value={fixedChargeType}
              onValueChange={(value) => setFixedChargeType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de taxa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="condo">Taxa Condominial</SelectItem>
                <SelectItem value="reserve">Fundo de Reserva</SelectItem>
                <SelectItem value="maintenance">Taxa de Manutenção</SelectItem>
                <SelectItem value="insurance">Seguro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {chargeType === "consumption" && (
          <>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="gas">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="include-gas" 
                      checked={includeGas} 
                      onCheckedChange={(checked) => setIncludeGas(!!checked)}
                    />
                    <Label htmlFor="include-gas" className="font-normal cursor-pointer">
                      Consumo de Gás
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-blue-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-left" side="right">
                          <div className="space-y-2 p-1 text-sm">
                            <p className="font-semibold">Como funciona o cálculo de consumo:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Na primeira cobrança, você informa a <strong>Leitura Inicial</strong> que servirá como referência.</li>
                              <li>Nas cobranças seguintes, o sistema carrega a última leitura como <strong>Leitura Anterior</strong>.</li>
                              <li>Você insere a <strong>Leitura Atual</strong> e o sistema calcula o consumo (Atual - Anterior).</li>
                              <li>A leitura atual é salva e servirá como Leitura Anterior na próxima cobrança.</li>
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {includeGas && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gas-previous">
                            {isInitialGasReading ? "Leitura Inicial de Gás (m³)" : "Leitura Anterior de Gás (m³)"}
                          </Label>
                          <div className="flex-1">
                            <Input
                              id="gas-previous"
                              type="number"
                              placeholder="Leitura anterior"
                              value={gasPrevious}
                              onChange={(e) => setGasPrevious(parseFloat(e.target.value) || "")}
                              readOnly={!isInitialGasReading}
                              className={!isInitialGasReading ? "bg-muted" : ""}
                            />
                            {isInitialGasReading ? (
                              <p className="text-xs text-muted-foreground mt-1">
                                Primeira leitura para esta unidade
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1">
                                Última leitura registrada
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="gas-current">Leitura Atual de Gás (m³)</Label>
                          <div className="flex-1">
                            <Input
                              id="gas-current"
                              type="number"
                              placeholder="Leitura atual"
                              value={gasCurrent}
                              onChange={(e) => setGasCurrent(parseFloat(e.target.value) || "")}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Leitura atual para calcular consumo
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gas-rate">Taxa por m³ (R$)</Label>
                          <Input 
                            id="gas-rate" 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            value={gasRate === "" ? "" : gasRate}
                            onChange={(e) => setGasRate(e.target.value === "" ? "" : parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gas-total">Total (R$)</Label>
                          <Input 
                            id="gas-total" 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            value={gasTotal.toFixed(2)}
                            readOnly 
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="water">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="include-water" 
                      checked={includeWater} 
                      onCheckedChange={(checked) => setIncludeWater(!!checked)}
                    />
                    <Label htmlFor="include-water" className="font-normal cursor-pointer">
                      Consumo de Água
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-blue-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-left" side="right">
                          <div className="space-y-2 p-1 text-sm">
                            <p className="font-semibold">Como funciona o cálculo de consumo:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Na primeira cobrança, você informa a <strong>Leitura Inicial</strong> que servirá como referência.</li>
                              <li>Nas cobranças seguintes, o sistema carrega a última leitura como <strong>Leitura Anterior</strong>.</li>
                              <li>Você insere a <strong>Leitura Atual</strong> e o sistema calcula o consumo (Atual - Anterior).</li>
                              <li>A leitura atual é salva e servirá como Leitura Anterior na próxima cobrança.</li>
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {includeWater && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="water-previous">
                            {isInitialWaterReading ? "Leitura Inicial de Água (m³)" : "Leitura Anterior de Água (m³)"}
                          </Label>
                          <div className="flex-1">
                            <Input
                              id="water-previous"
                              type="number"
                              placeholder="Leitura anterior"
                              value={waterPrevious}
                              onChange={(e) => setWaterPrevious(parseFloat(e.target.value) || "")}
                              readOnly={!isInitialWaterReading}
                              className={!isInitialWaterReading ? "bg-muted" : ""}
                            />
                            {isInitialWaterReading ? (
                              <p className="text-xs text-muted-foreground mt-1">
                                Primeira leitura para esta unidade
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1">
                                Última leitura registrada
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="water-current">Leitura Atual de Água (m³)</Label>
                          <div className="flex-1">
                            <Input
                              id="water-current"
                              type="number"
                              placeholder="Leitura atual"
                              value={waterCurrent}
                              onChange={(e) => setWaterCurrent(parseFloat(e.target.value) || "")}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Leitura atual para calcular consumo
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="water-rate">Taxa por m³ (R$)</Label>
                          <Input 
                            id="water-rate" 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            value={waterRate === "" ? "" : waterRate}
                            onChange={(e) => setWaterRate(e.target.value === "" ? "" : parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="water-total">Total (R$)</Label>
                          <Input 
                            id="water-total" 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            value={waterTotal.toFixed(2)}
                            readOnly 
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
        
        {chargeType === "extra" && (
          <div className="space-y-2">
            <Label>Taxa Extra</Label>
            <Select 
              value={extraChargeType}
              onValueChange={(value) => setExtraChargeType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de taxa extra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renovation">Reforma</SelectItem>
                <SelectItem value="holiday">Festas/Comemorações</SelectItem>
                <SelectItem value="special">Despesa Especial</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input 
            id="description" 
            placeholder="ex: Taxa Condominial - Janeiro/2024"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor Base (R$)</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              min="0" 
              placeholder="0,00"
              value={amount === "" ? "" : amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input 
              id="dueDate" 
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="pt-2 bg-slate-50 p-3 rounded-md mt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Valor Total:</span>
            <span className="text-lg font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
            </span>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Cobrança"}
          </Button>
        </div>
      </div>
      
      {/* Diálogo de confirmação para cobranças em todas as unidades */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar criação de múltiplas cobranças</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a criar uma cobrança de <strong>{formatCurrency(totalAmount)}</strong> para <strong>todas as {units.length} unidades</strong> do condomínio.
              <div className="mt-2 flex items-start bg-amber-50 p-3 rounded-md border border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Esta ação criará {units.length} cobranças separadas e não pode ser desfeita facilmente.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={createBillingsForAllUnits} disabled={isLoading}>
              {isLoading ? "Processando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Função auxiliar para formatação de moeda
const formatCurrency = (value: number | string | "") => {
  if (value === "" || typeof value === "string") return "R$ 0,00";
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default NewBillingForm;
