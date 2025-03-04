
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

interface Resident {
  id: number;
  name: string;
  unit_id: number;
}

interface NewBillingFormProps {
  onClose: () => void;
  onSave?: () => void;
}

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

  useEffect(() => {
    async function fetchUnitsAndResidents() {
      try {
        setIsLoadingUnits(true);
        console.log("Fetching units and residents...");
        
        // Fetch units data
        const unitsData = await fetchUnits();
        console.log("Units data fetched:", unitsData);
        
        if (unitsData.length === 0) {
          // Log a more specific message if no units were found
          console.log("No units found in the database. This could indicate an empty table or permissions issue.");
        }
        
        setUnits(unitsData);
        
        // Fetch residents data
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

  const handleUnitChange = (value: string) => {
    console.log("Unit selected:", value);
    setUnit(value);
    
    const unitId = parseInt(value);
    
    if (!isNaN(unitId)) {
      setUnitId(unitId);
      
      const selectedUnitObj = units.find(u => u.id === unitId);
      console.log("Selected unit object:", selectedUnitObj);
      
      if (selectedUnitObj) {
        // Auto-fill the resident field with the unit owner
        console.log("Setting resident to owner:", selectedUnitObj.owner);
        setResident(selectedUnitObj.owner);
        
        // Check if there is a resident assigned to this unit
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
    
    if (includeGas && typeof gasCurrent === 'number' && gasCurrent > 0) {
      readings.push({
        unit_id: unitId,
        utility_type: 'gas',
        reading_value: gasCurrent,
        reading_date: new Date().toISOString().split('T')[0]
      });
    }
    
    if (includeWater && typeof waterCurrent === 'number' && waterCurrent > 0) {
      readings.push({
        unit_id: unitId,
        utility_type: 'water',
        reading_value: waterCurrent,
        reading_date: new Date().toISOString().split('T')[0]
      });
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
      setIsLoading(true);
      
      if (!unitId || !unit || !resident || !description || !dueDate || totalAmount <= 0) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        setIsLoading(false);
        return;
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
                units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {`${unit.block}${unit.number}`}
                  </SelectItem>
                ))
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
      
      <div className="space-y-2">
        <Label htmlFor="charge-type">Tipo de Cobrança</Label>
        <Select 
          value={chargeType}
          onValueChange={(value) => setChargeType(value)}
        >
          <SelectTrigger id="charge-type">
            <SelectValue placeholder="Selecione o tipo de cobrança" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Taxa Fixa</SelectItem>
            <SelectItem value="consumption">Consumo</SelectItem>
            <SelectItem value="extra">Taxa Extra</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
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
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {includeGas && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gas-previous">
                        {isInitialGasReading ? 'Leitura Inicial' : 'Leitura Anterior'}
                      </Label>
                      <Input 
                        id="gas-previous" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={gasPrevious === "" ? "" : gasPrevious}
                        onChange={(e) => setGasPrevious(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gas-current">Leitura Atual</Label>
                      <Input 
                        id="gas-current" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={gasCurrent === "" ? "" : gasCurrent}
                        onChange={(e) => setGasCurrent(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      />
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
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {includeWater && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="water-previous">
                        {isInitialWaterReading ? 'Leitura Inicial' : 'Leitura Anterior'}
                      </Label>
                      <Input 
                        id="water-previous" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={waterPrevious === "" ? "" : waterPrevious}
                        onChange={(e) => setWaterPrevious(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="water-current">Leitura Atual</Label>
                      <Input 
                        id="water-current" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={waterCurrent === "" ? "" : waterCurrent}
                        onChange={(e) => setWaterCurrent(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      />
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
  );
};

export default NewBillingForm;
