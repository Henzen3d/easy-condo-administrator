
import { useState } from "react";
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
  Trash2 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for bank accounts
const bankAccounts = [
  { 
    id: 1, 
    name: "Conta Principal", 
    bank: "Banco do Brasil", 
    accountNumber: "12345-6", 
    agency: "1234", 
    balance: 18450.75, 
    type: "checking",
    color: "blue" 
  },
  { 
    id: 2, 
    name: "Fundo de Reserva", 
    bank: "Caixa Econômica", 
    accountNumber: "98765-4", 
    agency: "5678", 
    balance: 54280.90, 
    type: "savings",
    color: "green" 
  },
  { 
    id: 3, 
    name: "Manutenção", 
    bank: "Itaú", 
    accountNumber: "45678-9", 
    agency: "4321", 
    balance: 12780.45, 
    type: "checking",
    color: "amber" 
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
  account: typeof bankAccounts[0];
}

function BankAccountCard({ account }: BankAccountCardProps) {
  const [showBalance, setShowBalance] = useState(false);

  const getColorClass = (color: string) => {
    const classes = {
      blue: "from-blue-400 to-blue-600",
      green: "from-emerald-400 to-emerald-600",
      amber: "from-amber-400 to-amber-600",
      purple: "from-purple-400 to-purple-600",
      red: "from-red-400 to-red-600",
    };
    return classes[color as keyof typeof classes] || classes.blue;
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in">
      <div className={`h-2 bg-gradient-to-r ${getColorClass(account.color)}`} />
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{account.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowBalance(!showBalance)}>
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>
        <CardDescription>{account.bank}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Saldo Atual</p>
          <p className="text-2xl font-bold">
            {showBalance ? formatCurrency(account.balance) : "••••••"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Agência</p>
            <p className="font-medium">{account.agency}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Conta</p>
            <p className="font-medium">{account.accountNumber}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <PencilIcon size={16} />
          <span>Editar</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 size={16} />
          <span>Excluir</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function BankAccounts() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">Contas Bancárias</h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-100">
          Gerencie as contas bancárias do condomínio
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" className="animate-fade-in">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="checking">Corrente</TabsTrigger>
            <TabsTrigger value="savings">Poupança</TabsTrigger>
          </TabsList>
        </Tabs>

        <Dialog>
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
                <Input id="account-name" placeholder="Ex: Conta Principal" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Banco</Label>
                  <Input id="bank-name" placeholder="Ex: Banco do Brasil" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-type">Tipo de Conta</Label>
                  <Select>
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
                  <Input id="agency" placeholder="Ex: 1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-number">Conta</Label>
                  <Input id="account-number" placeholder="Ex: 12345-6" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial-balance">Saldo Inicial</Label>
                <Input id="initial-balance" type="number" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-color">Cor</Label>
                <Select defaultValue="blue">
                  <SelectTrigger id="account-color">
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="amber">Âmbar</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="red">Vermelho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bankAccounts.map((account) => (
          <BankAccountCard key={account.id} account={account} />
        ))}
        
        <Card className="flex flex-col items-center justify-center border-dashed p-6 transition-all hover:bg-gray-50 animate-fade-in">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-primary-50 p-3">
              <BanknoteIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-medium">Adicionar Conta</h3>
            <p className="text-sm text-muted-foreground">
              Adicione uma nova conta bancária para o condomínio
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-2">
                  Nova Conta
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
                    <Label htmlFor="account-name-2">Nome da Conta</Label>
                    <Input id="account-name-2" placeholder="Ex: Conta Principal" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name-2">Banco</Label>
                      <Input id="bank-name-2" placeholder="Ex: Banco do Brasil" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-type-2">Tipo de Conta</Label>
                      <Select>
                        <SelectTrigger id="account-type-2">
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
                      <Label htmlFor="agency-2">Agência</Label>
                      <Input id="agency-2" placeholder="Ex: 1234" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-number-2">Conta</Label>
                      <Input id="account-number-2" placeholder="Ex: 12345-6" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="initial-balance-2">Saldo Inicial</Label>
                    <Input id="initial-balance-2" type="number" placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-color-2">Cor</Label>
                    <Select defaultValue="blue">
                      <SelectTrigger id="account-color-2">
                        <SelectValue placeholder="Selecione uma cor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Azul</SelectItem>
                        <SelectItem value="green">Verde</SelectItem>
                        <SelectItem value="amber">Âmbar</SelectItem>
                        <SelectItem value="purple">Roxo</SelectItem>
                        <SelectItem value="red">Vermelho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>
    </div>
  );
}
