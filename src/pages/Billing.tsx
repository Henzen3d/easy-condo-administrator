
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  CreditCard, 
  Download, 
  MoreVertical, 
  Plus, 
  FileText, 
  Send,
  Printer,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import NewBillingForm from "@/components/billing/NewBillingForm";
import BillingFilters from "@/components/billing/BillingFilters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
// Use type-only import to avoid naming conflicts
import type { Billing } from "@/utils/consumptionUtils";

type BillingStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

// Create a display interface that maps database fields to display-friendly names
interface BillingDisplay {
  id: string;
  unit: string;
  unit_id?: number | null;
  resident: string;
  description: string;
  amount: number;
  dueDate: string; // Frontend property mapping to due_date
  status: BillingStatus;
  is_printed: boolean; // Use database naming convention
  is_sent: boolean; // Use database naming convention
  created_at?: string | null;
  updated_at?: string | null;
}

const statusClasses = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
};

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

const Billing = () => {
  const [isNewBillingOpen, setIsNewBillingOpen] = useState(false);
  const [tabValue, setTabValue] = useState("all");
  const [billings, setBillings] = useState<BillingDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBillings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('billings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching billings:', error);
        toast.error('Erro ao carregar cobranças');
        setBillings(mockBillings.map(transformToDisplayFormat));
      } else if (data) {
        // Transform database records to display format
        const formattedBillings: BillingDisplay[] = data.map(item => {
          // Ensure the status is one of the allowed types
          const status = validateStatus(item.status);
          
          return {
            ...item,
            dueDate: item.due_date,
            status: status,
          };
        });
        
        setBillings(formattedBillings);
      }
    } catch (error) {
      console.error('Error fetching billings:', error);
      toast.error('Erro ao carregar cobranças');
      setBillings(mockBillings.map(transformToDisplayFormat));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to validate billing status
  const validateStatus = (status: string): BillingStatus => {
    if (status === 'pending' || status === 'paid' || status === 'overdue' || status === 'cancelled') {
      return status;
    }
    return 'pending'; // Default fallback
  };
  
  // Helper function to transform Billing to BillingDisplay
  const transformToDisplayFormat = (billing: Billing): BillingDisplay => {
    return {
      ...billing,
      dueDate: billing.due_date,
      status: validateStatus(billing.status)
    };
  };

  useEffect(() => {
    fetchBillings();
  }, []);

  const filteredBillings = billings.filter(billing => {
    if (tabValue === "all") return true;
    if (tabValue === "pending") return billing.status === "pending";
    if (tabValue === "paid") return billing.status === "paid";
    if (tabValue === "overdue") return billing.status === "overdue";
    return true;
  });

  const markAsPaid = async (id: string) => {
    try {
      const { error } = await supabase
        .from('billings')
        .update({ status: 'paid' })
        .eq('id', id);
      
      if (error) {
        throw error;
      } else {
        setBillings(prevBillings => 
          prevBillings.map(billing => 
            billing.id === id ? { ...billing, status: "paid" } : billing
          )
        );
        toast.success('Cobrança marcada como paga');
      }
    } catch (error) {
      console.error('Error updating billing status:', error);
      toast.error('Erro ao atualizar status da cobrança');
    }
  };

  const markAsSent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('billings')
        .update({ is_sent: true })
        .eq('id', id);
      
      if (error) {
        throw error;
      } else {
        setBillings(prevBillings => 
          prevBillings.map(billing => 
            billing.id === id ? { ...billing, is_sent: true } : billing
          )
        );
        toast.success('Cobrança marcada como enviada');
      }
    } catch (error) {
      console.error('Error updating billing sent status:', error);
      toast.error('Erro ao atualizar status de envio da cobrança');
    }
  };

  const markAsPrinted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('billings')
        .update({ is_printed: true })
        .eq('id', id);
      
      if (error) {
        throw error;
      } else {
        setBillings(prevBillings => 
          prevBillings.map(billing => 
            billing.id === id ? { ...billing, is_printed: true } : billing
          )
        );
        toast.success('Cobrança marcada como impressa');
      }
    } catch (error) {
      console.error('Error updating billing printed status:', error);
      toast.error('Erro ao atualizar status de impressão da cobrança');
    }
  };

  const cancelBilling = async (id: string) => {
    try {
      const { error } = await supabase
        .from('billings')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) {
        throw error;
      } else {
        setBillings(prevBillings => 
          prevBillings.map(billing => 
            billing.id === id ? { ...billing, status: "cancelled" } : billing
          )
        );
        toast.success('Cobrança cancelada');
      }
    } catch (error) {
      console.error('Error cancelling billing:', error);
      toast.error('Erro ao cancelar cobrança');
    }
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

  // Mock data using the correct Billing interface structure
  const mockBillings: Billing[] = [
    {
      id: "COB-001",
      unit: "101A",
      resident: "João Silva",
      description: "Taxa Condominial - Janeiro/2024",
      amount: 450.00,
      due_date: "2024-01-10",
      status: "paid",
      is_printed: true,
      is_sent: true
    },
    {
      id: "COB-002",
      unit: "102B",
      resident: "Maria Oliveira",
      description: "Taxa Condominial - Janeiro/2024",
      amount: 450.00,
      due_date: "2024-01-10",
      status: "paid",
      is_printed: true,
      is_sent: true
    },
    {
      id: "COB-003",
      unit: "201A",
      resident: "Pedro Santos",
      description: "Taxa Condominial - Janeiro/2024",
      amount: 500.00,
      due_date: "2024-01-10",
      status: "overdue",
      is_printed: true,
      is_sent: true
    },
    {
      id: "COB-004",
      unit: "202B",
      resident: "Ana Pereira",
      description: "Taxa Condominial - Janeiro/2024",
      amount: 500.00,
      due_date: "2024-01-10",
      status: "pending",
      is_printed: false,
      is_sent: false
    },
    {
      id: "COB-005",
      unit: "301A",
      resident: "Carlos Mendes",
      description: "Taxa Condominial - Janeiro/2024",
      amount: 550.00,
      due_date: "2024-01-10",
      status: "pending",
      is_printed: false,
      is_sent: false
    },
    {
      id: "COB-006",
      unit: "101A",
      resident: "João Silva",
      description: "Taxa Condominial - Fevereiro/2024",
      amount: 450.00,
      due_date: "2024-02-10",
      status: "pending",
      is_printed: false,
      is_sent: false
    },
    {
      id: "COB-007",
      unit: "103C",
      resident: "Fernanda Lima",
      description: "Taxa Extra - Reforma Piscina",
      amount: 200.00,
      due_date: "2024-01-15",
      status: "pending",
      is_printed: false,
      is_sent: false
    },
    {
      id: "COB-008",
      unit: "302C",
      resident: "Roberto Alves",
      description: "Taxa Condominial - Janeiro/2024",
      amount: 550.00,
      due_date: "2024-01-10",
      status: "cancelled",
      is_printed: true,
      is_sent: false
    }
  ];

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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Cobrança</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para criar uma nova cobrança.
              </DialogDescription>
            </DialogHeader>
            <NewBillingForm 
              onClose={() => setIsNewBillingOpen(false)} 
              onSave={fetchBillings}
            />
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          Carregando cobranças...
                        </TableCell>
                      </TableRow>
                    ) : filteredBillings.length === 0 ? (
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
                                
                                {!billing.is_sent && billing.status !== "cancelled" && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => markAsSent(billing.id)}
                                  >
                                    <Send className="mr-2 h-4 w-4" />
                                    <span>Marcar como Enviado</span>
                                  </DropdownMenuItem>
                                )}
                                
                                {!billing.is_printed && billing.status !== "cancelled" && (
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
