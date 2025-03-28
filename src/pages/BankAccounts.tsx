import { useState, useEffect, useMemo } from "react";
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
  BarChart3,
  ChevronsUpDown
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { validarChavePIX } from "@/lib/validators";
import { applyPixKeyMask } from "@/lib/masks";
import { ColorPicker } from "@/components/ui/color-picker";
import { useBankAccounts, BankAccount } from "@/contexts/BankAccountContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const { fetchBanks } = useBankAccounts();
  const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [openEditBankCombobox, setOpenEditBankCombobox] = useState(false);
  const [editBankSearchValue, setEditBankSearchValue] = useState("");
  
  // Filtrar bancos para o componente de edição
  const filteredEditBanks = useMemo(() => {
    if (!editBankSearchValue) return banks;
    
    return banks.filter((bank) => {
      const searchLower = editBankSearchValue.toLowerCase();
      return (
        bank.code.toLowerCase().includes(searchLower) ||
        bank.name.toLowerCase().includes(searchLower)
      );
    });
  }, [banks, editBankSearchValue]);
  
  // Buscar lista de bancos quando o diálogo de edição for aberto
  useEffect(() => {
    if (isEditDialogOpen) {
      async function loadBanks() {
        try {
          setLoadingBanks(true);
          const banksList = await fetchBanks();
          setBanks(banksList);
        } catch (error) {
          console.error('Erro ao carregar bancos:', error);
        } finally {
          setLoadingBanks(false);
        }
      }
      
      loadBanks();
    }
  }, [isEditDialogOpen, fetchBanks]);
  
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
  
  // Função para formatar a exibição das opções do banco
  const formatBankOption = (bank: { code: string; name: string } | string, name?: string) => {
    if (typeof bank === 'object') {
      return `${bank.code} - ${bank.name}`;
    }
    return `${bank} - ${name || ''}`;
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
                <Popover open={openEditBankCombobox} onOpenChange={setOpenEditBankCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openEditBankCombobox}
                      className="w-full justify-between"
                    >
                      {editedAccount.bank
                        ? formatBankOption(banks.find(b => b.code === editedAccount.bank) || editedAccount.bank)
                        : "Selecione o banco"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Buscar banco..."
                        value={editBankSearchValue}
                        onValueChange={setEditBankSearchValue}
                        className="h-9"
                      />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>Nenhum banco encontrado.</CommandEmpty>
                        <CommandGroup>
                          {filteredEditBanks.map((bank) => (
                            <CommandItem
                              key={bank.code}
                              value={bank.code}
                              onSelect={(value) => {
                                setEditedAccount((prev) => ({ ...prev, bank: value }));
                                setOpenEditBankCombobox(false);
                              }}
                              className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                              onClick={() => {
                                setEditedAccount((prev) => ({ ...prev, bank: bank.code }));
                                setOpenEditBankCombobox(false);
                              }}
                            >
                              {formatBankOption(bank)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-account-type">Tipo de Conta</Label>
                <Select 
                  value={editedAccount.type}
                  onValueChange={(value: "checking" | "savings") => setEditedAccount({...editedAccount, type: value})}
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
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, fetchBanks } = useBankAccounts();
  const [showAllBalances, setShowAllBalances] = useState(true);
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "checking" | "savings">("all");
  const [showBanksSelect, setShowBanksSelect] = useState(false);
  const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [openNewBankCombobox, setOpenNewBankCombobox] = useState(false);
  const [newBankSearchValue, setNewBankSearchValue] = useState("");
  const [newAccount, setNewAccount] = useState<{
    name: string;
    bank: string;
    accountNumber: string;
    agency: string;
    balance: number;
    type: "checking" | "savings";
    color: string;
    pixKey: string;
    pixKeyType: string;
  }>({
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
  
  // Filtrar bancos para o componente de nova conta
  const filteredNewBanks = useMemo(() => {
    if (!newBankSearchValue) return banks;
    
    return banks.filter((bank) => {
      const searchLower = newBankSearchValue.toLowerCase();
      return (
        bank.code.toLowerCase().includes(searchLower) ||
        bank.name.toLowerCase().includes(searchLower)
      );
    });
  }, [banks, newBankSearchValue]);

  // Buscar lista de bancos quando o componente montar
  useEffect(() => {
    const fetchBankList = async () => {
      try {
        setLoadingBanks(true);
        const bankList = await fetchBanks();
        setBanks(bankList);
      } catch (error) {
        console.error('Erro ao buscar lista de bancos:', error);
      } finally {
        setLoadingBanks(false);
      }
    };

    fetchBankList();
  }, [fetchBanks]);

  // Console.log para debug
  console.log('Active Tab:', activeTab);
  console.log('Bank Accounts:', bankAccounts);

  // Filtrar contas por tipo
  const filteredAccounts = useMemo(() => {
    console.log('Filtering accounts for tab:', activeTab); 
    console.log('Available accounts:', bankAccounts.map(acc => ({ id: acc.id, name: acc.name, type: acc.type })));
    
    if (activeTab === "all") {
      return bankAccounts;
    }
    
    return bankAccounts.filter(account => {
      // Ensure activeTab is the correct type for comparison with account.type
      const tabType = activeTab as "checking" | "savings";
      const matches = account.type === tabType;
      console.log(`Account ${account.id} (${account.name}) type '${account.type}' matches '${activeTab}':`, matches);
      return matches;
    });
  }, [activeTab, bankAccounts]);

  // Toggle para mostrar/esconder todos os saldos
  const toggleAllBalances = () => {
    setShowAllBalances(!showAllBalances);
  };

  // Função para formatar a exibição das opções do banco
  const formatBankOption = (bank: { code: string; name: string } | string, name?: string): string => {
    if (typeof bank === 'object') {
      return `${bank.code} - ${bank.name}`;
    }
    return `${bank} - ${name || ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contas Bancárias</h2>
          <p className="text-muted-foreground">
            Gerencie as contas bancárias do condomínio
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={(value) => {
            console.log('Tab changed to:', value);
            setActiveTab(value as "all" | "checking" | "savings");
          }} 
          className="animate-fade-in"
        >
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="checking">Corrente</TabsTrigger>
            <TabsTrigger value="savings">Poupança</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAllBalances}
          >
            {showAllBalances ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
          <Dialog open={isNewAccountDialogOpen} onOpenChange={setIsNewAccountDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conta Bancária</DialogTitle>
                <DialogDescription>
                  Preencha os dados para adicionar uma nova conta bancária ao sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Nome da Conta</Label>
                  <Input 
                    id="account-name" 
                    placeholder="Ex: Principal, Reserva, etc." 
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank-name">Banco</Label>
                    <Popover open={openNewBankCombobox} onOpenChange={setOpenNewBankCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openNewBankCombobox}
                          className="w-full justify-between"
                        >
                          {newAccount.bank
                            ? formatBankOption(banks.find(b => b.code === newAccount.bank) || newAccount.bank)
                            : "Selecione o banco"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Buscar banco..."
                            value={newBankSearchValue}
                            onValueChange={setNewBankSearchValue}
                            className="h-9"
                          />
                          <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>Nenhum banco encontrado.</CommandEmpty>
                            <CommandGroup>
                              {loadingBanks ? (
                                <CommandItem disabled>Carregando bancos...</CommandItem>
                              ) : (
                                filteredNewBanks.map((bank) => (
                                  <CommandItem
                                    key={bank.code}
                                    value={bank.code}
                                    onSelect={(value) => {
                                      setNewAccount((prev) => ({ ...prev, bank: bank.code }));
                                      setOpenNewBankCombobox(false);
                                      setNewBankSearchValue("");
                                    }}
                                    className="cursor-pointer hover:bg-accent"
                                    onClick={() => {
                                      setNewAccount((prev) => ({ ...prev, bank: bank.code }));
                                      setOpenNewBankCombobox(false);
                                      setNewBankSearchValue("");
                                    }}
                                  >
                                    {formatBankOption(bank)}
                                  </CommandItem>
                                ))
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-type">Tipo de Conta</Label>
                    <Select 
                      value={newAccount.type}
                      onValueChange={(value: "checking" | "savings") => setNewAccount({...newAccount, type: value})}
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
                    <Label htmlFor="balance">Saldo Inicial</Label>
                    <Input 
                      id="balance" 
                      type="number" 
                      placeholder="0,00" 
                      value={newAccount.balance.toString()}
                      onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pix-key-type">Tipo de Chave PIX</Label>
                    <Select 
                      value={newAccount.pixKeyType}
                      onValueChange={(value) => {
                        setNewAccount({
                          ...newAccount, 
                          pixKeyType: value,
                          pixKey: value === "none" ? "" : newAccount.pixKey
                        });
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
                  <Input 
                    id="pix-key" 
                    placeholder={
                      newAccount.pixKeyType === "cpf" ? "123.456.789-00" :
                      newAccount.pixKeyType === "cnpj" ? "12.345.678/0001-00" :
                      newAccount.pixKeyType === "email" ? "exemplo@email.com" :
                      newAccount.pixKeyType === "phone" ? "(11) 91234-5678" :
                      newAccount.pixKeyType === "random" ? "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" :
                      ""
                    }
                    value={newAccount.pixKey}
                    onChange={(e) => setNewAccount({...newAccount, pixKey: e.target.value})}
                    disabled={!newAccount.pixKeyType || newAccount.pixKeyType === "none"}
                  />
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
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsNewAccountDialogOpen(false);
                    // Reset the form
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
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    // Validate fields
                    if (!newAccount.name) {
                      toast.error("O nome da conta é obrigatório");
                      return;
                    }
                    if (!newAccount.bank) {
                      toast.error("O nome do banco é obrigatório");
                      return;
                    }
                    if (!newAccount.accountNumber) {
                      toast.error("O número da conta é obrigatório");
                      return;
                    }
                    if (!newAccount.agency) {
                      toast.error("A agência é obrigatória");
                      return;
                    }
                    
                    // Add the new account
                    addBankAccount({
                      ...newAccount,
                      pixKeyType: newAccount.pixKeyType === "none" ? null : newAccount.pixKeyType,
                      pixKey: newAccount.pixKeyType === "none" ? null : newAccount.pixKey
                    });
                    
                    // Show success message
                    toast.success("Conta bancária adicionada com sucesso");
                    
                    // Close the dialog and reset the form
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
                  }}
                >
                  Adicionar Conta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Debug information */}
      <div className="text-xs text-muted-foreground">
        <p>Filtro ativo: {activeTab} | Contas exibidas: {filteredAccounts.length} de {bankAccounts.length}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAccounts.length > 0 ? (
          filteredAccounts.map((account) => (
            <BankAccountCard 
              key={account.id} 
              account={account} 
              onUpdate={updateBankAccount}
              onDelete={deleteBankAccount}
              showBalance={showAllBalances}
              onToggleBalance={toggleAllBalances}
            />
          ))
        ) : (
          <div className="col-span-3 py-8 text-center text-muted-foreground">
            Nenhuma conta {activeTab === "checking" ? "corrente" : activeTab === "savings" ? "poupança" : ""} encontrada.
          </div>
        )}
      </div>
    </div>
  );
}



