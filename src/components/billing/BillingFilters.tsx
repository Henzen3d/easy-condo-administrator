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
  // Estado para cada filtro
  const [status, setStatus] = useState("all");
  const [unit, setUnit] = useState("");
  const [unitId, setUnitId] = useState("all");
  const [resident, setResident] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Estado para as unidades cadastradas
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);

  // Carregar unidades ao montar o componente
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

  // Função para aplicar os filtros
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

  // Função para resetar os filtros
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
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>Filtre as cobranças por diferentes critérios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="statusFilter">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="statusFilter">
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
            <SelectTrigger id="unitFilter">
              <SelectValue placeholder={isLoadingUnits ? "Carregando unidades..." : "Todas as unidades"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as unidades</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id.toString()}>
                  {`${unit.block}${unit.number}`} - {unit.owner}
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
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal truncate px-2",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
                  {startDate ? format(startDate, "dd/MM/yy") : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={setStartDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal truncate px-2",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
                  {endDate ? format(endDate, "dd/MM/yy") : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={setEndDate}
                  initialFocus
                  locale={ptBR}
                  fromDate={startDate || undefined}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full" onClick={handleApplyFilters}>
          Aplicar Filtros
        </Button>
        <Button variant="outline" className="w-full" onClick={handleResetFilters}>
          Limpar Filtros
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BillingFilters;
