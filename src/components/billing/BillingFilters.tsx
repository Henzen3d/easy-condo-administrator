import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchUnits, Unit } from "@/utils/consumptionUtils";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
}

const DatePicker = ({ id, selected, onChange, className }: DatePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected || undefined}
          onSelect={onChange}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export interface BillingFiltersProps {
  onApplyFilters: (filters: {
    status: string;
    unit: string;
    unit_id: string;
    resident: string;
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
}

const BillingFilters = ({ onApplyFilters }: BillingFiltersProps) => {
  const [status, setStatus] = useState("all");
  const [unit, setUnit] = useState("");
  const [unitId, setUnitId] = useState("all");
  const [resident, setResident] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);

  useEffect(() => {
    async function loadUnits() {
      setIsLoadingUnits(true);
      try {
        const unitsData = await fetchUnits();
        setUnits(unitsData);
      } catch (error) {
        console.error("Erro ao carregar unidades:", error);
      } finally {
        setIsLoadingUnits(false);
      }
    }

    loadUnits();
  }, []);

  const handleApplyFilters = () => {
    onApplyFilters({
      status,
      unit,
      unit_id: unitId,
      resident,
      startDate,
      endDate
    });
  };

  const handleResetFilters = () => {
    setStatus("all");
    setUnit("");
    setUnitId("all");
    setResident("");
    setStartDate(null);
    setEndDate(null);
    
    onApplyFilters({
      status: "all",
      unit: "",
      unit_id: "all",
      resident: "",
      startDate: null,
      endDate: null
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle>Filtros</CardTitle>
        <CardDescription>Filtre as cobranças por diferentes critérios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="statusFilter">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="statusFilter" className="w-full">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="overdue">Atrasados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitFilter">Unidade</Label>
            <Select 
              value={unitId} 
              onValueChange={(value) => {
                setUnitId(value);
                const selectedUnit = units.find(u => u.id.toString() === value);
                if (selectedUnit) {
                  setUnit(`${selectedUnit.block}${selectedUnit.number}`);
                } else {
                  setUnit("");
                }
              }}
            >
              <SelectTrigger id="unitFilter" className="w-full">
                <SelectValue 
                  placeholder={isLoadingUnits ? "Carregando unidades..." : "Todas as unidades"} 
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as unidades</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.block}{unit.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="residentFilter">Morador</Label>
            <Input
              id="residentFilter"
              placeholder="Nome do morador"
              value={resident}
              onChange={(e) => setResident(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Período</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={setStartDate}
                className="w-full"
              />
              <DatePicker
                id="endDate"
                selected={endDate}
                onChange={setEndDate}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleResetFilters}>
          Limpar
        </Button>
        <Button onClick={handleApplyFilters}>
          Aplicar Filtros
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BillingFilters;
