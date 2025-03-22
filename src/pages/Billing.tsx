import { useState, useEffect, useCallback } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  AlertCircle,
  QrCode,
  Receipt,
  Building,
  CalendarIcon,
  UserIcon,
  HomeIcon,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { 
  getBillingById 
} from "@/utils/consumptionUtils";
import { 
  generateBillingsSummaryPDF, 
  generateBillingBoleto, 
  generatePixQRCode 
} from "@/lib/pdfService";
import { 
  fetchBillings, 
  groupBillingsByUnit, 
  updateBillingStatus, 
  markBillingAsPrinted, 
  markBillingAsSent,
  Billing as BillingType
} from "@/lib/billingService";
import { useBankAccounts } from "@/contexts/BankAccountContext";
import { findInvoiceByBillingId } from "@/lib/invoiceService";
import NewBillingForm from "@/components/billing/NewBillingForm";
import EditBillingForm from "@/components/billing/EditBillingForm";
import BillingFilters from "@/components/billing/BillingFilters";
import { 
  updateBillingFlag, 
} from "@/utils/consumptionUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isNewBillingDialogOpen, setIsNewBillingDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [billings, setBillings] = useState<BillingDisplay[]>([]);
  const [filteredBillings, setFilteredBillings] = useState<BillingDisplay[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
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
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const { bankAccounts, addTransaction, updateBankAccount } = useBankAccounts();

  // Memoize fetchBillings to prevent re-renders causing multiple fetches
  const fetchBillings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      console.log("Iniciando busca de cobranças do Supabase...");
      
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
      
      console.log("Dados recebidos do Supabase:", data);
      
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
        
        console.log("Cobranças formatadas:", formattedBillings);
        setBillings(formattedBillings);
        applyFilters(formattedBillings, activeFilters, tabValue, monthFilter);
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
  }, [activeFilters, tabValue, monthFilter]);
  
  // Helper function to validate billing status
  const validateStatus = (status: string): BillingStatus => {
    if (status === 'pending' || status === 'paid' || status === 'overdue' || status === 'cancelled') {
      return status;
    }
    return 'pending'; // Default fallback
  };

  useEffect(() => {
    // Memoize fetchBillings to prevent re-renders causing multiple fetches
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
    currentTab: string,
    currentMonth: string = "all"
  ) => {
    console.log("Billing: Iniciando aplicação de filtros", {
      totalBillings: allBillings.length,
      filters,
      currentTab,
      currentMonth
    });
    
    let result = [...allBillings];
    
    // Filtrar por tab (status)
    if (currentTab !== "all") {
      console.log(`Billing: Filtrando por tab "${currentTab}"`);
      result = result.filter(billing => billing.status === currentTab);
      console.log(`Billing: ${result.length} cobranças após filtro de tab`);
    }
    
    // Filtro por mês
    if (currentMonth !== "all") {
      console.log(`Billing: Filtrando por mês "${currentMonth}"`);
      result = result.filter(billing => {
        if (!billing.dueDate) return false;
        
        const dueDate = new Date(billing.dueDate);
        const month = dueDate.getMonth() + 1; // getMonth() retorna 0-11
        const year = dueDate.getFullYear();
        const monthYear = `${month}-${year}`;
        
        return monthYear === currentMonth;
      });
      console.log(`Billing: ${result.length} cobranças após filtro de mês`);
    }
    
    // Filtro por status (se não estiver usando tabs ou se o status escolhido for diferente do tab)
    if (filters.status !== "all" && (currentTab === "all" || filters.status !== currentTab)) {
      console.log(`Billing: Filtrando por status "${filters.status}"`);
      result = result.filter(billing => billing.status === filters.status);
      console.log(`Billing: ${result.length} cobranças após filtro de status`);
    }
    
    // Filtro por unit_id
    if (filters.unit_id && filters.unit_id !== "all") {
      console.log(`Billing: Filtrando por unit_id "${filters.unit_id}"`);
      const filtered = result.filter(billing => 
        billing.unit_id?.toString() === filters.unit_id
      );
      
      if (filtered.length === 0) {
        console.warn(`Billing: Nenhuma cobrança encontrada com unit_id="${filters.unit_id}"`);
        console.log("Billing: IDs de unidades disponíveis nas cobranças:", 
          [...new Set(result.map(b => b.unit_id?.toString()))].filter(Boolean).join(", "));
      }
      
      result = filtered;
      console.log(`Billing: ${result.length} cobranças após filtro de unit_id`);
    }
    
    // Filtro por residente
    if (filters.resident) {
      console.log(`Billing: Filtrando por residente "${filters.resident}"`);
      const residentLower = filters.resident.toLowerCase();
      result = result.filter(billing => 
        billing.resident.toLowerCase().includes(residentLower)
      );
      console.log(`Billing: ${result.length} cobranças após filtro de residente`);
    }
    
    // Filtro por data inicial
    if (filters.startDate) {
      console.log(`Billing: Filtrando por data inicial "${filters.startDate}"`);
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(billing => {
        const dueDate = new Date(billing.dueDate);
        return dueDate >= startDate;
      });
      console.log(`Billing: ${result.length} cobranças após filtro de data inicial`);
    }
    
    // Filtro por data final
    if (filters.endDate) {
      console.log(`Billing: Filtrando por data final "${filters.endDate}"`);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(billing => {
        const dueDate = new Date(billing.dueDate);
        return dueDate <= endDate;
      });
      console.log(`Billing: ${result.length} cobranças após filtro de data final`);
    }
    
    console.log("Billing: Resultado final da filtragem:", {
      initialCount: allBillings.length,
      filteredCount: result.length
    });
    
    if (result.length === 0 && allBillings.length > 0) {
      console.warn("Billing: Todos os registros foram filtrados - revisar critérios");
    }
    
    setFilteredBillings(result);
  };

  // Handler para quando as tabs mudam
  const handleTabChange = (value: string) => {
    setTabValue(value);
    applyFilters(billings, activeFilters, value, monthFilter);
  };

  // Handler para quando o filtro de mês muda
  const handleMonthChange = (value: string) => {
    setMonthFilter(value);
    applyFilters(billings, activeFilters, tabValue, value);
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
    applyFilters(billings, filters, tabValue, monthFilter);
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
    let result;
    
    try {
      switch (confirmAction.type) {
        case 'pay':
          // Verificar se a cobrança está associada a uma fatura
          const billing = billings.find(b => b.id === confirmAction.id);
          if (!billing) {
            toast.error('Cobrança não encontrada');
            break;
          }

          // Buscar a fatura associada à cobrança
          const invoice = await findInvoiceByBillingId(confirmAction.id);
          
          // Se a cobrança estiver associada a uma fatura, não permitir o pagamento direto
          if (invoice) {
            toast.error('Esta cobrança está associada a uma fatura. Por favor, efetue o pagamento através da fatura.');
            break;
          }

          // Se não houver contas bancárias cadastradas
          if (bankAccounts.length === 0) {
            toast.error('Não há contas bancárias cadastradas para registrar o pagamento');
            break;
          }

          // Usar a primeira conta bancária como padrão
          const defaultAccount = bankAccounts[0];
          
          result = await updateBillingStatus(confirmAction.id, 'paid');
          if (result.success) {
            // Atualizar ambos os estados locais
            const updateBillingState = (prev: BillingDisplay[]) =>
              prev.map(b => b.id === confirmAction.id ? { ...b, status: "paid" as BillingStatus } : b);
            
            setBillings(updateBillingState);
            setFilteredBillings(updateBillingState);

            // Adicionar uma transação e atualizar o saldo da conta
            if (billing) {
              // Adicionar a transação
              addTransaction({
                account: defaultAccount.id.toString(),
                amount: billing.amount,
                category: 'Receita',
                date: new Date().toISOString().split('T')[0],
                description: `Pagamento de cobrança: ${billing.description}`,
                payee: billing.resident,
                status: 'completed',
                type: 'income',
                unit: billing.unit
              });

              // Atualizar o saldo da conta
              updateBankAccount({
                ...defaultAccount,
                balance: defaultAccount.balance + billing.amount
              });
            }

            toast.success('Cobrança marcada como paga');
          } else {
            toast.error('Erro ao marcar cobrança como paga');
          }
          break;
          
        case 'send':
          result = await updateBillingFlag(confirmAction.id, 'is_sent', true);
          if (result.success) {
            const updateBillingState = (prev: BillingDisplay[]) =>
              prev.map(b => b.id === confirmAction.id ? { ...b, is_sent: true } : b);
            
            setBillings(updateBillingState);
            setFilteredBillings(updateBillingState);
            
            toast.success('Cobrança marcada como enviada');
          } else {
            toast.error('Erro ao marcar cobrança como enviada');
          }
          break;
          
        case 'print':
          result = await updateBillingFlag(confirmAction.id, 'is_printed', true);
          if (result.success) {
            const updateBillingState = (prev: BillingDisplay[]) =>
              prev.map(b => b.id === confirmAction.id ? { ...b, is_printed: true } : b);
            
            setBillings(updateBillingState);
            setFilteredBillings(updateBillingState);
            
            toast.success('Cobrança marcada como impressa');
          } else {
            toast.error('Erro ao marcar cobrança como impressa');
          }
          break;
          
        case 'cancel':
          // Buscar a cobrança atual para verificar seu status
          const billingToCancel = billings.find(b => b.id === confirmAction.id);
          if (!billingToCancel) {
            toast.error('Cobrança não encontrada');
            break;
          }

          // Se a cobrança estava paga, precisamos reverter o saldo
          if (billingToCancel.status === 'paid') {
            // Verificar se há contas bancárias
            if (bankAccounts.length === 0) {
              toast.error('Não há contas bancárias cadastradas');
              break;
            }

            // Usar a primeira conta como padrão
            const defaultAccount = bankAccounts[0];

            // Adicionar transação de estorno
            addTransaction({
              account: defaultAccount.id.toString(),
              amount: billingToCancel.amount,
              category: 'Estorno',
              date: new Date().toISOString().split('T')[0],
              description: `Estorno por cancelamento de cobrança: ${billingToCancel.description}`,
              payee: billingToCancel.resident,
              status: 'completed',
              type: 'expense',
              unit: billingToCancel.unit
            });

            // Atualizar o saldo da conta (subtraindo o valor)
            updateBankAccount({
              ...defaultAccount,
              balance: defaultAccount.balance - billingToCancel.amount
            });
          }

          // Atualizar o status da cobrança para cancelado
          result = await updateBillingStatus(confirmAction.id, 'cancelled');
          if (result.success) {
            const updateBillingState = (prev: BillingDisplay[]) =>
              prev.map(b => b.id === confirmAction.id ? { ...b, status: "cancelled" } : b);
            
            setBillings(updateBillingState as (prev: BillingDisplay[]) => BillingDisplay[]);
            setFilteredBillings(updateBillingState as (prev: BillingDisplay[]) => BillingDisplay[]);
            
            toast.success('Cobrança cancelada e saldo atualizado');
          } else {
            toast.error('Erro ao cancelar cobrança');
          }
          break;
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
    try {
      if (!dateString) return 'Data indisponível';
      const date = new Date(dateString);
      // Verifica se a data é válida
      if (isNaN(date.getTime())) return 'Data inválida';
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error);
      return 'Data inválida';
    }
  };

  // Componente para gerar resumo de cobranças por unidade
  const BillingsSummary = ({ billings, onClose }: { billings: BillingDisplay[], onClose: () => void }) => {
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const groupedBillings = groupBillingsByUnit(billings);
    
    const selectedUnitData = selectedUnit 
      ? groupedBillings.find(item => item.unit === selectedUnit)
      : null;
      
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    };
    
    const formatDate = (dateString: string) => {
      try {
        if (!dateString) return 'Data indisponível';
        const date = new Date(dateString);
        // Verifica se a data é válida
        if (isNaN(date.getTime())) return 'Data inválida';
        return new Intl.DateTimeFormat('pt-BR').format(date);
      } catch (error) {
        console.error('Erro ao formatar data:', dateString, error);
        return 'Data inválida';
      }
    };

    // Função para gerar PDF de resumo
    const handleGenerateSummaryPDF = () => {
      if (!selectedUnitData) return;
      
      try {
        toast.info('Gerando PDF de resumo...');
        console.log('Gerando PDF para unidade:', selectedUnitData.unit);
        
        // Filtra as cobranças canceladas e calcula o valor total a ser pago
        const activeAmount = selectedUnitData.billings
          .filter(billing => billing.status !== 'cancelled')
          .reduce((total, billing) => total + billing.amount, 0);
        
        // Converter o formato para o esperado pela função de geração de PDF
        const billingItems = selectedUnitData.billings.map(b => ({
          id: b.id,
          unit: b.unit,
          resident: b.resident,
          description: b.description,
          amount: b.amount,
          due_date: b.dueDate,
          status: b.status,
          is_printed: b.is_printed,
          is_sent: b.is_sent
        }));
        
        const pdfUrl = generateBillingsSummaryPDF(
          selectedUnitData.unit,
          selectedUnitData.resident,
          billingItems,
          activeAmount  // Usando o valor total excluindo os cancelados
        );
        
        console.log('URL do PDF de resumo gerado:', pdfUrl?.substring(0, 50) + '...');
        
        if (!pdfUrl) {
          throw new Error('URL do PDF não foi gerada');
        }
        
        // Abrir o PDF em uma nova aba
        console.log('Abrindo PDF de resumo em nova aba...');
        const newWindow = window.open(pdfUrl, '_blank');
        
        if (!newWindow) {
          toast.error('Bloqueador de pop-ups impediu a abertura do PDF. Por favor, permita pop-ups para este site.');
          console.error('Falha ao abrir nova janela - possível bloqueio de pop-up');
          // Tente fornecer um link alternativo
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = `resumo_${selectedUnitData.unit}_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.log('Nova janela de resumo aberta com sucesso');
        }
        
        // Marcar as cobranças ativas como impressas
        selectedUnitData.billings
          .filter(item => item.status !== 'cancelled')
          .forEach(async (item) => {
            await markBillingAsPrinted(item.id);
          });
        
        toast.success('PDF de resumo gerado com sucesso');
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error(`Erro ao gerar PDF de resumo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    };

    // Função para gerar boleto
    const handleGenerateBoleto = () => {
      if (!selectedUnitData) return;
      
      try {
        toast.info('Gerando boleto...');
        console.log('Gerando boleto para unidade:', selectedUnitData.unit);
        
        // Filtra as cobranças canceladas e calcula o valor total a ser pago
        const activeAmount = selectedUnitData.billings
          .filter(billing => billing.status !== 'cancelled')
          .reduce((total, billing) => total + billing.amount, 0);
        
        // Gerar um boleto único para o total
        const combinedBilling: BillingType = {
          id: `COMB-${selectedUnitData.unit}-${Date.now().toString().substring(0, 8)}`,
          unit: selectedUnitData.unit,
          resident: selectedUnitData.resident,
          description: `Cobranças Consolidadas - Unidade ${selectedUnitData.unit}`,
          amount: activeAmount,
          due_date: new Date().toISOString().split('T')[0], // Data atual
          status: 'pending',
          is_printed: false,
          is_sent: false
        };
        
        console.log('Gerando boleto para:', combinedBilling);
        const pdfUrl = generateBillingBoleto(combinedBilling);
        console.log('URL do boleto gerado:', pdfUrl?.substring(0, 50) + '...');
        
        if (!pdfUrl) {
          throw new Error('URL do boleto não foi gerada');
        }
        
        // Abrir o PDF em uma nova aba
        console.log('Abrindo boleto em nova aba...');
        const newWindow = window.open(pdfUrl, '_blank');
        
        if (!newWindow) {
          toast.error('Bloqueador de pop-ups impediu a abertura do boleto. Por favor, permita pop-ups para este site.');
          console.error('Falha ao abrir nova janela - possível bloqueio de pop-up');
          // Tente fornecer um link alternativo
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = `boleto_${selectedUnitData.unit}_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.log('Nova janela de boleto aberta com sucesso');
        }
        
        // Marcar as cobranças ativas como impressas
        selectedUnitData.billings
          .filter(item => item.status !== 'cancelled')
          .forEach(async (item) => {
            await markBillingAsPrinted(item.id);
          });
        
        toast.success('Boleto gerado com sucesso');
      } catch (error) {
        console.error('Error generating boleto:', error);
        toast.error(`Erro ao gerar boleto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    };

    // Função para gerar PIX
    const handleGeneratePixQRCode = async () => {
      if (!selectedUnitData) return;
      
      try {
        toast.info('Gerando QR Code PIX...');
        
        // Filtra as cobranças canceladas e calcula o valor total a ser pago
        const activeAmount = selectedUnitData.billings
          .filter(billing => billing.status !== 'cancelled')
          .reduce((total, billing) => total + billing.amount, 0);
        
        // Gerar um PIX único para o total
        const combinedBilling: BillingType = {
          id: `PIX-${selectedUnitData.unit}-${Date.now().toString().substring(0, 8)}`,
          unit: selectedUnitData.unit,
          resident: selectedUnitData.resident,
          description: `Pagamento PIX - Unidade ${selectedUnitData.unit}`,
          amount: activeAmount,
          due_date: new Date().toISOString().split('T')[0], // Data atual
          status: 'pending',
          is_printed: false,
          is_sent: false
        };
        
        console.log('Gerando QR Code para:', combinedBilling);
        const pdfUrl = await generatePixQRCode(combinedBilling);
        console.log('URL do PDF gerado:', pdfUrl?.substring(0, 50) + '...');
        
        if (!pdfUrl) {
          throw new Error('URL do PDF não foi gerada');
        }
        
        // Abrir o PDF em uma nova aba
        console.log('Abrindo PDF em nova aba...');
        const newWindow = window.open(pdfUrl, '_blank');
        
        if (!newWindow) {
          toast.error('Bloqueador de pop-ups impediu a abertura do PDF. Por favor, permita pop-ups para este site.');
          console.error('Falha ao abrir nova janela - possível bloqueio de pop-up');
          // Tente fornecer um link alternativo
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = `pix_${selectedUnitData.unit}_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.log('Nova janela aberta com sucesso');
        }
        
        // Marcar as cobranças ativas como impressas
        selectedUnitData.billings
          .filter(item => item.status !== 'cancelled')
          .forEach(async (item) => {
            await markBillingAsPrinted(item.id);
          });
        
        toast.success('QR Code PIX gerado com sucesso');
      } catch (error) {
        console.error('Error generating PIX QR code:', error);
        toast.error(`Erro ao gerar QR Code PIX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    };

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="unit-select">Selecione a Unidade</Label>
          <select 
            id="unit-select" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedUnit || ''}
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="">Selecione uma unidade</option>
            {groupedBillings.map((group) => (
              <option key={group.unit} value={group.unit}>
                {group.unit} - {group.resident} ({group.billings.length} cobranças)
              </option>
            ))}
          </select>
        </div>
        
        {selectedUnitData && (
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Resumo de Cobranças - Unidade {selectedUnitData.unit}</CardTitle>
                  <CardDescription>Morador: {selectedUnitData.resident}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={handleGeneratePixQRCode}
                  >
                    <QrCode size={14} />
                    <span>Gerar PIX</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={handleGenerateBoleto}
                  >
                    <Receipt size={14} />
                    <span>Gerar Boleto</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={handleGenerateSummaryPDF}
                  >
                    <Printer size={14} />
                    <span>Imprimir</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total a Pagar</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedUnitData.billings
                        .filter(billing => billing.status !== 'cancelled')
                        .reduce((total, billing) => total + billing.amount, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Apenas cobranças não canceladas)
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Itens</p>
                    <p className="text-2xl font-bold">{selectedUnitData.billings.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ({selectedUnitData.billings.filter(b => b.status !== 'cancelled').length} ativos)
                    </p>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedUnitData.billings.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{formatDate(item.dueDate)}</TableCell>
                        <TableCell>
                          <BillingStatusBadge status={item.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Resumo gerado em: {new Date().toLocaleDateString('pt-BR')}
              </p>
              <Button onClick={onClose} variant="outline">Fechar</Button>
            </CardFooter>
          </Card>
        )}
        
        {groupedBillings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <Building className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhuma cobrança pendente ou atrasada foi encontrada.</p>
          </div>
        )}
      </div>
    );
  };

  // Função para alternar a expansão de uma unidade
  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  // Função para agrupar as cobranças por unidade
  const groupBillingsByUnit = (billings: BillingDisplay[]) => {
    const groupedByUnit: Record<string, {
      unit: string,
      unitId: string | number | null,
      resident: string,
      totalAmount: number,
      billings: BillingDisplay[]
    }> = {};

    billings.forEach(billing => {
      const unitKey = billing.unit;
      
      if (!groupedByUnit[unitKey]) {
        groupedByUnit[unitKey] = {
          unit: billing.unit,
          unitId: billing.unit_id,
          resident: billing.resident,
          totalAmount: 0,
          billings: []
        };
      }
      
      // Somente soma ao total se a cobrança não estiver cancelada
      if (billing.status !== 'cancelled') {
        groupedByUnit[unitKey].totalAmount += billing.amount;
      }
      
      groupedByUnit[unitKey].billings.push(billing);
    });

    return Object.values(groupedByUnit).sort((a, b) => a.unit.localeCompare(b.unit));
  };

  // Agrupar as cobranças filtradas
  const groupedBillings = groupBillingsByUnit(filteredBillings);

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">Cobranças</h1>
          <p className="text-muted-foreground animate-slide-in-top animation-delay-200">
            Gerencie as cobranças do condomínio.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 my-4">
        <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Receipt size={16} />
              <span>Gerar Resumo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Resumo de Cobranças por Unidade</DialogTitle>
              <DialogDescription>
                Selecione uma unidade para gerar o resumo de cobranças pendentes e em atraso.
              </DialogDescription>
            </DialogHeader>
            <BillingsSummary 
              billings={billings} 
              onClose={() => setIsSummaryDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={isNewBillingDialogOpen} onOpenChange={setIsNewBillingDialogOpen}>
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
              onClose={() => setIsNewBillingDialogOpen(false)} 
              onSave={fetchBillings}
            />
          </DialogContent>
        </Dialog>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              <span className="hidden sm:inline">Exportar</span>
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

      <div className="grid md:grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-0">
            <div className="space-y-4">
              <Tabs value={tabValue} onValueChange={handleTabChange}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="paid">Pagas</TabsTrigger>
                  <TabsTrigger value="overdue">Atrasadas</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center">
                <Label htmlFor="monthFilter" className="mr-2">Mês:</Label>
                <Select value={monthFilter} onValueChange={handleMonthChange}>
                  <SelectTrigger id="monthFilter" className="w-[180px]">
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {/* Meses do ano atual */}
                    <SelectItem value="1-2025">Janeiro 2025</SelectItem>
                    <SelectItem value="2-2025">Fevereiro 2025</SelectItem>
                    <SelectItem value="3-2025">Março 2025</SelectItem>
                    <SelectItem value="4-2025">Abril 2025</SelectItem>
                    <SelectItem value="5-2025">Maio 2025</SelectItem>
                    <SelectItem value="6-2025">Junho 2025</SelectItem>
                    <SelectItem value="7-2025">Julho 2025</SelectItem>
                    <SelectItem value="8-2025">Agosto 2025</SelectItem>
                    <SelectItem value="9-2025">Setembro 2025</SelectItem>
                    <SelectItem value="10-2025">Outubro 2025</SelectItem>
                    <SelectItem value="11-2025">Novembro 2025</SelectItem>
                    <SelectItem value="12-2025">Dezembro 2025</SelectItem>
                    {/* Meses do ano anterior */}
                    <SelectItem value="1-2024">Janeiro 2024</SelectItem>
                    <SelectItem value="2-2024">Fevereiro 2024</SelectItem>
                    <SelectItem value="3-2024">Março 2024</SelectItem>
                    <SelectItem value="4-2024">Abril 2024</SelectItem>
                    <SelectItem value="5-2024">Maio 2024</SelectItem>
                    <SelectItem value="6-2024">Junho 2024</SelectItem>
                    <SelectItem value="7-2024">Julho 2024</SelectItem>
                    <SelectItem value="8-2024">Agosto 2024</SelectItem>
                    <SelectItem value="9-2024">Setembro 2024</SelectItem>
                    <SelectItem value="10-2024">Outubro 2024</SelectItem>
                    <SelectItem value="11-2024">Novembro 2024</SelectItem>
                    <SelectItem value="12-2024">Dezembro 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border mt-4">
              {/* Tabela Desktop - Consolidada por Unidade */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Morador</TableHead>
                      <TableHead>Qtd. Cobranças</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedBillings.length > 0 ? (
                      groupedBillings.map((group) => (
                        <React.Fragment key={group.unit}>
                          {/* Linha consolidada da unidade */}
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleUnitExpansion(group.unit)}
                          >
                            <TableCell className="font-medium">{group.unit}</TableCell>
                            <TableCell>{group.resident}</TableCell>
                            <TableCell>{group.billings.length}</TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(group.totalAmount)}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={(e) => {
                                e.stopPropagation();
                                toggleUnitExpansion(group.unit);
                              }}>
                                {expandedUnits.has(group.unit) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>

                          {/* Detalhes das cobranças quando expandido */}
                          {expandedUnits.has(group.unit) && (
                            <TableRow className="bg-muted/20">
                              <TableCell colSpan={5} className="p-0">
                                <div className="p-2">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Vencimento</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {group.billings.map((billing) => (
                                        <TableRow key={billing.id}>
                                          <TableCell>{billing.description}</TableCell>
                                          <TableCell>{formatCurrency(billing.amount)}</TableCell>
                                          <TableCell>{formatDate(billing.dueDate)}</TableCell>
                                          <TableCell>
                                            <BillingStatusBadge status={billing.status} />
                                          </TableCell>
                                          <TableCell>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon">
                                                  <MoreVertical className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem 
                                                  className="cursor-pointer"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    viewBilling(billing.id);
                                                  }}
                                                >
                                                  <Eye className="mr-2 h-4 w-4" />
                                                  <span>Visualizar</span>
                                                </DropdownMenuItem>
                                                
                                                {billing.status !== "paid" && billing.status !== "cancelled" && (
                                                  <DropdownMenuItem 
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      showConfirmAction(
                                                        'pay',
                                                        billing.id, 
                                                        'Marcar como Pago', 
                                                        'Tem certeza que deseja marcar esta cobrança como paga?',
                                                        'Marcar como Pago'
                                                      );
                                                    }}
                                                  >
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    <span>Marcar como Pago</span>
                                                  </DropdownMenuItem>
                                                )}
                                                
                                                {/* Outros itens do menu dropdown */}
                                                {!billing.is_sent && billing.status !== "cancelled" && (
                                                  <DropdownMenuItem 
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      showConfirmAction(
                                                        'send',
                                                        billing.id, 
                                                        'Marcar como Enviado', 
                                                        'Tem certeza que deseja marcar esta cobrança como enviada?',
                                                        'Marcar como Enviado'
                                                      );
                                                    }}
                                                  >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    <span>Marcar como Enviado</span>
                                                  </DropdownMenuItem>
                                                )}
                                                
                                                {!billing.is_printed && billing.status !== "cancelled" && (
                                                  <DropdownMenuItem 
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      showConfirmAction(
                                                        'print',
                                                        billing.id, 
                                                        'Marcar como Impresso', 
                                                        'Tem certeza que deseja marcar esta cobrança como impressa?',
                                                        'Marcar como Impresso'
                                                      );
                                                    }}
                                                  >
                                                    <Printer className="mr-2 h-4 w-4" />
                                                    <span>Marcar como Impresso</span>
                                                  </DropdownMenuItem>
                                                )}
                                                
                                                <DropdownMenuItem 
                                                  className="cursor-pointer"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    editBilling(billing.id);
                                                  }}
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
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      showConfirmAction(
                                                        'cancel',
                                                        billing.id, 
                                                        'Cancelar Cobrança', 
                                                        'Tem certeza que deseja cancelar esta cobrança? Esta ação não pode ser desfeita.',
                                                        'Cancelar'
                                                      );
                                                    }}
                                                  >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Cancelar Cobrança</span>
                                                  </DropdownMenuItem>
                                                )}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhuma cobrança encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Tabela Mobile - Também consolidada */}
              <div className="md:hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedBillings.length > 0 ? (
                      groupedBillings.map((group) => (
                        <React.Fragment key={group.unit}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleUnitExpansion(group.unit)}
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{group.unit}</div>
                                <div className="text-sm text-muted-foreground">{group.resident}</div>
                                <div className="text-sm text-muted-foreground">{group.billings.length} cobranças</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(group.totalAmount)}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={(e) => {
                                e.stopPropagation();
                                toggleUnitExpansion(group.unit);
                              }}>
                                {expandedUnits.has(group.unit) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                          
                          {expandedUnits.has(group.unit) && (
                            <TableRow className="bg-muted/20">
                              <TableCell colSpan={3} className="p-0">
                                <div className="p-2">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {group.billings.map((billing) => (
                                        <TableRow key={billing.id}>
                                          <TableCell>
                                            <div className="space-y-1">
                                              <div className="font-medium">{billing.description}</div>
                                              <div className="flex items-center text-sm text-muted-foreground">
                                                <CalendarIcon className="mr-1 h-3 w-3" />
                                                {formatDate(billing.dueDate)}
                                              </div>
                                              <div>
                                                <BillingStatusBadge status={billing.status} />
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-right font-medium">
                                            {formatCurrency(billing.amount)}
                                          </TableCell>
                                          <TableCell>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon">
                                                  <MoreVertical className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem 
                                                  className="cursor-pointer"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    viewBilling(billing.id);
                                                  }}
                                                >
                                                  <Eye className="mr-2 h-4 w-4" />
                                                  <span>Visualizar</span>
                                                </DropdownMenuItem>
                                                
                                                {billing.status !== "paid" && billing.status !== "cancelled" && (
                                                  <DropdownMenuItem 
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      showConfirmAction(
                                                        'pay',
                                                        billing.id, 
                                                        'Marcar como Pago', 
                                                        'Tem certeza que deseja marcar esta cobrança como paga?',
                                                        'Marcar como Pago'
                                                      );
                                                    }}
                                                  >
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    <span>Marcar como Pago</span>
                                                  </DropdownMenuItem>
                                                )}
                                                
                                                {/* Outros itens do menu */}
                                                {/* ... */}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Nenhuma cobrança encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Espaço adicional para evitar sobreposição do menu flutuante */}
      <div className="h-20" />
    </>
  );
};

export default Billing;


