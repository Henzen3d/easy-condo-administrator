import { useState, useEffect, useCallback } from "react";
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
  FileText, 
  Send,
  Printer,
  Eye,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Building,
  User,
  DollarSign,
  Clock,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  fetchInvoices, 
  fetchInvoiceWithItems, 
  updateInvoiceStatus, 
  markInvoiceAsPaid, 
  editInvoice,
  Invoice,
  InvoiceStatus,
  PaymentMethod
} from "@/lib/invoiceService";
import { generateBillingsSummaryPDF } from "@/lib/pdfService";
import { Billing } from "@/lib/billingService";
import { generatePixQRCode, hasBankAccountWithPix } from "@/lib/pixService";
import { useBankAccounts } from "@/contexts/BankAccountContext";

const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  const displayText = {
    pending: "Pendente",
    paid: "Pago",
    overdue: "Atrasado"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
      {displayText[status]}
    </span>
  );
};

const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPixDialogOpen, setIsPixDialogOpen] = useState(false);
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [hasPixAccounts, setHasPixAccounts] = useState(false);
  const { bankAccounts, addTransaction, updateBankAccount } = useBankAccounts();
  
  // Estados para o formulário de pagamento
  const [paymentForm, setPaymentForm] = useState({
    method: 'pix' as PaymentMethod,
    accountId: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Estados para o formulário de edição
  const [editForm, setEditForm] = useState({
    dueDate: '',
    notes: '',
    status: '' as InvoiceStatus
  });
  
  // Função para buscar as faturas
  const fetchInvoicesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchInvoices();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error('Erro ao buscar faturas:', error);
      toast.error('Erro ao carregar faturas');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Função para buscar as contas bancárias
  const fetchBankAccounts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setBankAccounts(data || []);
      
      // Definir a primeira conta como padrão se houver contas
      if (data && data.length > 0) {
        setPaymentForm(prev => ({ ...prev, accountId: data[0].id.toString() }));
      }
    } catch (error) {
      console.error('Erro ao buscar contas bancárias:', error);
    }
  }, []);
  
  // Verificar se existem contas com PIX configurado
  useEffect(() => {
    async function checkPixAccounts() {
      const hasPix = await hasBankAccountWithPix();
      setHasPixAccounts(hasPix);
    }
    
    checkPixAccounts();
  }, []);
  
  // Carregar dados iniciais
  useEffect(() => {
    fetchInvoicesData();
    fetchBankAccounts();
    
    // Verificar e atualizar faturas vencidas
    const checkOverdueInvoices = async () => {
      try {
        const { error } = await supabase.rpc('update_overdue_invoices');
        if (error) throw error;
      } catch (error) {
        console.error('Erro ao verificar faturas vencidas:', error);
      }
    };
    
    checkOverdueInvoices();
  }, [fetchInvoicesData, fetchBankAccounts]);
  
  // Filtrar faturas quando a tab mudar
  useEffect(() => {
    if (tabValue === 'all') {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(invoices.filter(invoice => invoice.status === tabValue));
    }
  }, [tabValue, invoices]);
  
  // Função para visualizar uma fatura
  const handleViewInvoice = async (invoiceId: number) => {
    try {
      const invoice = await fetchInvoiceWithItems(invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setIsViewDialogOpen(true);
      } else {
        toast.error('Fatura não encontrada');
      }
    } catch (error) {
      console.error('Erro ao visualizar fatura:', error);
      toast.error('Erro ao carregar detalhes da fatura');
    }
  };
  
  // Função para abrir o diálogo de pagamento
  const handleOpenPaymentDialog = async (invoiceId: number) => {
    try {
      const invoice = await fetchInvoiceWithItems(invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setIsPaymentDialogOpen(true);
      } else {
        toast.error('Fatura não encontrada');
      }
    } catch (error) {
      console.error('Erro ao abrir diálogo de pagamento:', error);
      toast.error('Erro ao carregar detalhes da fatura');
    }
  };
  
  // Função para abrir o diálogo de edição
  const handleOpenEditDialog = async (invoiceId: number) => {
    try {
      const invoice = await fetchInvoiceWithItems(invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setEditForm({
          dueDate: invoice.dueDate,
          notes: invoice.notes || '',
          status: invoice.status
        });
        setIsEditDialogOpen(true);
      } else {
        toast.error('Fatura não encontrada');
      }
    } catch (error) {
      console.error('Erro ao abrir diálogo de edição:', error);
      toast.error('Erro ao carregar detalhes da fatura');
    }
  };
  
  // Função para processar o pagamento
  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;
    
    try {
      if (!paymentForm.accountId) {
        toast.error('Selecione uma conta bancária');
        return;
      }
      
      const accountId = parseInt(paymentForm.accountId);
      
      const result = await markInvoiceAsPaid(
        selectedInvoice.id,
        paymentForm.method,
        accountId,
        paymentForm.date
      );
      
      if (result.success) {
        // Atualizar o estado local das faturas
        setInvoices(prev => 
          prev.map(invoice => 
            invoice.id === selectedInvoice.id 
              ? { 
                  ...invoice, 
                  status: 'paid',
                  paymentDate: paymentForm.date,
                  paymentMethod: paymentForm.method,
                  paymentAccountId: accountId
                } 
              : invoice
          )
        );
        
        // Encontrar a conta bancária selecionada
        const selectedAccount = bankAccounts.find(account => account.id === accountId);
        
        if (selectedAccount) {
          // Adicionar a transação ao contexto (usar a transação retornada se disponível)
          if (result.transaction) {
            addTransaction({
              id: result.transaction.id,
              account: accountId.toString(),
              amount: result.transaction.amount,
              category: result.transaction.category,
              date: result.transaction.date,
              description: result.transaction.description,
              payee: result.transaction.payee,
              status: result.transaction.status,
              type: result.transaction.type,
              unit: result.transaction.unit
            });
          } else {
            // Fallback para o caso de não ter a transação retornada
            addTransaction({
              id: Date.now(), // ID temporário
              account: accountId.toString(),
              amount: selectedInvoice.totalAmount,
              category: 'Receita',
              date: paymentForm.date,
              description: `Pagamento da fatura ${selectedInvoice.invoiceNumber}`,
              payee: selectedInvoice.resident,
              status: 'completed',
              type: 'income',
              unit: selectedInvoice.unit
            });
          }
          
          // Atualizar o saldo da conta (usar o novo saldo retornado se disponível)
          updateBankAccount({
            ...selectedAccount,
            balance: result.newBalance || (selectedAccount.balance + selectedInvoice.totalAmount)
          });
        }
        
        toast.success('Pagamento registrado com sucesso');
        setIsPaymentDialogOpen(false);
        fetchInvoicesData(); // Recarregar faturas
      } else {
        toast.error('Erro ao registrar pagamento');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
    }
  };
  
  // Função para salvar edições
  const handleSaveEdit = async () => {
    if (!selectedInvoice) return;
    
    try {
      const success = await editInvoice(selectedInvoice.id, {
        dueDate: editForm.dueDate,
        notes: editForm.notes,
        status: editForm.status
      });
      
      if (success) {
        toast.success('Fatura atualizada com sucesso');
        setIsEditDialogOpen(false);
        fetchInvoicesData(); // Recarregar faturas
      } else {
        toast.error('Erro ao atualizar fatura');
      }
    } catch (error) {
      console.error('Erro ao salvar edições:', error);
      toast.error('Erro ao atualizar fatura');
    }
  };
  
  // Função para reimprimir uma fatura
  const handleReprintInvoice = async (invoice: Invoice) => {
    try {
      // Buscar a fatura completa com itens
      const fullInvoice = await fetchInvoiceWithItems(invoice.id);
      if (!fullInvoice) {
        toast.error('Fatura não encontrada');
        return;
      }
      
      // Converter itens para o formato esperado pelo gerador de PDF
      const billings: Billing[] = fullInvoice.items.map(item => ({
        id: item.billingId,
        unit: fullInvoice.unit,
        resident: fullInvoice.resident,
        description: item.description,
        amount: item.amount,
        dueDate: fullInvoice.dueDate,
        status: 'pending',
        isPrinted: true,
        isSent: false
      }));
      
      // Gerar PDF
      const pdfUrl = generateBillingsSummaryPDF(
        fullInvoice.unit,
        fullInvoice.resident,
        billings,
        fullInvoice.totalAmount
      );
      
      // Abrir o PDF em uma nova aba
      window.open(pdfUrl, '_blank');
      
      toast.success('Fatura reimpressa com sucesso');
    } catch (error) {
      console.error('Erro ao reimprimir fatura:', error);
      toast.error('Erro ao reimprimir fatura');
    }
  };
  
  // Função para gerar PIX
  const handleGeneratePix = async (invoiceId: number) => {
    try {
      if (!hasPixAccounts) {
        toast.error('Nenhuma conta bancária com chave PIX configurada');
        return;
      }
      
      const invoice = await fetchInvoiceWithItems(invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        
        // Gerar QR Code PIX
        const qrCode = await generatePixQRCode(invoiceId);
        if (qrCode) {
          setPixQRCode(qrCode);
          setIsPixDialogOpen(true);
        } else {
          toast.error('Erro ao gerar QR Code PIX');
        }
      } else {
        toast.error('Fatura não encontrada');
      }
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      toast.error('Erro ao gerar PIX');
    }
  };
  
  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  // Obter nome do mês
  const getMonthName = (month: number) => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return months[month];
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">Histórico de Faturas</h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-200">
          Visualize e gerencie as faturas geradas para as unidades do condomínio.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" className="gap-2" onClick={() => fetchInvoicesData()}>
          <Clock size={16} />
          <span>Atualizar</span>
        </Button>
        
        <Button variant="outline" className="gap-2">
          <Filter size={16} />
          <span>Filtrar</span>
        </Button>
      </div>

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
                  <TableHead>Número</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Morador</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      Carregando faturas...
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      Nenhuma fatura encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.unit}</TableCell>
                      <TableCell>{invoice.resident}</TableCell>
                      <TableCell>{getMonthName(invoice.referenceMonth)}/{invoice.referenceYear}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
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
                              onClick={() => handleViewInvoice(invoice.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Visualizar</span>
                            </DropdownMenuItem>
                            
                            {invoice.status !== "paid" && (
                              <>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => handleOpenPaymentDialog(invoice.id)}
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  <span>Registrar Pagamento</span>
                                </DropdownMenuItem>
                                
                                {hasPixAccounts && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => handleGeneratePix(invoice.id)}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Gerar PIX</span>
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleReprintInvoice(invoice)}
                            >
                              <Printer className="mr-2 h-4 w-4" />
                              <span>Reimprimir</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleOpenEditDialog(invoice.id)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
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
      
      {/* Diálogo de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Fatura</DialogTitle>
            <DialogDescription>
              Visualize os detalhes completos da fatura.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    Referência: {getMonthName(selectedInvoice.referenceMonth)}/{selectedInvoice.referenceYear}
                  </p>
                </div>
                <InvoiceStatusBadge status={selectedInvoice.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Unidade</p>
                  <p className="font-medium flex items-center">
                    <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                    {selectedInvoice.unit}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Morador</p>
                  <p className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    {selectedInvoice.resident}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Vencimento</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(selectedInvoice.dueDate)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </p>
                </div>
                
                {selectedInvoice.status === 'paid' && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Data de Pagamento</p>
                      <p className="font-medium">
                        {selectedInvoice.paymentDate ? formatDate(selectedInvoice.paymentDate) : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                      <p className="font-medium capitalize">
                        {selectedInvoice.paymentMethod ? selectedInvoice.paymentMethod.replace('_', ' ') : 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Itens da Fatura</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                            Nenhum item encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedInvoice.items.map((item) => (
                          <TableRow key={item.id || item.billingId}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {selectedInvoice.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Observações</h4>
                  <p className="text-sm p-3 bg-muted rounded-md">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            {selectedInvoice && selectedInvoice.status !== 'paid' && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleOpenPaymentDialog(selectedInvoice.id);
              }}>
                Registrar Pagamento
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Registre o pagamento da fatura {selectedInvoice?.invoiceNumber}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Método de Pagamento</Label>
              <Select 
                value={paymentForm.method}
                onValueChange={(value) => setPaymentForm({...paymentForm, method: value as PaymentMethod})}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Selecione o método de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-account">Conta de Recebimento</Label>
              <Select 
                value={paymentForm.accountId}
                onValueChange={(value) => setPaymentForm({...paymentForm, accountId: value})}
              >
                <SelectTrigger id="payment-account">
                  <SelectValue placeholder="Selecione a conta bancária" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} - {account.bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-date">Data do Pagamento</Label>
              <Input 
                id="payment-date" 
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleProcessPayment}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Fatura</DialogTitle>
            <DialogDescription>
              Edite os detalhes da fatura {selectedInvoice?.invoiceNumber}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-due-date">Data de Vencimento</Label>
              <Input 
                id="edit-due-date" 
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={editForm.status}
                onValueChange={(value) => setEditForm({...editForm, status: value as InvoiceStatus})}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Input 
                id="edit-notes" 
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de PIX */}
      <Dialog open={isPixDialogOpen} onOpenChange={setIsPixDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code abaixo para pagar a fatura {selectedInvoice?.invoiceNumber}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-4">
            {pixQRCode && (
              <div className="border rounded-md p-4 bg-white">
                <img 
                  src={pixQRCode} 
                  alt="QR Code PIX" 
                  className="w-64 h-64"
                />
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Após o pagamento, o administrador precisará confirmar o recebimento.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPixDialogOpen(false)}>
              Fechar
            </Button>
            {pixQRCode && (
              <Button onClick={() => window.open(pixQRCode, '_blank')}>
                Abrir QR Code
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceHistory; 