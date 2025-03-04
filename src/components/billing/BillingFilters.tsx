
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const BillingFilters = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>Filtre as cobranças por diferentes critérios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="statusFilter">Status</Label>
          <select 
            id="statusFilter" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagos</option>
            <option value="overdue">Atrasados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unitFilter">Unidade</Label>
          <Input id="unitFilter" placeholder="ex: 101A" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="residentFilter">Morador</Label>
          <Input id="residentFilter" placeholder="Nome do morador" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial</Label>
            <Input id="startDate" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Final</Label>
            <Input id="endDate" type="date" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Aplicar Filtros</Button>
      </CardFooter>
    </Card>
  );
};

export default BillingFilters;
