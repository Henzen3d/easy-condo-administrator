
import { useState } from "react";
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
  Upload 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Sample data for transactions
const transactions = [
  { 
    id: 1, 
    description: "Pagamento taxa condominial", 
    amount: 450, 
    type: "income", 
    category: "Taxa Condominial", 
    account: "Conta Principal", 
    date: "2023-06-02", 
    unit: "101",
    status: "completed" 
  },
  { 
    id: 2, 
    description: "Manutenção elevador", 
    amount: 1200, 
    type: "expense", 
    category: "Manutenção", 
    account: "Conta Principal", 
    date: "2023-06-01", 
    payee: "ElevaTech",
    status: "completed" 
  },
  { 
    id: 3, 
    description: "Conta de água", 
    amount: 780, 
    type: "expense", 
    category: "Água", 
    account: "Conta Principal", 
    date: "2023-05-28", 
    payee: "Saneamento Municipal",
    status: "completed" 
  },
  { 
    id: 4, 
    description: "Energia elétrica", 
    amount: 550, 
    type: "expense", 
    category: "Energia", 
    account: "Conta Principal", 
    date: "2023-05-25", 
    payee: "Energia S.A.",
    status: "completed" 
  },
  { 
    id: 5, 
    description: "Pagamento taxa condominial", 
    amount: 450, 
    type: "income", 
    category: "Taxa Condominial", 
    account: "Conta Principal", 
    date: "2023-05-23", 
    unit: "204",
    status: "completed" 
  },
  { 
    id: 6, 
    description: "Serviço de segurança", 
    amount: 1500, 
    type: "expense", 
    category: "Segurança", 
    account: "Conta Principal", 
    date: "2023-05-20", 
    payee: "Segurança Total",
    status: "completed" 
  },
  { 
    id: 7, 
    description: "Serviço de limpeza", 
    amount: 650, 
    type: "expense", 
    category: "Limpeza", 
    account: "Conta Principal", 
    date: "2023-05-15", 
    payee: "Clean Service",
    status: "pending" 
  },
  { 
    id: 8, 
    description: "Depósito fundo de reserva", 
    amount: 2000, 
    type: "transfer", 
    category: "Transferência", 
    account: "Conta Principal", 
    to_account: "Fundo de Reserva",
    date: "2023-05-10",
    status: "completed" 
  },
  { 
    id: 9, 
    description: "Pagamento taxa condominial", 
    amount: 450, 
    type: "income", 
    category: "Taxa Condominial", 
    account: "Conta Principal", 
    date: "2023-05-08", 
    unit: "303",
    status: "completed" 
  },
  { 
    id: 10, 
    description: "Pagamento antecipado", 
    amount: 900, 
    type: "income", 
    category: "Taxa Condominial", 
    account: "Conta Principal", 
    date: "2023-05-05", 
    unit: "102",
    status: "completed" 
  }
];

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

export default function Transactions() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter transactions based on active tab and search query
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "income" && transaction.type === "income") ||
      (activeTab === "expense" && transaction.type === "expense") ||
      (activeTab === "transfer" && transaction.type === "transfer");
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchLower) ||
      transaction.category.toLowerCase().includes(searchLower) ||
      transaction.account.toLowerCase().includes(searchLower) ||
      (transaction.unit && transaction.unit.toLowerCase().includes(searchLower)) ||
      (transaction.payee && transaction.payee.toLowerCase().includes(searchLower));
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">Transações</h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-100">
          Gerencie as receitas e despesas do condomínio
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-1">
              <ArrowDownLeftIcon size={14} />
              <span>Receitas</span>
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-1">
              <ArrowUpRightIcon size={14} />
              <span>Despesas</span>
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-1">
              <ArrowUpRightIcon size={14} className="rotate-90" />
              <span>Transferências</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center w-full sm:w-auto gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar transações..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filtrar Transações</DialogTitle>
                <DialogDescription>
                  Defina filtros para encontrar transações específicas.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <div className="relative">
                      <Input type="date" />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <div className="relative">
                      <Input type="date" />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="taxa">Taxa Condominial</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="agua">Água</SelectItem>
                        <SelectItem value="energia">Energia</SelectItem>
                        <SelectItem value="seguranca">Segurança</SelectItem>
                        <SelectItem value="limpeza">Limpeza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="principal">Conta Principal</SelectItem>
                        <SelectItem value="reserva">Fundo de Reserva</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="w-full sm:w-auto">Limpar</Button>
                <Button type="submit" className="w-full sm:w-auto">Aplicar Filtros</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle size={16} />
                <span>Novo</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <Download size={16} />
                <span>Nova Receita</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Upload size={16} />
                <span>Nova Despesa</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <ArrowUpRightIcon size={16} className="rotate-90" />
                <span>Nova Transferência</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback 
                          className={`text-xs ${
                            transaction.type === "income" 
                              ? "bg-emerald-100 text-emerald-700" 
                              : transaction.type === "expense"
                              ? "bg-red-100 text-red-700"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {transaction.type === "income" 
                            ? <ArrowDownLeftIcon size={16} /> 
                            : transaction.type === "expense"
                            ? <ArrowUpRightIcon size={16} />
                            : <ArrowUpRightIcon size={16} className="rotate-90" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.type === "income" 
                            ? `Unidade ${transaction.unit}` 
                            : transaction.type === "expense"
                            ? transaction.payee
                            : `Para: ${transaction.to_account}`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-medium ${getCategoryColor(transaction.category)}`}>
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.account}</TableCell>
                  <TableCell 
                    className={`font-medium ${
                      transaction.type === "income" 
                        ? "text-emerald-600" 
                        : transaction.type === "expense"
                        ? "text-red-600"
                        : "text-indigo-600"
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center gap-2">
                          <PencilIcon size={16} />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                          <Trash2 size={16} />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
