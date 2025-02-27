
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Save,
  Users,
} from "lucide-react";

// Componente para as configurações do condomínio
const CondominiumSettings = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Informações do Condomínio</CardTitle>
        <CardDescription>
          Configure as informações básicas do condomínio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="condoName">Nome do Condomínio</Label>
          <Input id="condoName" defaultValue="Condomínio Residencial Bosque Verde" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condoCnpj">CNPJ</Label>
          <Input id="condoCnpj" defaultValue="12.345.678/0001-90" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adminName">Nome do Síndico</Label>
            <Input id="adminName" defaultValue="Carlos Roberto Mendes" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email do Síndico</Label>
            <Input id="adminEmail" type="email" defaultValue="carlos.mendes@email.com" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adminPhone">Telefone do Síndico</Label>
            <Input id="adminPhone" defaultValue="(11) 98765-4321" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condoPhone">Telefone do Condomínio</Label>
            <Input id="condoPhone" defaultValue="(11) 3456-7890" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condoAddress">Endereço</Label>
          <Input id="condoAddress" defaultValue="Av. das Flores, 123 - Jardim Primavera" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="condoCity">Cidade</Label>
            <Input id="condoCity" defaultValue="São Paulo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condoState">Estado</Label>
            <Input id="condoState" defaultValue="SP" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condoZip">CEP</Label>
            <Input id="condoZip" defaultValue="01234-567" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condoUnits">Número de Unidades</Label>
          <Input id="condoUnits" type="number" defaultValue="48" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condoBlocks">Número de Blocos</Label>
          <Input id="condoBlocks" type="number" defaultValue="3" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="gap-2">
          <Save size={16} />
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente para as configurações financeiras
const FinancialSettings = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Configurações Financeiras</CardTitle>
        <CardDescription>
          Configure as informações financeiras do condomínio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bankName">Banco Principal</Label>
          <Input id="bankName" defaultValue="Banco do Brasil" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankAgency">Agência</Label>
            <Input id="bankAgency" defaultValue="1234" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccount">Conta</Label>
            <Input id="bankAccount" defaultValue="12345-6" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankType">Tipo de Conta</Label>
            <select 
              id="bankType" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="checking"
            >
              <option value="checking">Corrente</option>
              <option value="savings">Poupança</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="billingDueDay">Dia de Vencimento das Taxas</Label>
          <Input id="billingDueDay" type="number" min="1" max="31" defaultValue="10" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="defaultFee">Valor Padrão da Taxa (R$)</Label>
          <Input id="defaultFee" type="number" step="0.01" min="0" defaultValue="450.00" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lateFeePercentage">Multa por Atraso (%)</Label>
          <Input id="lateFeePercentage" type="number" step="0.01" min="0" defaultValue="2.00" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="interestPerDay">Juros por Dia de Atraso (%)</Label>
          <Input id="interestPerDay" type="number" step="0.01" min="0" defaultValue="0.03" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="gap-2">
          <Save size={16} />
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente para as configurações de notificações
const NotificationSettings = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Configurações de Notificações</CardTitle>
        <CardDescription>
          Configure como as notificações serão enviadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="emailNotif" 
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            defaultChecked 
          />
          <Label htmlFor="emailNotif">Enviar notificações por email</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="smsNotif" 
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="smsNotif">Enviar notificações por SMS</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="reminderNotif" 
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            defaultChecked 
          />
          <Label htmlFor="reminderNotif">Enviar lembretes de pagamento</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reminderDays">Dias de antecedência para lembretes</Label>
          <Input id="reminderDays" type="number" min="1" max="30" defaultValue="3" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="emailTemplate">Modelo de Email para Cobranças</Label>
          <textarea 
            id="emailTemplate" 
            rows={5}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue="Prezado(a) {NOME},\n\nInformamos que a cobrança {DESCRICAO} no valor de {VALOR} está disponível com vencimento em {DATA_VENCIMENTO}.\n\nAtenciosamente,\nAdministração do {CONDOMINIO}"
          ></textarea>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="gap-2">
          <Save size={16} />
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente para as configurações de usuários
const UserSettings = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Configurações de Usuários</CardTitle>
        <CardDescription>
          Gerencie os usuários que têm acesso ao sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Usuários Ativos</h3>
          <Button variant="outline" className="gap-2">
            <Users size={16} />
            Adicionar Usuário
          </Button>
        </div>
        
        <div className="border rounded-md divide-y">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <User size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Carlos Roberto Mendes</h4>
                <p className="text-sm text-muted-foreground">carlos.mendes@email.com</p>
              </div>
            </div>
            <div>
              <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">Administrador</span>
            </div>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <User size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Ana Paula Silva</h4>
                <p className="text-sm text-muted-foreground">ana.silva@email.com</p>
              </div>
            </div>
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">Funcionário</span>
            </div>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <User size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium">João Pinheiro</h4>
                <p className="text-sm text-muted-foreground">joao.pinheiro@email.com</p>
              </div>
            </div>
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">Funcionário</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-4">
          <h3 className="text-lg font-medium">Níveis de Acesso</h3>
          <p className="text-sm text-muted-foreground">Controle o que cada tipo de usuário pode fazer no sistema</p>
        </div>
        
        <div className="border rounded-md p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="adminAccess">Administrador</Label>
              <span className="text-xs text-muted-foreground">Acesso Total</span>
            </div>
            <Input id="adminAccess" value="Acesso total a todas as funcionalidades" readOnly />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="employeeAccess">Funcionário</Label>
              <span className="text-xs text-muted-foreground">Acesso Limitado</span>
            </div>
            <Input id="employeeAccess" value="Visualização e edição limitada" readOnly />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="residentAccess">Morador</Label>
              <span className="text-xs text-muted-foreground">Acesso Básico</span>
            </div>
            <Input id="residentAccess" value="Apenas visualização das próprias informações" readOnly />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="gap-2">
          <Save size={16} />
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente para as configurações de segurança
const SecuritySettings = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Configurações de Segurança</CardTitle>
        <CardDescription>
          Configure as opções de segurança do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="twoFactorAuth" 
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="twoFactorAuth">Ativar autenticação de dois fatores</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="sessionTimeout" 
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            defaultChecked
          />
          <Label htmlFor="sessionTimeout">Ativar timeout de sessão</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timeoutMinutes">Timeout de sessão (minutos)</Label>
          <Input id="timeoutMinutes" type="number" min="5" max="120" defaultValue="30" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="passwordPolicy">Política de Senhas</Label>
          <select 
            id="passwordPolicy" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue="medium"
          >
            <option value="low">Básica (mínimo 6 caracteres)</option>
            <option value="medium">Média (mínimo 8 caracteres, letras e números)</option>
            <option value="high">Alta (mínimo 10 caracteres, letras maiúsculas, minúsculas, números e símbolos)</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="passwordDays">Troca de senha a cada (dias)</Label>
          <Input id="passwordDays" type="number" min="30" max="180" defaultValue="90" />
        </div>
        
        <div className="pt-4">
          <h3 className="text-lg font-medium mb-2">Backups</h3>
          <div className="flex items-center space-x-2 mb-4">
            <input 
              type="checkbox" 
              id="autoBackup" 
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              defaultChecked
            />
            <Label htmlFor="autoBackup">Ativar backups automáticos</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="backupFrequency">Frequência de Backup</Label>
            <select 
              id="backupFrequency" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="daily"
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </div>
          
          <div className="mt-4">
            <Button variant="outline">Fazer Backup Manual</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="gap-2">
          <Save size={16} />
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente principal da página de configurações
const Settings = () => {
  const [activeTab, setActiveTab] = useState("condominium");
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold tracking-tight mr-2">Configurações</h1>
        <SettingsIcon className="text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">
        Configure as opções do sistema de acordo com as necessidades do condomínio.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="sm:hidden">
          <Label htmlFor="mobileTabSelect">Selecione uma configuração</Label>
          <select 
            id="mobileTabSelect" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="condominium">Condomínio</option>
            <option value="financial">Financeiro</option>
            <option value="notifications">Notificações</option>
            <option value="users">Usuários</option>
            <option value="security">Segurança</option>
          </select>
        </div>
        
        <div className="hidden sm:block">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="condominium" className="gap-2">
              <Building size={16} />
              <span className="hidden md:inline">Condomínio</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <CreditCard size={16} />
              <span className="hidden md:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell size={16} />
              <span className="hidden md:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users size={16} />
              <span className="hidden md:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield size={16} />
              <span className="hidden md:inline">Segurança</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="condominium">
          <CondominiumSettings />
        </TabsContent>
        
        <TabsContent value="financial">
          <FinancialSettings />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="users">
          <UserSettings />
        </TabsContent>
        
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
