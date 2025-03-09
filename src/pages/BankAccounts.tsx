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
import { supabase } from "@/integrations/supabase/client";

// Sample data for bank accounts
const initialBankAccounts = [
  { 
    id: 1, 
    name: "Conta Principal", 
    bank: "Banco do Brasil", 
    accountNumber: "12345-6", 
    agency: "1234", 
    balance: 18450.75, 
    type: "checking",
    color: "blue",
    pixKey: "condominio@email.com",
    pixKeyType: "email"
  },
  { 
    id: 2, 
    name: "Reserva", 
    bank: "Caixa Econômica", 
    accountNumber: "98765-4", 
    agency: "5678", 
    balance: 42680.30, 
    type: "savings",
    color: "green",
    pixKey: "12345678901",
    pixKeyType: "cpf"
  },
  { 
    id: 3, 
    name: "Fundo de Obras", 
    bank: "Itaú", 
    accountNumber: "45678-9", 
    agency: "9012", 
    balance: 75320.15, 
    type: "checking",
    color: "amber",
    pixKey: null,
    pixKeyType: null
  },
];

// Function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Bank account card component
interface BankAccountCardProps {
  account: typeof initialBankAccounts[0];
  onUpdate: (updatedAccount: typeof initialBankAccounts[0]) => void;
  onDelete: (id: number) => void;
}

function BankAccountCard({ account, onUpdate, onDelete }: BankAccountCardProps) {
  const [showBalance, setShowBalance] = useState(false);
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
  const handleTransfer = (fromAccountId: number) => {
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
            <Button variant="ghost" size="icon" onClick={() => setShowBalance(!showBalance)}>
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
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts);
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
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
  const [activeTab, setActiveTab] = useState("all");
  const [pixKeyError, setPixKeyError] = useState<string | null>(null);
  
  // Estado para o formulário de transferência
  const [transferForm, setTransferForm] = useState({
    fromAccountId: 0,
    toAccountId: 0,
    amount: 0,
    description: ""
  });
  
  // Ouvir o evento para abrir o diálogo de transferência
  useEffect(() => {
    const handleOpenTransferDialog = (event: CustomEvent<{ fromAccountId: number }>) => {
      setTransferForm({
        ...transferForm,
        fromAccountId: event.detail.fromAccountId,
        toAccountId: bankAccounts.find(a => a.id !== event.detail.fromAccountId)?.id || 0
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

  // Função para validar a chave PIX
  const validatePixKey = (value: string, type: string) => {
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
    const type = newAccount.pixKeyType;
    
    if (!type || type === "none") {
      setNewAccount({...newAccount, pixKey: value});
      return;
    }
    
    const maskedValue = applyPixKeyMask(value, type);
    setNewAccount({...newAccount, pixKey: maskedValue});
    
    // Validar após a digitação
    validatePixKey(maskedValue, type);
  };

  // Função para adicionar nova conta
  const handleAddAccount = () => {
    // Validar campos obrigatórios
    if (!newAccount.name || !newAccount.bank || !newAccount.accountNumber || !newAccount.agency) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    // Validar a chave PIX
    if (newAccount.pixKeyType && newAccount.pixKeyType !== "none") {
      if (!validatePixKey(newAccount.pixKey, newAccount.pixKeyType)) {
        return;
      }
    }
    
    // Preparar dados para salvar
    const accountToSave = {
      ...newAccount,
      pixKeyType: newAccount.pixKeyType === "none" ? null : newAccount.pixKeyType,
      pixKey: newAccount.pixKeyType === "none" ? null : newAccount.pixKey
    };
    
    const newId = Math.max(...bankAccounts.map(a => a.id), 0) + 1;
    setBankAccounts([...bankAccounts, { ...accountToSave, id: newId }]);
    setIsNewAccountDialogOpen(false);
    
    // Resetar o formulário
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
    setPixKeyError(null);
    
    toast.success("Conta bancária adicionada com sucesso");
  };

  // Função para atualizar uma conta existente
  const handleUpdateAccount = (updatedAccount: typeof bankAccounts[0]) => {
    setBankAccounts(bankAccounts.map(account => 
      account.id === updatedAccount.id ? updatedAccount : account
    ));
    
    toast.success("Conta bancária atualizada com sucesso");
  };

  // Função para excluir uma conta
  const handleDeleteAccount = (id: number) => {
    setBankAccounts(bankAccounts.filter(account => account.id !== id));
    
    toast.success("Conta bancária excluída com sucesso");
  };

  // Função para realizar a transferência entre contas
  const handleExecuteTransfer = async () => {
    try {
      // Validar o formulário
      if (transferForm.amount <= 0) {
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
      if (fromAccount.balance < transferForm.amount) {
        toast.error("Saldo insuficiente para realizar a transferência");
        return;
      }
      
      // Atualizar os saldos
      const updatedFromAccount = {
        ...fromAccount,
        balance: fromAccount.balance - transferForm.amount
      };
      
      const updatedToAccount = {
        ...toAccount,
        balance: toAccount.balance + transferForm.amount
      };
      
      // Atualizar o estado local
      setBankAccounts(bankAccounts.map(account => {
        if (account.id === fromAccount.id) return updatedFromAccount;
        if (account.id === toAccount.id) return updatedToAccount;
        return account;
      }));
      
      // Registrar as transações localmente
      const today = new Date().toISOString().split('T')[0];
      const descriptionFrom = transferForm.description || `Transferência para ${toAccount.name}`;
      const descriptionTo = transferForm.description || `Transferência de ${fromAccount.name}`;
      
      // Simular o registro de transações (em um ambiente real, isso seria feito no banco de dados)
      // Aqui estamos apenas simulando o registro para fins de demonstração
      console.log("Transação registrada (saída):", {
        account: fromAccount.id.toString(),
        amount: transferForm.amount,
        category: 'Transferência',
        date: today,
        description: descriptionFrom,
        payee: toAccount.name,
        status: 'completed',
        type: 'expense',
        to_account: toAccount.id.toString()
      });
      
      console.log("Transação registrada (entrada):", {
        account: toAccount.id.toString(),
        amount: transferForm.amount,
        category: 'Transferência',
        date: today,
        description: descriptionTo,
        payee: fromAccount.name,
        status: 'completed',
        type: 'income',
        to_account: fromAccount.id.toString()
      });
      
      // Em um ambiente real, você atualizaria o banco de dados aqui
      // Descomente o código abaixo para ativar a integração com o Supabase
      
      try {
        // Atualizar a conta de origem
        const { error: fromError } = await supabase
          .from('bank_accounts')
          .update({ balance: updatedFromAccount.balance })
          .eq('id', fromAccount.id);
          
        if (fromError) throw fromError;
        
        // Atualizar a conta de destino
        const { error: toError } = await supabase
          .from('bank_accounts')
          .update({ balance: updatedToAccount.balance })
          .eq('id', toAccount.id);
          
        if (toError) throw toError;
        
        // Registrar a transação
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              account: fromAccount.id.toString(),
              amount: transferForm.amount,
              category: 'Transferência',
              date: today,
              description: descriptionFrom,
              payee: toAccount.name,
              status: 'completed',
              type: 'expense',
              to_account: toAccount.id.toString()
            },
            {
              account: toAccount.id.toString(),
              amount: transferForm.amount,
              category: 'Transferência',
              date: today,
              description: descriptionTo,
              payee: fromAccount.name,
              status: 'completed',
              type: 'income',
              to_account: fromAccount.id.toString()
            }
          ]);
          
        if (transactionError) throw transactionError;
      } catch (dbError) {
        console.error('Erro ao atualizar o banco de dados:', dbError);
        // Mesmo com erro no banco, mantemos a atualização da UI para melhor experiência do usuário
        toast.error("Erro ao registrar a transação no banco de dados, mas os saldos foram atualizados localmente");
      }
      
      toast.success(`Transferência de ${formatCurrency(transferForm.amount)} realizada com sucesso`);
      
      // Fechar o diálogo e resetar o formulário
      setIsTransferDialogOpen(false);
      setTransferForm({
        fromAccountId: 0,
        toAccountId: 0,
        amount: 0,
        description: ""
      });
    } catch (error) {
      console.error('Erro ao realizar transferência:', error);
      toast.error("Erro ao realizar transferência");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">Contas Bancárias</h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-100">
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
                    onChange={handlePixKeyChange}
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
            onUpdate={handleUpdateAccount}
            onDelete={handleDeleteAccount}
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
                value={transferForm.fromAccountId.toString()}
                onValueChange={(value) => setTransferForm({...transferForm, fromAccountId: parseInt(value)})}
              >
                <SelectTrigger id="from-account">
                  <SelectValue placeholder="Selecione a conta de origem" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-account">Conta de Destino</Label>
              <Select 
                value={transferForm.toAccountId.toString()}
                onValueChange={(value) => setTransferForm({...transferForm, toAccountId: parseInt(value)})}
              >
                <SelectTrigger id="to-account">
                  <SelectValue placeholder="Selecione a conta de destino" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts
                    .filter(account => account.id !== transferForm.fromAccountId)
                    .map(account => (
                      <SelectItem key={account.id} value={account.id.toString()}>
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
                type="number" 
                placeholder="0,00" 
                value={transferForm.amount.toString()}
                onChange={(e) => setTransferForm({...transferForm, amount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-description">Descrição (opcional)</Label>
              <Input 
                id="transfer-description" 
                placeholder="Ex: Transferência para reserva" 
                value={transferForm.description}
                onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
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
              disabled={transferForm.amount <= 0 || transferForm.fromAccountId === transferForm.toAccountId}
            >
              Transferir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
