import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  CreditCard, 
  Download, 
  Filter, 
  MoreVertical, 
  Plus, 
  FileText, 
  Send,
  Printer,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";

type BillingStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

interface Billing {
  id: string;
  unit: string;
  resident: string;
  description: string;
  amount: number;
  dueDate: string;
  status: BillingStatus;
  isPrinted: boolean;
  isSent: boolean;
}

const statusClasses = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
};

const mockBillings: Billing[] = [
  {
    id: "COB-001",
    unit: "101A",
    resident: "João Silva",
    description: "Taxa Condominial - Janeiro/2024",
    amount: 450.00,
    dueDate: "2024-01-10",
    status: "paid",
    isPrinted: true,
    isSent: true
  },
  {
    id: "COB-002",
    unit: "102B",
    resident: "Maria Oliveira",
    description: "Taxa Condominial - Janeiro/2024",
    amount: 450.00,
    dueDate: "2024-01-10",
    status: "paid",
    isPrinted: true,
    isSent: true
  },
  {
    id: "COB-003",
    unit: "201A",
    resident: "Pedro Santos",
    description: "Taxa Condominial - Janeiro/2024",
    amount: 500.00,
    dueDate: "2024-01-10",
    status: "overdue",
    isPrinted: true,
    isSent: true
  },
  {
    id: "COB-004",
    unit: "202B",
    resident: "Ana Pereira",
    description: "Taxa Condominial - Janeiro/2024",
    amount: 500.00,
    dueDate: "2024-01-10",
    status: "pending",
    isPrinted: false,
    isSent: false
  },
  {
    id: "COB-005",
    unit: "301A",
    resident: "Carlos Mendes",
    description: "Taxa Condominial - Janeiro/2024",
    amount: 550.00,
    dueDate: "2024-01-10",
    status: "pending",
    isPrinted: false,
    isSent: false
  },
  {
    id: "COB-006",
    unit: "101A",
    resident: "João Silva",
    description: "Taxa Condominial - Fevereiro/2024",
    amount: 450.00,
    dueDate: "2024-02-10",
    status: "pending",
    isPrinted: false,
    isSent: false
  },
  {
    id: "COB-007",
    unit: "103C",
    resident: "Fernanda Lima",
    description: "Taxa Extra - Reforma Piscina",
    amount: 200.00,
    dueDate: "2024-01-15",
    status: "pending",
    isPrinted: false,
    isSent: false
  },
  {
    id: "COB-008",
    unit: "302C",
    resident: "Roberto Alves",
    description: "Taxa Condominial - Janeiro/2024",
    amount: 550.00,
    dueDate: "2024-01-10",
    status: "cancelled",
    isPrinted: true,
    isSent: false
  }
];

const BillingStatusBadge = ({ status }: { status: BillingStatus }) => {
  const displayText = {
    pending: "Pendente",
    paid: "Pago",
    overdue: "Atrasado",
    cancelled: "Cancelado"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
      {displayText[status]}
    </span>
  );
};

const NewBillingForm = ({ onClose }: { onClose: () => void }) => {
  const [chargeType, setChargeType] = useState("fixed");
  const [includeGas, setIncludeGas] = useState(false);
  const [includeWater, setIncludeWater] = useState(false);
  
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade</Label>
          <Input id="unit" placeholder="ex: 101A" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resident">Morador</Label>
          <Input id="resident" placeholder="Nome do morador" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="charge-type">Tipo de Cobrança</Label>
        <Select 
          defaultValue={chargeType}
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
          <Select defaultValue="condo">
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
                      <Label htmlFor="gas-previous">Leitura Anterior</Label>
                      <Input id="gas-previous" type="number" min="0" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gas-current">Leitura Atual</Label>
                      <Input id="gas-current" type="number" min="0" step="0.01" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gas-rate">Taxa por m³ (R$)</Label>
                      <Input id="gas-rate" type="number" min="0" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gas-total">Total (R$)</Label>
                      <Input id="gas-total" type="number" min="0" step="0.01" readOnly />
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
                      <Label htmlFor="water-previous">Leitura Anterior</Label>
                      <Input id="water-previous" type="number" min="0" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="water-current">Leitura Atual</Label>
                      <Input id="water-current" type="number" min="0" step="0.01" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="water-rate">Taxa por m³ (R$)</Label>
                      <Input id="water-rate" type="number" min="0" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="water-total">Total (R$)</Label>
                      <Input id="water-total" type="number" min="0" step="0.01" readOnly />
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
          <Select defaultValue="renovation">
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
        <Input id="description" placeholder="ex: Taxa Condominial - Janeiro/2024" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input id="amount" type="number" step="0.01" min="0" placeholder="0,00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Data de Vencimento</Label>
          <Input id="dueDate" type="date" />
        </div>
      </div>
      
      <div className="pt-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={onClose}>Salvar Cobrança</Button>
      </div>
    </div>
  );
};

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

const Billing = () => {
  const [isNewBillingOpen, setIsNewBillingOpen] = useState(false);
  const [tabValue, setTabValue] = useState("all");
  const [billings, setBillings] = useState<Billing[]>(mockBillings);

  const filteredBillings = billings.filter(billing => {
    if (tabValue === "all") return true;
    if (tabValue === "pending") return billing.status === "pending";
    if (tabValue === "paid") return billing.status === "paid";
    if (tabValue === "overdue") return billing.status === "overdue";
    return true;
  });

  const markAsPaid = (id: string) => {
    setBillings(prevBillings => 
      prevBillings.map(billing => 
        billing.id === id ? { ...billing, status: "paid" } : billing
      )
    );
  };

  const markAsSent = (id: string) => {
    setBillings(prevBillings => 
      prevBillings.map(billing => 
        billing.id === id ? { ...billing, isSent: true } : billing
      )
    );
  };

  const markAsPrinted = (id: string) => {
    setBillings(prevBillings => 
      prevBillings.map(billing => 
        billing.id === id ? { ...billing, isPrinted: true } : billing
      )
    );
  };

  const cancelBilling = (id: string) => {
    setBillings(prevBillings => 
      prevBillings.map(billing => 
        billing.id === id ? { ...billing, status: "cancelled" } : billing
      )
    );
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
    <div className="container max-w-7xl mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">Cobranças</h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-200">
          Gerencie as cobranças do condomínio e acompanhe os pagamentos.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Dialog open={isNewBillingOpen} onOpenChange={setIsNewBillingOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Nova Cobrança
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Cobrança</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para criar uma nova cobrança.
              </DialogDescription>
            </DialogHeader>
            <NewBillingForm onClose={() => setIsNewBillingOpen(false)} />
          </DialogContent>
        </Dialog>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Escolha o formato</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              <span>Exportar como PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              <span>Exportar como Excel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <BillingFilters />
        </div>
        
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-0">
              <Tabs value={tabValue} onValueChange={setTabValue}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="paid">Pagas</TabsTrigger>
                  <TabsTrigger value="overdue">Atrasadas</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Morador</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBillings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          Nenhuma cobrança encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBillings.map((billing) => (
                        <TableRow key={billing.id}>
                          <TableCell>{billing.id}</TableCell>
                          <TableCell>{billing.unit}</TableCell>
                          <TableCell>{billing.resident}</TableCell>
                          <TableCell>{billing.description}</TableCell>
                          <TableCell>{formatCurrency(billing.amount)}</TableCell>
                          <TableCell>{formatDate(billing.dueDate)}</TableCell>
                          <TableCell>
                            <BillingStatusBadge status={billing.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => {}}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Visualizar</span>
                                </DropdownMenuItem>
                                
                                {billing.status !== "paid" && billing.status !== "cancelled" && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => markAsPaid(billing.id)}
                                  >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    <span>Marcar como Pago</span>
                                  </DropdownMenuItem>
                                )}
                                
                                {!billing.isSent && billing.status !== "cancelled" && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => markAsSent(billing.id)}
                                  >
                                    <Send className="mr-2 h-4 w-4" />
                                    <span>Marcar como Enviado</span>
                                  </DropdownMenuItem>
                                )}
                                
                                {!billing.isPrinted && billing.status !== "cancelled" && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => markAsPrinted(billing.id)}
                                  >
                                    <Printer className="mr-2 h-4 w-4" />
                                    <span>Marcar como Impresso</span>
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem className="cursor-pointer">
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                
                                {billing.status !== "cancelled" && (
                                  <DropdownMenuSeparator />
                                )}
                                
                                {billing.status !== "cancelled" && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-destructive"
                                    onClick={() => cancelBilling(billing.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Cancelar Cobrança</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;
