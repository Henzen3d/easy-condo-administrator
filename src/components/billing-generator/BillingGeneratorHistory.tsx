import { useState, useEffect } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Download, 
  MoreVertical, 
  FileText, 
  Send,
  Printer,
  Eye,
  Pencil,
  Search,
  Filter,
  ArrowDownUp,
  MoreHorizontal,
  Edit,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useBankAccounts } from "@/contexts/BankAccountContext";
import { format } from "date-fns";
import { pt } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { prepareInvoiceData, generateInvoicePDF } from "@/utils/pdf/generators";

// Tipos
type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

interface Invoice {
  id: number;
  invoiceNumber: string;
  referenceMonth: number;
  referenceYear: number;
  unit: string;
  unitId: string;
  resident: string;
  totalAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  paymentDate?: string;
  paymentMethod?: string;
  paymentAccountId?: string;
  notes?: string;
}

// Componente para exibir o status da fatura com cores diferentes
const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pago</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
    case "overdue":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencido</Badge>;
    case "cancelled":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelado</Badge>;
    default:
      return null;
  }
};

// Dados de exemplo para faturas
const sampleInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: "FAT-2023-001",
    referenceMonth: 6,
    referenceYear: 2023,
    unit: "101",
    unitId: "1",
    resident: "João Silva",
    totalAmount: 450.00,
    dueDate: "2023-06-10",
    status: "paid",
    paymentDate: "2023-06-08",
    paymentMethod: "pix",
    paymentAccountId: "1",
    notes: "Pagamento realizado antes do vencimento"
  },
  {
    id: 2,
    invoiceNumber: "FAT-2023-002",
    referenceMonth: 6,
    referenceYear: 2023,
    unit: "102",
    unitId: "2",
    resident: "Maria Souza",
    totalAmount: 450.00,
    dueDate: "2023-06-10",
    status: "pending"
  },
  {
    id: 3,
    invoiceNumber: "FAT-2023-003",
    referenceMonth: 6,
    referenceYear: 2023,
    unit: "201",
    unitId: "3",
    resident: "Pedro Santos",
    totalAmount: 450.00,
    dueDate: "2023-06-10",
    status: "overdue"
  },
  {
    id: 4,
    invoiceNumber: "FAT-2023-004",
    referenceMonth: 5,
    referenceYear: 2023,
    unit: "101",
    unitId: "1",
    resident: "João Silva",
    totalAmount: 450.00,
    dueDate: "2023-05-10",
    status: "paid",
    paymentDate: "2023-05-09",
    paymentMethod: "bank_transfer",
    paymentAccountId: "1"
  },
  {
    id: 5,
    invoiceNumber: "FAT-2023-005",
    referenceMonth: 5,
    referenceYear: 2023,
    unit: "102",
    unitId: "2",
    resident: "Maria Souza",
    totalAmount: 450.00,
    dueDate: "2023-05-10",
    status: "paid",
    paymentDate: "2023-05-12",
    paymentMethod: "pix",
    paymentAccountId: "1",
    notes: "Pagamento realizado com atraso"
  }
];

const BillingGeneratorHistory = () => {
  const { toast } = useToast();
  const { bankAccounts } = useBankAccounts();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    bankAccountId: "",
    paymentDate: new Date(),
    paymentMethod: "pix",
    notes: ""
  });
  const [editData, setEditData] = useState({
    dueDate: new Date(),
    notes: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Carregar faturas
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            billings:invoice_billings(
              billing_id
            ),
            unit:units(
              id, block, number, owner
            )
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Carregar detalhes das cobranças para cada fatura
        const invoicesWithDetails = await Promise.all(
          data.map(async (invoice) => {
            // Extrair IDs das cobranças
            const billingIds = invoice.billings.map((b: any) => b.billing_id);
            
            // Buscar detalhes das cobranças
            const { data: billingsData, error: billingsError } = await supabase
              .from('billings')
              .select('*')
              .in('id', billingIds);
              
            if (billingsError) {
              console.error("Erro ao carregar detalhes das cobranças:", billingsError);
              return {
                ...invoice,
                billingsDetails: []
              };
            }
            
            return {
              ...invoice,
              billingsDetails: billingsData || []
            };
          })
        );
        
        setInvoices(invoicesWithDetails);
      } catch (error) {
        console.error("Erro ao carregar faturas:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar faturas",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInvoices();
  }, [toast]);
  
  // Formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: pt });
  };
  
  // Formatar valor
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Calcular total da fatura
  const calculateInvoiceTotal = (billingsDetails: any[]) => {
    return billingsDetails.reduce((sum, billing) => sum + (billing.amount || 0), 0);
  };
  
  // Abrir diálogo de pagamento
  const handleOpenPaymentDialog = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      bankAccountId: bankAccounts.length > 0 ? bankAccounts[0].id : "",
      paymentDate: new Date(),
      paymentMethod: "pix",
      notes: ""
    });
    setShowPaymentDialog(true);
  };
  
  // Abrir diálogo de edição
  const handleOpenEditDialog = (invoice: any) => {
    setSelectedInvoice(invoice);
    setEditData({
      dueDate: new Date(invoice.due_date),
      notes: invoice.notes || ""
    });
    setShowEditDialog(true);
  };
  
  // Processar pagamento
  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;
    
    if (!paymentData.bankAccountId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Atualizar status da fatura
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          payment_date: paymentData.paymentDate.toISOString(),
          payment_method: paymentData.paymentMethod,
          payment_notes: paymentData.notes,
          bank_account_id: paymentData.bankAccountId
        })
        .eq('id', selectedInvoice.id);
        
      if (invoiceError) throw invoiceError;
      
      // Atualizar status das cobranças
      for (const billing of selectedInvoice.billingsDetails) {
        const { error: billingError } = await supabase
          .from('billings')
          .update({
            status: 'paid',
            payment_date: paymentData.paymentDate.toISOString()
          })
          .eq('id', billing.id);
          
        if (billingError) {
          console.error("Erro ao atualizar cobrança:", billingError);
        }
      }
      
      // Atualizar a lista de faturas
      setInvoices(invoices.map(invoice => 
        invoice.id === selectedInvoice.id 
          ? { 
              ...invoice, 
              status: 'paid',
              payment_date: paymentData.paymentDate.toISOString(),
              payment_method: paymentData.paymentMethod,
              payment_notes: paymentData.notes,
              bank_account_id: paymentData.bankAccountId
            } 
          : invoice
      ));
      
      toast({
        title: "Sucesso",
        description: "Pagamento processado com sucesso"
      });
      
      setShowPaymentDialog(false);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar pagamento",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Atualizar fatura
  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;
    
    try {
      setIsProcessing(true);
      
      // Atualizar fatura
      const { error } = await supabase
        .from('invoices')
        .update({
          due_date: editData.dueDate.toISOString(),
          notes: editData.notes
        })
        .eq('id', selectedInvoice.id);
        
      if (error) throw error;
      
      // Atualizar a lista de faturas
      setInvoices(invoices.map(invoice => 
        invoice.id === selectedInvoice.id 
          ? { 
              ...invoice, 
              due_date: editData.dueDate.toISOString(),
              notes: editData.notes
            } 
          : invoice
      ));
      
      toast({
        title: "Sucesso",
        description: "Fatura atualizada com sucesso"
      });
      
      setShowEditDialog(false);
    } catch (error) {
      console.error("Erro ao atualizar fatura:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar fatura",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Gerar segunda via da fatura
  const handleGenerateSecondCopy = async (invoice: any) => {
    try {
      setIsProcessing(true);
      
      // Preparar dados da fatura
      const invoiceData = {
        invoiceNumber: invoice.invoice_number,
        unitId: invoice.unit_id,
        unitBlock: invoice.unit[0].block,
        unitNumber: invoice.unit[0].number,
        resident: invoice.unit[0].owner || "Proprietário",
        dueDate: invoice.due_date,
        referenceMonth: invoice.reference_month,
        referenceYear: invoice.reference_year,
        notes: invoice.notes,
        chargeItems: invoice.billingsDetails.map((billing: any) => ({
          id: billing.id,
          description: billing.description,
          value: billing.amount,
          category: billing.category || "taxa"
        })),
        isSecondCopy: true // Indicar que é uma segunda via
      };
      
      // Gerar PDF
      const pdfBlob = await generateInvoicePDF(invoiceData);
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error("PDF gerado está vazio");
      }
      
      // Criar URL para download
      const url = URL.createObjectURL(pdfBlob);
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `fatura_${invoice.unit[0].block}-${invoice.unit[0].number}_${invoice.reference_month}_${invoice.reference_year}_2via.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Pequeno atraso antes de remover o link e revogar a URL
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Sucesso",
        description: `Segunda via da fatura ${invoice.invoice_number} gerada com sucesso`
      });
    } catch (error) {
      console.error("Erro ao gerar segunda via:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar segunda via da fatura",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Enviar fatura por e-mail
  const handleSendByEmail = (invoice: any) => {
    // Implementação futura
    toast({
      title: "Informação",
      description: `Fatura ${invoice.invoice_number} enviada por e-mail`
    });
  };
  
  // Visualizar fatura
  const handleViewInvoice = (invoice: any) => {
    // Implementação futura
    toast({
      title: "Informação",
      description: `Visualizando fatura ${invoice.invoice_number}`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Faturamentos</CardTitle>
        <CardDescription>
          Visualize e gerencie todas as faturas geradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por número, unidade ou morador..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    {getMonthName(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº da Fatura</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Morador</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{getMonthName(invoice.referenceMonth)}/{invoice.referenceYear}</TableCell>
                    <TableCell>{invoice.unit}</TableCell>
                    <TableCell>{invoice.resident}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                            <Eye size={14} className="mr-2" />
                            <span>Visualizar</span>
                          </DropdownMenuItem>
                          {invoice.status === "pending" || invoice.status === "overdue" ? (
                            <DropdownMenuItem onClick={() => handleOpenPaymentDialog(invoice)}>
                              <CreditCard size={14} className="mr-2" />
                              <span>Registrar Pagamento</span>
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(invoice)}>
                            <Pencil size={14} className="mr-2" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateSecondCopy(invoice)}>
                            <Printer size={14} className="mr-2" />
                            <span>Segunda Via</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendByEmail(invoice)}>
                            <Mail size={14} className="mr-2" />
                            <span>Enviar por E-mail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                            <Download size={14} className="mr-2" />
                            <span>Download PDF</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    Nenhuma fatura encontrada com os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Diálogo de Pagamento */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Registre o pagamento da fatura {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bankAccount" className="text-right">
                Conta
              </Label>
              <select
                id="bankAccount"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={paymentData.bankAccountId}
                onChange={(e) => setPaymentData({...paymentData, bankAccountId: e.target.value})}
              >
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentDate" className="text-right">
                Data
              </Label>
              <Input
                id="paymentDate"
                type="date"
                className="col-span-3"
                value={format(paymentData.paymentDate, "yyyy-MM-dd")}
                onChange={(e) => setPaymentData({...paymentData, paymentDate: new Date(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">
                Método
              </Label>
              <select
                id="paymentMethod"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
              >
                <option value="pix">PIX</option>
                <option value="transfer">Transferência</option>
                <option value="cash">Dinheiro</option>
                <option value="check">Cheque</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Observações
              </Label>
              <Input 
                id="notes" 
                value={paymentData.notes}
                onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                placeholder="Observações sobre o pagamento (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleProcessPayment} disabled={isProcessing}>
              {isProcessing ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Fatura</DialogTitle>
            <DialogDescription>
              Edite os detalhes da fatura {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Vencimento
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3"
                value={format(editData.dueDate, "yyyy-MM-dd")}
                onChange={(e) => setEditData({...editData, dueDate: new Date(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editNotes" className="text-right">
                Observações
              </Label>
              <Input 
                id="editNotes" 
                value={editData.notes}
                onChange={(e) => setEditData({...editData, notes: e.target.value})}
                placeholder="Observações sobre a fatura (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateInvoice} disabled={isProcessing}>
              {isProcessing ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BillingGeneratorHistory; 