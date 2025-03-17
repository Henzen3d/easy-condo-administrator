import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BanknoteIcon, 
  CreditCard, 
  Eye, 
  EyeOff, 
  PencilIcon, 
  PlusCircle, 
  Trash2,
  AlertCircle,
  ArrowRightLeft,
  BarChart3
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { validarChavePIX } from "@/lib/validators";
import { applyPixKeyMask } from "@/lib/masks";
import { ColorPicker } from "@/components/ui/color-picker";
import { useBankAccounts, BankAccount } from "@/contexts/BankAccountContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Bank account card component
interface BankAccountCardProps {
  account: BankAccount;
  onUpdate: (updatedAccount: BankAccount) => void;
  onDelete: (id: string) => void;
}

function BankAccountCard({ account, onUpdate, onDelete, showBalance, onToggleBalance }: BankAccountCardProps & { showBalance: boolean, onToggleBalance: () => void }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedAccount, setEditedAccount] = useState({ ...account });
  const [pixKeyError, setPixKeyError] = useState<string | null>(null);
  
  // Resetar o formulário de edição quando o diálogo é aberto
  useEffect(() => {
    if (isEditDialogOpen) {
      setEditedAccount({ ...account });
      setPixKeyError(null);
    }
  }, [isEditDialogOpen, account]);

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'before:bg-gradient-to-r before:from-blue-400 before:to-blue-600';
      case 'green':
        return 'before:bg-gradient-to-r before:from-green-400 before:to-green-600';
      case 'amber':
        return 'before:bg-gradient-to-r before:from-amber-400 before:to-amber-600';
      case 'purple':
        return 'before:bg-gradient-to-r before:from-purple-400 before:to-purple-600';
      case 'red':
        return 'before:bg-gradient-to-r before:from-red-400 before:to-red-600';
      default:
        return 'before:bg-gradient-to-r before:from-gray-400 before:to-gray-600';
    }
  };
  
  // Função para validar a chave PIX
  const validatePixKey = (value: string, type: string | null) => {
    if (!type || type === "none") {
      setPixKeyError(null);
      return true;
    }
    
    const result = validarChavePIX(value, type);
    if (!result.valido) {
      setPixKeyError(result.mensagem || "Chave PIX inválida");
      return false;
    }
    
    setPixKeyError(null);
    return true;
  };
  
  // Função para aplicar máscara à chave PIX
  const handlePixKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const type = editedAccount.pixKeyType;
    
    if (!type || type === "none") {
      setEditedAccount({...editedAccount, pixKey: value});
      return;
    }
    
    const maskedValue = applyPixKeyMask(value, type);
    setEditedAccount({...editedAccount, pixKey: maskedValue});
    
    // Validar após a digitação
    validatePixKey(maskedValue, type);
  };
  
  // Função para salvar as alterações
  const handleSaveChanges = () => {
    // Validar a chave PIX antes de salvar
    if (editedAccount.pixKeyType && editedAccount.pixKeyType !== "none") {
      if (!validatePixKey(editedAccount.pixKey || "", editedAccount.pixKeyType)) {
        return;
      }
    }
    
    onUpdate(editedAccount);
    setIsEditDialogOpen(false);
  };
  
  // Função para confirmar a exclusão
  const handleConfirmDelete = () => {
    onDelete(account.id);
    setIsDeleteDialogOpen(false);
  };
  
  // Função para abrir o diálogo de edição com foco no campo de chave PIX
  const handleAddPixKey = () => {
    setEditedAccount({ ...account, pixKeyType: "cpf" }); // Definir um tipo padrão
    setIsEditDialogOpen(true);
    // Usar setTimeout para garantir que o diálogo esteja aberto antes de tentar focar
    setTimeout(() => {
      const pixKeyTypeSelect = document.getElementById("edit-pix-key-type");
      if (pixKeyTypeSelect) {
        (pixKeyTypeSelect as HTMLElement).click();
      }
    }, 100);
  };
  
  // Função para abrir o diálogo de transferência
  const handleTransfer = (fromAccountId: string) => {
    // Emitir um evento personalizado para abrir o diálogo de transferência
    const event = new CustomEvent('openTransferDialog', { 
      detail: { fromAccountId } 
    });
    window.dispatchEvent(event);
  };
  
  return (
    <Card className={`animate-fade-in overflow-hidden relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-6 ${getColorClass(account.color)} flex flex-col h-full`}>
      <CardHeader className="pb-2 pt-8">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{account.name}</CardTitle>
            <CardDescription>{account.bank}</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onToggleBalance}>
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
              <PencilIcon size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 size={16} />
          </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Agência</p>
            <p>{account.agency}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Conta</p>
            <p>{account.accountNumber}</p>
        </div>
          <div>
            <p className="text-muted-foreground">Tipo</p>
            <p>{account.type === "checking" ? "Corrente" : "Poupança"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Saldo</p>
            <p className="font-medium">
              {showBalance ? formatCurrency(account.balance) : "••••••"}
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">Chave PIX</p>
          {account.pixKey ? (
            <p className="text-sm font-medium truncate">
              {account.pixKeyType && (
                <span className="text-xs text-muted-foreground mr-1">
                  ({account.pixKeyType.toUpperCase()})
                </span>
              )}
              {account.pixKey}
            </p>
          ) : (
            <Button 
              variant="link" 
              className="text-sm p-0 h-auto text-primary" 
              onClick={handleAddPixKey}
            >
              + Adicionar chave PIX
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4 py-4 border-t mt-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex items-center gap-1 h-8 rounded-md shadow-sm hover:shadow flex-1 max-w-[140px] justify-center"
          onClick={() => window.location.href = "/transactions?account=" + account.id}
        >
          <BarChart3 size={14} />
          <span>Ver Transações</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex items-center gap-1 h-8 rounded-md shadow-sm hover:shadow flex-1 max-w-[140px] justify-center"
          onClick={() => handleTransfer(account.id)}
        >
          <ArrowRightLeft size={14} />
          <span>Transferir</span>
        </Button>
      </CardFooter>
      
      {/* Diálogo de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conta Bancária</DialogTitle>
            <DialogDescription>
              Atualize os dados da conta bancária.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-account-name">Nome da Conta</Label>
              <Input 
                id="edit-account-name" 
                value={editedAccount.name}
                onChange={(e) => setEditedAccount({...editedAccount, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-bank-name">Banco</Label>
                <Input 
                  id="edit-bank-name" 
                  value={editedAccount.bank}
                  onChange={(e) => setEditedAccount({...editedAccount, bank: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-account-type">Tipo de Conta</Label>
                <Select 
                  value={editedAccount.type}
                  onValueChange={(value) => setEditedAccount({...editedAccount, type: value})}
                >
                  <SelectTrigger id="edit-account-type">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-agency">Agência</Label>
                <Input 
                  id="edit-agency" 
                  value={editedAccount.agency}
                  onChange={(e) => setEditedAccount({...editedAccount, agency: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-account-number">Conta</Label>
                <Input 
                  id="edit-account-number" 
                  value={editedAccount.accountNumber}
                  onChange={(e) => setEditedAccount({...editedAccount, accountNumber: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-balance">Saldo Atual</Label>
                <Input 
                  id="edit-balance" 
                  type="number" 
                  value={editedAccount.balance.toString()}
                  onChange={(e) => setEditedAccount({...editedAccount, balance: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pix-key-type">Tipo de Chave PIX</Label>
                <Select 
                  value={editedAccount.pixKeyType || "none"}
                  onValueChange={(value) => {
                    setEditedAccount({
                      ...editedAccount, 
                      pixKeyType: value === "none" ? null : value,
                      pixKey: value === "none" ? null : editedAccount.pixKey
                    });
                    setPixKeyError(null);
                  }}
                >
                  <SelectTrigger id="edit-pix-key-type">
                    <SelectValue placeholder="Selecione o tipo de chave" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="random">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pix-key">
                Chave PIX
                {editedAccount.pixKeyType && editedAccount.pixKeyType !== "none" && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {editedAccount.pixKeyType === "cpf" && "Formato: 000.000.000-00"}
                    {editedAccount.pixKeyType === "cnpj" && "Formato: 00.000.000/0000-00"}
                    {editedAccount.pixKeyType === "email" && "Formato: exemplo@dominio.com"}
                    {editedAccount.pixKeyType === "phone" && "Formato: (00) 90000-0000"}
                    {editedAccount.pixKeyType === "random" && "Formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input 
                  id="edit-pix-key" 
                  value={editedAccount.pixKey || ""}
                  onChange={handlePixKeyChange}
                  onBlur={() => {
                    if (editedAccount.pixKeyType && editedAccount.pixKeyType !== "none") {
                      validatePixKey(editedAccount.pixKey || "", editedAccount.pixKeyType);
                    }
                  }}
                  disabled={!editedAccount.pixKeyType || editedAccount.pixKeyType === "none"}
                  className={pixKeyError ? "border-red-500 pr-10" : ""}
                />
                {pixKeyError && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {pixKeyError && (
                <p className="text-xs text-red-500 mt-1">{pixKeyError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-account-color">Cor</Label>
              <ColorPicker 
                value={editedAccount.color}
                onChange={(value) => setEditedAccount({...editedAccount, color: value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={handleSaveChanges}
              disabled={!!pixKeyError && editedAccount.pixKeyType !== "none"}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Conta Bancária</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta conta bancária? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function BankAccounts() {
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [pixKeyError, setPixKeyError] = useState<string | null>(null);
  const [showAllBalances, setShowAllBalances] = useState(false);
  const isMobile = useIsMobile();
  
  // Usar o contexto em vez de estados locais
  const { 
    bankAccounts, 
    addBankAccount, 
    updateBankAccount, 
    deleteBankAccount, 
    addTransaction,
    reloadData,
    isLoading
  } = useBankAccounts();
  
  // Estado para o formulário de nova conta
  const [newAccount, setNewAccount] = useState({
    name: "",
    bank: "",
    accountNumber: "",
    agency: "",
    balance: 0,
    type: "checking",
    color: "blue",
    pixKey: "",
    pixKeyType: "none"
  });
  
  // Estado para o formulário de transferência
  const [transferForm, setTransferForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",  // Mudado de 0 para ""
    description: ""
  });

  // Função de formatação de entrada de número
  const formatNumberInput = (value: string) => {
    // Remove tudo que não for número ou vírgula
    value = value.replace(/[^\d,]/g, '');
    
    // Substitui vírgula por ponto para cálculos internos
    const numericValue = value.replace(',', '.');
    
    // Verifica se é um número válido
    if (!isNaN(parseFloat(numericValue))) {
      return value;
    }
    return '';
  };
  
  // Ouvir o evento para abrir o diálogo de transferência
  useEffect(() => {
    const handleOpenTransferDialog = (event: CustomEvent<{ fromAccountId: string }>) => {
      setTransferForm({
        ...transferForm,
        fromAccountId: event.detail.fromAccountId,
        toAccountId: bankAccounts.find(a => a.id !== event.detail.fromAccountId)?.id || ""
      });
      setIsTransferDialogOpen(true);
    };
    
    window.addEventListener('openTransferDialog', handleOpenTransferDialog as EventListener);
    
    return () => {
      window.removeEventListener('openTransferDialog', handleOpenTransferDialog as EventListener);
    };
  }, [bankAccounts, transferForm]);
  
  // Filtrar contas por tipo
  const filteredAccounts = activeTab === "all" 
    ? bankAccounts 
    : bankAccounts.filter(account => account.type === activeTab);
  
  // Função para adicionar nova conta
  const handleAddAccount = () => {
    // Validar campos obrigatórios
    if (!newAccount.name || !newAccount.bank || !newAccount.accountNumber || !newAccount.agency) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    // Garantir que o balance seja um número
    const balance = typeof newAccount.balance === 'string' 
      ? parseFloat(newAccount.balance.toString().replace(',', '.')) 
      : newAccount.balance || 0;

    // Preparar dados para salvar
    const accountToSave = {
      name: newAccount.name.trim(),
      bank: newAccount.bank.trim(),
      accountNumber: newAccount.accountNumber.trim(),
      agency: newAccount.agency.trim(),
      balance: balance,
      type: newAccount.type || "checking",
      color: newAccount.color || "blue",
      pixKey: newAccount.pixKeyType === "none" ? null : newAccount.pixKey?.trim(),
      pixKeyType: newAccount.pixKeyType === "none" ? null : newAccount.pixKeyType
    };
    
    // Adicionar conta usando o contexto
    addBankAccount(accountToSave);
    
    // Resetar o formulário
    setIsNewAccountDialogOpen(false);
    setNewAccount({
      name: "",
      bank: "",
      accountNumber: "",
      agency: "",
      balance: 0,
      type: "checking",
      color: "blue",
      pixKey: "",
      pixKeyType: "none"
    });
  };
  
  // Função para realizar a transferência entre contas
  const handleExecuteTransfer = async () => {
    try {
      // Converter o valor para número (substituindo vírgula por ponto)
      const amountStr = transferForm.amount.replace(',', '.');
      const amount = parseFloat(amountStr);

      // Validar o formulário
      if (isNaN(amount) || amount <= 0) {
        toast.error("O valor da transferência deve ser maior que zero");
        return;
      }

      if (transferForm.fromAccountId === transferForm.toAccountId) {
        toast.error("As contas de origem e destino devem ser diferentes");
        return;
      }

      // Encontrar as contas
      const fromAccount = bankAccounts.find(a => a.id === transferForm.fromAccountId);
      const toAccount = bankAccounts.find(a => a.id === transferForm.toAccountId);

      if (!fromAccount || !toAccount) {
        toast.error("Conta não encontrada");
        return;
      }

      // Verificar se há saldo suficiente
      if (fromAccount.balance < amount) {
        toast.error("Saldo insuficiente para realizar a transferência");
        return;
      }

      // Obter a data atual no formato correto (YYYY-MM-DD)
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      // Criar a transação - IMPORTANTE: usar amountStr com ponto decimal
      const transaction = {
        description: transferForm.description || `Transferência de ${fromAccount.name} para ${toAccount.name}`,
        amount: amountStr, // Usar o valor com ponto decimal
        type: "transfer" as const,
        category: "Transferência",
        account: fromAccount.id.toString(),
        to_account: toAccount.id.toString(),
        date: formattedDate,
        status: "completed",
        payee: toAccount.name,
        unit: ""
      };
      
      // Adicionar a transação usando o contexto
      await addTransaction(transaction);
      
      // Fechar o diálogo e resetar o formulário
      setIsTransferDialogOpen(false);
      setTransferForm({
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        description: ""
      });
      
      toast.success(`Transferência de ${fromAccount.name} para ${toAccount.name} realizada com sucesso`);
    } catch (error) {
      console.error("Erro ao realizar transferência:", error);
      toast.error("Erro ao realizar transferência");
    }
  };
  
  // Função para alternar a visibilidade de todos os saldos
  const toggleAllBalances = () => {
    setShowAllBalances(!showAllBalances);
  };

  // Função para gerar a descrição automática
  const generateTransferDescription = (fromAccountId: string, toAccountId: string) => {
    const fromAccount = bankAccounts.find(a => a.id === fromAccountId);
    const toAccount = bankAccounts.find(a => a.id === toAccountId);
    
    if (fromAccount && toAccount) {
      return `Transferência da ${fromAccount.name} para ${toAccount.name}`;
    }
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Contas Bancárias</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={toggleAllBalances}
            >
              {showAllBalances ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{showAllBalances ? "Esconder Saldos" : "Mostrar Saldos"}</span>
            </Button>
            {!isMobile && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => reloadData()}
                disabled={isLoading}
              >
                <ArrowRightLeft size={16} className={isLoading ? "animate-spin" : ""} />
                <span>{isLoading ? "Atualizando..." : "Atualizar Dados"}</span>
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">
          Gerencie as contas bancárias do condomínio
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="checking">Corrente</TabsTrigger>
            <TabsTrigger value="savings">Poupança</TabsTrigger>
          </TabsList>
        </Tabs>

        <Dialog open={isNewAccountDialogOpen} onOpenChange={setIsNewAccountDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 animate-fade-in">
              <PlusCircle size={16} />
              <span>Nova Conta</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Conta Bancária</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova conta bancária do condomínio.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="account-name">Nome da Conta</Label>
                <Input 
                  id="account-name" 
                  placeholder="Ex: Conta Principal" 
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Banco</Label>
                  <Input 
                    id="bank-name" 
                    placeholder="Ex: Banco do Brasil" 
                    value={newAccount.bank}
                    onChange={(e) => setNewAccount({...newAccount, bank: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-type">Tipo de Conta</Label>
                  <Select 
                    value={newAccount.type}
                    onValueChange={(value) => setNewAccount({...newAccount, type: value})}
                  >
                    <SelectTrigger id="account-type">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Corrente</SelectItem>
                      <SelectItem value="savings">Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agency">Agência</Label>
                  <Input 
                    id="agency" 
                    placeholder="Ex: 1234" 
                    value={newAccount.agency}
                    onChange={(e) => setNewAccount({...newAccount, agency: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-number">Conta</Label>
                  <Input 
                    id="account-number" 
                    placeholder="Ex: 12345-6" 
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initial-balance">Saldo Inicial</Label>
                  <Input 
                    id="initial-balance" 
                    type="number" 
                    placeholder="0,00" 
                    value={newAccount.balance.toString()}
                    onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pix-key-type">Tipo de Chave PIX</Label>
                  <Select 
                    value={newAccount.pixKeyType || "none"}
                    onValueChange={(value) => {
                      setNewAccount({
                        ...newAccount, 
                        pixKeyType: value === "none" ? "" : value,
                        pixKey: value === "none" ? "" : newAccount.pixKey
                      });
                      setPixKeyError(null);
                    }}
                  >
                    <SelectTrigger id="pix-key-type">
                      <SelectValue placeholder="Selecione o tipo de chave" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="random">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pix-key">
                  Chave PIX
                  {newAccount.pixKeyType && newAccount.pixKeyType !== "none" && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {newAccount.pixKeyType === "cpf" && "Formato: 000.000.000-00"}
                      {newAccount.pixKeyType === "cnpj" && "Formato: 00.000.000/0000-00"}
                      {newAccount.pixKeyType === "email" && "Formato: exemplo@dominio.com"}
                      {newAccount.pixKeyType === "phone" && "Formato: (00) 90000-0000"}
                      {newAccount.pixKeyType === "random" && "Formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input 
                    id="pix-key" 
                    placeholder="Digite a chave PIX" 
                    value={newAccount.pixKey}
                    onChange={(e) => setNewAccount({...newAccount, pixKey: e.target.value})}
                    onBlur={() => {
                      if (newAccount.pixKeyType && newAccount.pixKeyType !== "none") {
                        validatePixKey(newAccount.pixKey, newAccount.pixKeyType);
                      }
                    }}
                    disabled={!newAccount.pixKeyType || newAccount.pixKeyType === "none"}
                    className={pixKeyError ? "border-red-500 pr-10" : ""}
                  />
                  {pixKeyError && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {pixKeyError && (
                  <p className="text-xs text-red-500 mt-1">{pixKeyError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-color">Cor</Label>
                <ColorPicker 
                  value={newAccount.color}
                  onChange={(value) => setNewAccount({...newAccount, color: value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewAccountDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                onClick={handleAddAccount}
                disabled={!!pixKeyError && newAccount.pixKeyType !== "none"}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAccounts.map((account) => (
          <BankAccountCard 
            key={account.id} 
            account={account} 
            onUpdate={updateBankAccount}
            onDelete={deleteBankAccount}
            showBalance={showAllBalances}
            onToggleBalance={toggleAllBalances}
          />
        ))}
        
        <Card className="flex flex-col items-center justify-center border-dashed p-6 transition-all hover:bg-gray-50 animate-fade-in cursor-pointer relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-6 before:bg-gradient-to-r before:from-primary/40 before:to-primary/60 h-full" onClick={() => setIsNewAccountDialogOpen(true)}>
          <div className="flex flex-col items-center gap-2 text-center pt-2">
            <div className="rounded-full bg-primary-50 p-3">
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Adicionar Conta</h3>
            <p className="text-sm text-muted-foreground">
              Adicione uma nova conta bancária para o condomínio
            </p>
          </div>
        </Card>
      </div>
      
      {/* Diálogo de Transferência */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferência entre Contas</DialogTitle>
            <DialogDescription>
              Transfira valores entre suas contas bancárias.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="from-account">Conta de Origem</Label>
              <Select 
                value={transferForm.fromAccountId}
                onValueChange={(value) => {
                  const newDescription = generateTransferDescription(value, transferForm.toAccountId);
                  setTransferForm({
                    ...transferForm, 
                    fromAccountId: value,
                    description: newDescription
                  });
                }}
              >
                <SelectTrigger id="from-account">
                  <SelectValue placeholder="Selecione a conta de origem" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-account">Conta de Destino</Label>
              <Select 
                value={transferForm.toAccountId}
                onValueChange={(value) => {
                  const newDescription = generateTransferDescription(transferForm.fromAccountId, value);
                  setTransferForm({
                    ...transferForm, 
                    toAccountId: value,
                    description: newDescription
                  });
                }}
              >
                <SelectTrigger id="to-account">
                  <SelectValue placeholder="Selecione a conta de destino" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts
                    .filter(account => account.id !== transferForm.fromAccountId)
                    .map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {formatCurrency(account.balance)}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-amount">Valor</Label>
              <Input 
                id="transfer-amount" 
                type="text"  // Mudado de number para text
                placeholder="0,00" 
                value={transferForm.amount}
                onChange={(e) => {
                  const formattedValue = formatNumberInput(e.target.value);
                  setTransferForm({...transferForm, amount: formattedValue});
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-description">Descrição</Label>
              <Input 
                id="transfer-description" 
                value={transferForm.description}
                readOnly
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={handleExecuteTransfer}
              disabled={
                !transferForm.amount || 
                parseFloat(transferForm.amount.replace(',', '.')) <= 0 || 
                transferForm.fromAccountId === transferForm.toAccountId
              }
            >
              Transferir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Espaço adicional para evitar sobreposição do menu flutuante */}
      <div className="h-20" />
    </div>
  );
}
