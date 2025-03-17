import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowDownLeftIcon, 
  ArrowUpRightIcon, 
  Calendar, 
  Download, 
  Filter, 
  MoreHorizontal, 
  PencilIcon, 
  PlusCircle, 
  Search, 
  Trash2, 
  Upload,
  Building,
  User,
  CreditCard,
  Eye,
  ArrowRightLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useBankAccounts, Transaction, BankAccount } from "@/contexts/BankAccountContext";

// Function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(date);
};

// Function to get category color
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Taxa Condominial": "bg-emerald-100 text-emerald-800",
    "Manutenção": "bg-amber-100 text-amber-800",
    "Água": "bg-blue-100 text-blue-800",
    "Energia": "bg-yellow-100 text-yellow-800",
    "Segurança": "bg-purple-100 text-purple-800",
    "Limpeza": "bg-green-100 text-green-800",
    "Transferência": "bg-indigo-100 text-indigo-800",
    "Outros": "bg-gray-100 text-gray-800",
  };
  
  return colors[category] || colors["Outros"];
};

// Function to get transaction type badge
const getTransactionBadge = (type: string) => {
  if (type === "income") {
    return (
      <Badge variant="outline" className="border-emerald-500 text-emerald-600 flex items-center gap-1">
        <ArrowDownLeftIcon size={12} />
        <span>Receita</span>
      </Badge>
    );
  } else if (type === "expense") {
    return (
      <Badge variant="outline" className="border-red-500 text-red-600 flex items-center gap-1">
        <ArrowUpRightIcon size={12} />
        <span>Despesa</span>
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="border-indigo-500 text-indigo-600 flex items-center gap-1">
        <ArrowUpRightIcon size={12} className="rotate-90" />
        <span>Transferência</span>
      </Badge>
    );
  }
};

// Function to get status badge
const getStatusBadge = (status: string) => {
  if (status === "completed") {
    return (
      <Badge variant="outline" className="border-emerald-500 bg-emerald-50 text-emerald-600">
        Concluída
      </Badge>
    );
  } else if (status === "pending") {
    return (
      <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-600">
        Pendente
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="border-red-500 bg-red-50 text-red-600">
        Cancelada
      </Badge>
    );
  }
};

// Contas bancárias disponíveis (em um ambiente real, isso viria do banco de dados)
const bankAccounts: BankAccount[] = [
  { id: "principal", name: "Conta Principal", balance: 18450.75 },
  { id: "reserva", name: "Fundo de Reserva", balance: 42680.30 },
  { id: "manutencao", name: "Manutenção", balance: 12780.45 }
];

export default function Transactions() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'income' | 'expense' | 'transfer' | null>(null);
  
  // Usar o contexto em vez de estados locais
  const { 
    bankAccounts, 
    transactions, 
    addTransaction, 
    getBankAccountById: getAccountById,
    confirmPayment,
    deleteTransaction,
    reloadData,
    isLoading
  } = useBankAccounts();
  
  const searchParams = useSearchParams()[0];
  const navigate = useNavigate();
  
  // Verificar se há um parâmetro de conta na URL
  useEffect(() => {
    const accountParam = searchParams.get('account');
    if (accountParam) {
      // Filtrar transações por conta
      const account = getAccountById(accountParam);
      if (account) {
        setSearchQuery(account.name);
      }
    }
  }, [searchParams, getAccountById]);
  
  // Estados para os formulários
  const [incomeForm, setIncomeForm] = useState({
    description: "",
    amount: "",
    category: "none",
    account: "none",
    date: new Date().toISOString().split('T')[0],
    unit: "none",
    status: "completed"
  });
  
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "none",
    account: "none",
    date: new Date().toISOString().split('T')[0],
    payee: "",
    status: "completed"
  });
  
  const [transferForm, setTransferForm] = useState({
    description: "",
    amount: "",
    fromAccount: "none",
    toAccount: "none",
    date: new Date().toISOString().split('T')[0],
    status: "completed"
  });
  
  // Categorias de receitas
  const incomeCategories = [
    { id: "taxa", name: "Taxa Condominial" },
    { id: "multa", name: "Multa" },
    { id: "aluguel", name: "Aluguel de Espaço" },
    { id: "juros", name: "Juros" },
    { id: "outros", name: "Outros" }
  ];
  
  // Categorias de despesas
  const expenseCategories = [
    { id: "manutencao", name: "Manutenção" },
    { id: "agua", name: "Água" },
    { id: "energia", name: "Energia" },
    { id: "seguranca", name: "Segurança" },
    { id: "limpeza", name: "Limpeza" },
    { id: "salarios", name: "Salários" },
    { id: "impostos", name: "Impostos" },
    { id: "outros", name: "Outros" }
  ];
  
  // Unidades disponíveis (em um ambiente real, isso viria do banco de dados)
  const units = [
    { id: "101", name: "101 - Bloco A" },
    { id: "102", name: "102 - Bloco A" },
    { id: "201", name: "201 - Bloco A" },
    { id: "202", name: "202 - Bloco A" },
    { id: "101b", name: "101 - Bloco B" },
    { id: "102b", name: "102 - Bloco B" }
  ];
  
  // Função para adicionar uma nova receita
  const handleAddIncome = async () => {
    // Validar campos obrigatórios
    if (!incomeForm.description || !incomeForm.amount || incomeForm.category === "none" || incomeForm.account === "none") {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    const amount = parseFloat(incomeForm.amount);
    const account = bankAccounts.find(a => a.id === incomeForm.account);
    
    if (!account) {
      toast.error("Conta bancária não encontrada");
      return;
    }
    
    // Garantir que a data está no formato correto (YYYY-MM-DD)
    const formattedDate = incomeForm.date ? new Date(incomeForm.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // Criar nova transação
    const newTransaction: Omit<Transaction, 'id'> = {
      description: incomeForm.description,
      amount: amount,
      type: "income",
      category: incomeCategories.find(c => c.id === incomeForm.category)?.name || incomeForm.category,
      account: account.id.toString(), // Usar o ID da conta em vez do nome
      date: formattedDate,
      unit: incomeForm.unit === "none" ? "" : incomeForm.unit,
      status: incomeForm.status,
      payee: "" // Campo obrigatório, mesmo que vazio
    };
    
    // Adicionar transação usando o contexto
    await addTransaction(newTransaction);
    
    // Fechar o diálogo e resetar o formulário
    setIsIncomeDialogOpen(false);
    setIncomeForm({
      description: "",
      amount: "",
      category: "none",
      account: "none",
      date: new Date().toISOString().split('T')[0],
      unit: "none",
      status: "completed"
    });
    
    toast.success(`Receita adicionada com sucesso`);
  };
  
  // Função para adicionar uma nova despesa
  const handleAddExpense = async () => {
    // Validar campos obrigatórios
    if (!expenseForm.description || !expenseForm.amount || expenseForm.category === "none" || expenseForm.account === "none") {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    const amount = parseFloat(expenseForm.amount);
    const account = bankAccounts.find(a => a.id === expenseForm.account);
    
    if (!account) {
      toast.error("Conta bancária não encontrada");
      return;
    }
    
    // Verificar se há saldo suficiente apenas para transações concluídas
    if (expenseForm.status === "completed" && account.balance < amount) {
      toast.error("Saldo insuficiente para realizar esta despesa. Considere marcar como pendente.");
      return;
    }
    
    // Garantir que a data está no formato correto (YYYY-MM-DD)
    const formattedDate = expenseForm.date ? new Date(expenseForm.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // Criar nova transação
    const newTransaction: Omit<Transaction, 'id'> = {
      description: expenseForm.description,
      amount: amount,
      type: "expense",
      category: expenseCategories.find(c => c.id === expenseForm.category)?.name || expenseForm.category,
      account: account.id.toString(), // Usar o ID da conta em vez do nome
      date: formattedDate,
      payee: expenseForm.payee || "",
      status: expenseForm.status,
      unit: "" // Campo obrigatório, mesmo que vazio
    };
    
    // Adicionar transação usando o contexto
    await addTransaction(newTransaction);
    
    // Fechar o diálogo e resetar o formulário
    setIsExpenseDialogOpen(false);
    setExpenseForm({
      description: "",
      amount: "",
      category: "none",
      account: "none",
      date: new Date().toISOString().split('T')[0],
      payee: "",
      status: "completed"
    });
    
    toast.success(`Despesa adicionada com sucesso`);
  };
  
  // Função para adicionar uma nova transferência
  const handleAddTransfer = async () => {
    // Validar campos obrigatórios
    if (!transferForm.amount || transferForm.fromAccount === "none" || transferForm.toAccount === "none") {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    if (transferForm.fromAccount === transferForm.toAccount) {
      toast.error("As contas de origem e destino devem ser diferentes");
      return;
    }
    
    const amount = parseFloat(transferForm.amount);
    const fromAccount = bankAccounts.find(a => a.id === transferForm.fromAccount);
    const toAccount = bankAccounts.find(a => a.id === transferForm.toAccount);
    
    if (!fromAccount || !toAccount) {
      toast.error("Conta bancária não encontrada");
      return;
    }
    
    // Verificar se há saldo suficiente apenas para transações concluídas
    if (transferForm.status === "completed" && fromAccount.balance < amount) {
      toast.error("Saldo insuficiente para realizar esta transferência. Considere marcar como pendente.");
      return;
    }
    
    // Garantir que a data está no formato correto (YYYY-MM-DD)
    const formattedDate = transferForm.date ? new Date(transferForm.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // Criar nova transação
    const newTransaction: Omit<Transaction, 'id'> = {
      description: transferForm.description || `Transferência de ${fromAccount.name} para ${toAccount.name}`,
      amount: amount,
      type: "transfer",
      category: "Transferência",
      account: fromAccount.id.toString(), // Usar o ID da conta em vez do nome
      to_account: toAccount.id.toString(), // Usar o ID da conta em vez do nome
      date: formattedDate,
      status: transferForm.status,
      payee: toAccount.name, // Adicionar o destinatário
      unit: "" // Campo obrigatório, mesmo que vazio
    };
    
    // Adicionar transação usando o contexto
    await addTransaction(newTransaction);
    
    // Fechar o diálogo e resetar o formulário
    setIsTransferDialogOpen(false);
    setTransferForm({
      description: "",
      amount: "",
      fromAccount: "none",
      toAccount: "none",
      date: new Date().toISOString().split('T')[0],
      status: "completed"
    });
    
    toast.success(`Transferência de ${fromAccount.name} para ${toAccount.name} adicionada com sucesso`);
  };

  // Função para obter o nome da conta pelo ID
  const getAccountName = (accountId: string) => {
    const account = bankAccounts.find(a => a.id.toString() === accountId);
    return account ? account.name : accountId;
  };

  // Filter transactions based on active tab, status filter, and search query
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "income" && transaction.type === "income") ||
      (activeTab === "expense" && transaction.type === "expense") ||
      (activeTab === "transfer" && transaction.type === "transfer") ||
      (activeTab === "pending" && transaction.status === "pending");
    
    const matchesStatus = 
      statusFilter === "all" || 
      transaction.status === statusFilter;
    
    const searchLower = searchQuery.toLowerCase();
    
    // Obter os nomes das contas para pesquisa
    const accountName = getAccountName(transaction.account).toLowerCase();
    const toAccountName = transaction.to_account ? getAccountName(transaction.to_account).toLowerCase() : "";
    
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchLower) ||
      transaction.category.toLowerCase().includes(searchLower) ||
      accountName.includes(searchLower) ||
      toAccountName.includes(searchLower) ||
      (transaction.unit && transaction.unit.toLowerCase().includes(searchLower)) ||
      (transaction.payee && transaction.payee.toLowerCase().includes(searchLower));
    
    return matchesTab && matchesStatus && matchesSearch;
  });

  // Função para limpar os filtros
  const handleClearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setActiveTab("all");
    setIsFilterDialogOpen(false);
  };

  // Função para abrir o diálogo apropriado
  const handleNewTransaction = () => {
    // Por padrão, abre o diálogo de receita
    setIsIncomeDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">
          Transações
        </h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-100">
          Gerencie as receitas e despesas do condomínio
        </p>
      </div>

      {/* Tabs e Ações - Layout responsivo */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} className="w-full sm:w-auto" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 sm:w-auto">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-1">
              <ArrowDownLeftIcon size={14} className="hidden sm:inline-block" />
              <span>Receitas</span>
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-1">
              <ArrowUpRightIcon size={14} className="hidden sm:inline-block" />
              <span>Despesas</span>
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-1">
              <ArrowUpRightIcon size={14} className="hidden sm:inline-block rotate-90" />
              <span>Transf.</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setIsFilterDialogOpen(true)}>
            <Filter size={16} className="mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
          <Button 
            size="sm" 
            className="flex-1 sm:flex-none"
            onClick={handleNewTransaction}
          >
            <PlusCircle size={16} className="mr-2" />
            Nova
          </Button>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar transação..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabela responsiva */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{transaction.description}</span>
                    {/* Informações extras para mobile */}
                    <div className="flex flex-col gap-1 sm:hidden">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </span>
                      <Badge variant="outline" className="w-fit">
                        {transaction.category}
                      </Badge>
                      <span className="text-sm">
                        {getStatusBadge(transaction.status)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className={getCategoryColor(transaction.category)}>
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    transaction.type === 'income' ? 'text-emerald-600' : 
                    transaction.type === 'expense' ? 'text-red-600' : 
                    'text-indigo-600'
                  }`}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {getStatusBadge(transaction.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <PencilIcon className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Diálogo de Nova Receita */}
      <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download size={18} className="text-emerald-500" />
              <span>Nova Receita</span>
            </DialogTitle>
            <DialogDescription>
              Adicione uma nova receita ao condomínio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="income-description">Descrição</Label>
              <Input 
                id="income-description" 
                placeholder="Ex: Pagamento taxa condominial" 
                value={incomeForm.description}
                onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income-amount">Valor (R$)</Label>
                <Input 
                  id="income-amount" 
                  type="number" 
                  placeholder="0,00" 
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-date">Data</Label>
                <div className="relative">
                  <Input 
                    id="income-date" 
                    type="date" 
                    value={incomeForm.date}
                    onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income-category">Categoria</Label>
                <Select 
                  value={incomeForm.category}
                  onValueChange={(value) => setIncomeForm({...incomeForm, category: value})}
                >
                  <SelectTrigger id="income-category">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-account">Conta</Label>
                <Select 
                  value={incomeForm.account}
                  onValueChange={(value) => setIncomeForm({...incomeForm, account: value})}
                >
                  <SelectTrigger id="income-account">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income-unit">Unidade (opcional)</Label>
                <Select 
                  value={incomeForm.unit}
                  onValueChange={(value) => setIncomeForm({...incomeForm, unit: value})}
                >
                  <SelectTrigger id="income-unit">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-status">Status</Label>
                <Select 
                  value={incomeForm.status}
                  onValueChange={(value) => setIncomeForm({...incomeForm, status: value})}
                >
                  <SelectTrigger id="income-status">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleAddIncome}
            >
              Adicionar Receita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Nova Despesa */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload size={18} className="text-red-500" />
              <span>Nova Despesa</span>
            </DialogTitle>
            <DialogDescription>
              Adicione uma nova despesa ao condomínio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expense-description">Descrição</Label>
              <Input 
                id="expense-description" 
                placeholder="Ex: Manutenção elevador" 
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Valor (R$)</Label>
                <Input 
                  id="expense-amount" 
                  type="number" 
                  placeholder="0,00" 
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date">Data</Label>
                <div className="relative">
                  <Input 
                    id="expense-date" 
                    type="date" 
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-category">Categoria</Label>
                <Select 
                  value={expenseForm.category}
                  onValueChange={(value) => setExpenseForm({...expenseForm, category: value})}
                >
                  <SelectTrigger id="expense-category">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-account">Conta</Label>
                <Select 
                  value={expenseForm.account}
                  onValueChange={(value) => setExpenseForm({...expenseForm, account: value})}
                >
                  <SelectTrigger id="expense-account">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-payee">Beneficiário (opcional)</Label>
                <Input 
                  id="expense-payee" 
                  placeholder="Ex: Fornecedor XYZ" 
                  value={expenseForm.payee}
                  onChange={(e) => setExpenseForm({...expenseForm, payee: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-status">Status</Label>
                <Select 
                  value={expenseForm.status}
                  onValueChange={(value) => setExpenseForm({...expenseForm, status: value})}
                >
                  <SelectTrigger id="expense-status">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleAddExpense}
            >
              Adicionar Despesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Nova Transferência */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRightIcon size={18} className="rotate-90 text-indigo-500" />
              <span>Nova Transferência</span>
            </DialogTitle>
            <DialogDescription>
              Transfira valores entre contas do condomínio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-description">Descrição (opcional)</Label>
              <Input 
                id="transfer-description" 
                placeholder="Ex: Transferência para fundo de reserva" 
                value={transferForm.description}
                onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Valor (R$)</Label>
                <Input 
                  id="transfer-amount" 
                  type="number" 
                  placeholder="0,00" 
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-date">Data</Label>
                <div className="relative">
                  <Input 
                    id="transfer-date" 
                    type="date" 
                    value={transferForm.date}
                    onChange={(e) => setTransferForm({...transferForm, date: e.target.value})}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-from">Conta de Origem</Label>
                <Select 
                  value={transferForm.fromAccount}
                  onValueChange={(value) => setTransferForm({...transferForm, fromAccount: value})}
                >
                  <SelectTrigger id="transfer-from">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-to">Conta de Destino</Label>
                <Select 
                  value={transferForm.toAccount}
                  onValueChange={(value) => setTransferForm({...transferForm, toAccount: value})}
                >
                  <SelectTrigger id="transfer-to">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts
                      .filter(account => account.id !== transferForm.fromAccount || transferForm.fromAccount === "none")
                      .map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-status">Status</Label>
              <Select 
                value={transferForm.status}
                onValueChange={(value) => setTransferForm({...transferForm, status: value})}
              >
                <SelectTrigger id="transfer-status">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleAddTransfer}
            >
              Adicionar Transferência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Espaço adicional para evitar sobreposição do menu flutuante */}
      <div className="h-20" />
    </div>
  );
}
