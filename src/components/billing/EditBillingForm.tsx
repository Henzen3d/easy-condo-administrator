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

interface EditBillingFormProps {
  billing: {
    id: string;
    unit: string;
    unit_id?: number | null;
    resident: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
    is_printed: boolean;
    is_sent: boolean;
  };
  onClose: () => void;
  onSave?: () => void;
}

const EditBillingForm = ({ billing, onClose, onSave }: EditBillingFormProps) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [unit, setUnit] = useState(billing.unit_id?.toString() || "");
  const [unitId, setUnitId] = useState<number | null>(billing.unit_id || null);
  const [resident, setResident] = useState(billing.resident || "");
  const [chargeType, setChargeType] = useState("custom"); // Presumindo que na edição seja "custom" por padrão
  const [description, setDescription] = useState(billing.description || "");
  const [amount, setAmount] = useState<number | "">(billing.amount || "");
  const [dueDate, setDueDate] = useState(billing.dueDate || "");
  const [status, setStatus] = useState(billing.status || "pending");
  
  const [totalAmount, setTotalAmount] = useState<number>(billing.amount || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);

  useEffect(() => {
    async function fetchUnitsAndResidents() {
      try {
        setIsLoadingUnits(true);
        
        // Fetch units data
        const unitsData = await fetchUnits();
        setUnits(unitsData);
        
        // Fetch residents data
        const { data: residentsData, error: residentsError } = await supabase
          .from('residents')
          .select('*');
        
        if (residentsError) {
          console.error('Error fetching residents:', residentsError);
          throw residentsError;
        }
        
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
    setTotalAmount(typeof amount === 'number' ? amount : 0);
  }, [amount]);

  const handleUnitChange = (value: string) => {
    setUnit(value);
    
    const unitId = parseInt(value);
    
    if (!isNaN(unitId)) {
      setUnitId(unitId);
      
      const selectedUnitObj = units.find(u => u.id === unitId);
      
      if (selectedUnitObj) {
        // Auto-fill the resident field with the unit owner
        setResident(selectedUnitObj.owner);
        
        // Check if there is a resident assigned to this unit
        const unitResident = residents.find(r => r.unit_id === selectedUnitObj.id);
        if (unitResident) {
          setResident(unitResident.name);
        }
      }
    } else {
      setUnitId(null);
      setResident("");
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      if (!description || !dueDate || totalAmount <= 0) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        setIsLoading(false);
        return;
      }
      
      // Se a unidade foi alterada, atualiza também o display da unidade
      let unitDisplay = billing.unit;
      if (unitId !== billing.unit_id) {
        const selectedUnitObj = units.find(u => u.id === unitId);
        unitDisplay = selectedUnitObj ? `${selectedUnitObj.block}${selectedUnitObj.number}` : unit;
      }
      
      const updatedBilling: Partial<Billing> = {
        unit: unitDisplay,
        unit_id: unitId,
        resident: resident,
        description: description,
        amount: totalAmount,
        due_date: dueDate,
        status: status as "pending" | "paid" | "overdue" | "cancelled",
      };
      
      console.log("Updating billing:", updatedBilling);
      const { error } = await supabase
        .from('billings')
        .update(updatedBilling)
        .eq('id', billing.id);
        
      if (error) {
        console.error('Error updating billing:', error);
        throw error;
      } else {
        toast.success("Cobrança atualizada com sucesso!");
        if (onSave) onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error updating billing:', error);
      toast.error('Erro ao atualizar cobrança');
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
          />
        </div>
      </div>
      
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
          <Label htmlFor="amount">Valor (R$)</Label>
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

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={status}
          onValueChange={setStatus}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="overdue">Atrasado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
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
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
};

export default EditBillingForm; 