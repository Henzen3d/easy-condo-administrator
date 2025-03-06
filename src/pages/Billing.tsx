import { useState, useEffect, useCallback } from "react";
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
  DialogFooter,
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
  Trash2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import NewBillingForm from "@/components/billing/NewBillingForm";
import EditBillingForm from "@/components/billing/EditBillingForm";
import BillingFilters from "@/components/billing/BillingFilters";
import { supabase } from "@/integrations/supabase/client";
// Use type-only import to avoid naming conflicts
import type { Billing } from "@/utils/consumptionUtils";
import { 
  updateBillingStatus, 
  updateBillingFlag, 
  getBillingById 
} from "@/utils/consumptionUtils";

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
  const [filteredBillings, setFilteredBillings] = useState<BillingDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBilling, setSelectedBilling] = useState<BillingDisplay | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'pay' | 'send' | 'print' | 'cancel';
    id: string;
    title: string;
    description: string;
    actionText: string;
  } | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    status: string;
    unit: string;
    unit_id: string;
    resident: string;
    startDate: Date | null;
    endDate: Date | null;
  }>({
    status: "all",
    unit: "",
    unit_id: "all",
    resident: "",
    startDate: null,
    endDate: null
  });

  // Memoize fetchBillings to prevent re-renders causing multiple fetches
  const fetchBillings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('billings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching billings:', error);
        toast.error('Erro ao carregar cobranças');
        // Don't use mock data in production - just show an empty state
        setBillings([]);
        return;
      } 
      
      if (data) {
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
        applyFilters(formattedBillings, activeFilters, tabValue);
      } else {
        setBillings([]);
        setFilteredBillings([]);
      }
    } catch (error) {
      console.error('Error fetching billings:', error);
      toast.error('Erro ao carregar cobranças');
      setBillings([]);
      setFilteredBillings([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, tabValue]);
  
  // Helper function to validate billing status
  const validateStatus = (status: string): BillingStatus => {
    if (status === 'pending' || status === 'paid' || status === 'overdue' || status === 'cancelled') {
      return status;
    }
    return 'pending'; // Default fallback
  };

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  // Aplicar filtros na lista de cobranças
  const applyFilters = (
    allBillings: BillingDisplay[], 
    filters: {
      status: string;
      unit: string; 
      unit_id: string;
      resident: string;
      startDate: Date | null;
      endDate: Date | null;
    },
    currentTab: string
  ) => {
    let result = [...allBillings];
    
    // Filtrar por tab
    if (currentTab !== "all") {
      result = result.filter(billing => billing.status === currentTab);
    }
    
    // Filtro por status (se não estiver usando tabs ou se o status escolhido for diferente do tab)
    if (filters.status !== "all" && (currentTab === "all" || filters.status !== currentTab)) {
      result = result.filter(billing => billing.status === filters.status);
    }
    
    // Filtro por unit_id
    if (filters.unit_id && filters.unit_id !== "all") {
      result = result.filter(billing => 
        billing.unit_id?.toString() === filters.unit_id
      );
    }
    
    // Filtro por residente
    if (filters.resident) {
      const residentLower = filters.resident.toLowerCase();
      result = result.filter(billing => 
        billing.resident.toLowerCase().includes(residentLower)
      );
    }
    
    // Filtro por data inicial
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(billing => {
        const dueDate = new Date(billing.dueDate);
        return dueDate >= startDate;
      });
    }
    
    // Filtro por data final
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(billing => {
        const dueDate = new Date(billing.dueDate);
        return dueDate <= endDate;
      });
    }
    
    setFilteredBillings(result);
  };

  // Handler para quando as tabs mudam
  const handleTabChange = (value: string) => {
    setTabValue(value);
    applyFilters(billings, activeFilters, value);
  };

  // Handler para aplicar filtros
  const handleApplyFilters = (filters: {
    status: string;
    unit: string;
    unit_id: string;
    resident: string;
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    setActiveFilters(filters);
    applyFilters(billings, filters, tabValue);
  };

  // Improved action handlers with confirmation dialogs
  const showConfirmAction = (
    type: 'pay' | 'send' | 'print' | 'cancel', 
    id: string, 
    title: string, 
    description: string,
    actionText: string
  ) => {
    setConfirmAction({ type, id, title, description, actionText });
    setIsConfirmDialogOpen(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    
    setIsActionInProgress(true);
    let success = false;
    
    try {
      switch (confirmAction.type) {
        case 'pay':
          success = await updateBillingStatus(confirmAction.id, 'paid');
          if (success) {
            setBillings(prev => 
              prev.map(billing => 
                billing.id === confirmAction.id ? { ...billing, status: "paid" } : billing
              )
            );
            toast.success('Cobrança marcada como paga');
          }
          break;
          
        case 'send':
          success = await updateBillingFlag(confirmAction.id, 'is_sent', true);
          if (success) {
            setBillings(prev => 
              prev.map(billing => 
                billing.id === confirmAction.id ? { ...billing, is_sent: true } : billing
              )
            );
            toast.success('Cobrança marcada como enviada');
          }
          break;
          
        case 'print':
          success = await updateBillingFlag(confirmAction.id, 'is_printed', true);
          if (success) {
            setBillings(prev => 
              prev.map(billing => 
                billing.id === confirmAction.id ? { ...billing, is_printed: true } : billing
              )
            );
            toast.success('Cobrança marcada como impressa');
          }
          break;
          
        case 'cancel':
          success = await updateBillingStatus(confirmAction.id, 'cancelled');
          if (success) {
            setBillings(prev => 
              prev.map(billing => 
                billing.id === confirmAction.id ? { ...billing, status: "cancelled" } : billing
              )
            );
            toast.success('Cobrança cancelada');
          }
          break;
      }
      
      if (!success) {
        toast.error(`Erro ao executar ação: ${confirmAction.title}`);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      toast.error(`Erro ao executar ação: ${confirmAction.title}`);
    } finally {
      setIsActionInProgress(false);
      setIsConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  const viewBilling = async (id: string) => {
    try {
      const billing = billings.find(b => b.id === id);
      if (billing) {
        setSelectedBilling(billing);
        setIsViewDialogOpen(true);
      } else {
        // Try to fetch it from the database if not in local state
        const fetchedBilling = await getBillingById(id);
        if (fetchedBilling) {
          setSelectedBilling({
            ...fetchedBilling,
            dueDate: fetchedBilling.due_date,
            status: validateStatus(fetchedBilling.status)
          });
          setIsViewDialogOpen(true);
        } else {
          toast.error('Cobrança não encontrada');
        }
      }
    } catch (error) {
      console.error('Error viewing billing:', error);
      toast.error('Erro ao visualizar cobrança');
    }
  };

  const editBilling = async (id: string) => {
    try {
      const billing = billings.find(b => b.id === id);
      if (billing) {
        setSelectedBilling(billing);
        setIsEditDialogOpen(true);
      } else {
        // Try to fetch it from the database if not in local state
        const fetchedBilling = await getBillingById(id);
        if (fetchedBilling) {
          setSelectedBilling({
            ...fetchedBilling,
            dueDate: fetchedBilling.due_date,
            status: validateStatus(fetchedBilling.status)
          });
          setIsEditDialogOpen(true);
        } else {
          toast.error('Cobrança não encontrada');
        }
      }
    } catch (error) {
      console.error('Error editing billing:', error);
      toast.error('Erro ao editar cobrança');
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
          <BillingFilters onApplyFilters={handleApplyFilters} />
        </div>
        
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-0">
              <Tabs value={tabValue} onValueChange={handleTabChange}>
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
                                  onClick={() => viewBilling(billing.id)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Visualizar</span>
                                </DropdownMenuItem>
                                
                                {billing.status !== "paid" && billing.status !== "cancelled" && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => showConfirmAction(
                                      'pay',
                                      billing.id, 
                                      'Marcar como Pago', 
                                      'Tem certeza que deseja marcar esta cobrança como paga?',
                                      'Marcar como Pago'
                                    )}
                                  >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    <span>Marcar como Pago</span>
                                  </DropdownMenuItem>
                                )}
                                
                                {!billing.is_sent && billing.status !== "cancelled" && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => showConfirmAction(
                                      'send',
                                      billing.id, 
                                      'Marcar como Enviado', 
                                      'Tem certeza que deseja marcar esta cobrança como enviada?',
                                      'Marcar como Enviado'
                                    )}
                                  >
                                    <Send className="mr-2 h-4 w-4" />
                                    <span>Marcar como Enviado</span>
                                  </DropdownMenuItem>
                                )}
                                
                                {!billing.is_printed && billing.status !== "cancelled" && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => showConfirmAction(
                                      'print',
                                      billing.id, 
                                      'Marcar como Impresso', 
                                      'Tem certeza que deseja marcar esta cobrança como impressa?',
                                      'Marcar como Impresso'
                                    )}
                                  >
                                    <Printer className="mr-2 h-4 w-4" />
                                    <span>Marcar como Impresso</span>
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => editBilling(billing.id)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                
                                {billing.status !== "cancelled" && (
                                  <DropdownMenuSeparator />
                                )}
                                
                                {billing.status !== "cancelled" && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-destructive"
                                    onClick={() => showConfirmAction(
                                      'cancel',
                                      billing.id, 
                                      'Cancelar Cobrança', 
                                      'Tem certeza que deseja cancelar esta cobrança? Esta ação não pode ser desfeita.',
                                      'Cancelar'
                                    )}
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

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
            <DialogDescription>
              {confirmAction?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isActionInProgress}
            >
              Cancelar
            </Button>
            <Button
              onClick={executeAction}
              disabled={isActionInProgress}
            >
              {isActionInProgress ? "Processando..." : confirmAction?.actionText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Cobrança</DialogTitle>
            <DialogDescription>
              Visualize os detalhes desta cobrança.
            </DialogDescription>
          </DialogHeader>
          {selectedBilling && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                  <p>{selectedBilling.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <BillingStatusBadge status={selectedBilling.status} />
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unidade</p>
                <p>{selectedBilling.unit}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Morador</p>
                <p>{selectedBilling.resident}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                <p>{selectedBilling.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor</p>
                  <p className="font-semibold">{formatCurrency(selectedBilling.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vencimento</p>
                  <p>{formatDate(selectedBilling.dueDate)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enviado</p>
                  <p>{selectedBilling.is_sent ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Impresso</p>
                  <p>{selectedBilling.is_printed ? 'Sim' : 'Não'}</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cobrança</DialogTitle>
            <DialogDescription>
              Edite as informações desta cobrança.
            </DialogDescription>
          </DialogHeader>
          {selectedBilling && (
            <EditBillingForm 
              billing={selectedBilling}
              onClose={() => setIsEditDialogOpen(false)}
              onSave={fetchBillings}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
