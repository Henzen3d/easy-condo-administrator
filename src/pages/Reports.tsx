
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart4,
  Download,
  FileText,
  PieChart,
  CreditCard,
  DollarSign,
  TrendingUp,
  Home,
  Calendar,
  BarChart
} from "lucide-react";

// Componente para o relatório financeiro geral
const FinancialReport = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
          <CardDescription>
            Visão geral das receitas, despesas e saldo do condomínio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Receitas</p>
                    <h3 className="text-2xl font-bold">R$ 25.450,00</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Despesas</p>
                    <h3 className="text-2xl font-bold">R$ 18.375,00</h3>
                  </div>
                  <div className="p-2 bg-red-100 rounded-full dark:bg-red-900">
                    <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Atual</p>
                    <h3 className="text-2xl font-bold">R$ 7.075,00</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receitas vs. Despesas</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="bg-muted w-full h-64 rounded-md flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground/50" />
                  <span className="ml-2 text-muted-foreground">Gráfico de Barras</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Despesas</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="bg-muted w-full h-64 rounded-md flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground/50" />
                  <span className="ml-2 text-muted-foreground">Gráfico de Pizza</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Dados de 01/01/2024 a 31/01/2024
          </div>
          <Button className="gap-2">
            <Download size={16} />
            Exportar Relatório
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa Mensal</CardTitle>
          <CardDescription>
            Histórico mensal de receitas e despesas do condomínio.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="bg-muted w-full h-64 rounded-md flex items-center justify-center">
            <BarChart4 className="h-16 w-16 text-muted-foreground/50" />
            <span className="ml-2 text-muted-foreground">Gráfico de Fluxo Mensal</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Dados dos últimos 12 meses
          </div>
          <Button className="gap-2">
            <Download size={16} />
            Exportar Relatório
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Componente para o relatório de cobranças
const BillingReport = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Status das Cobranças</CardTitle>
          <CardDescription>
            Visão geral das cobranças e seus status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Cobranças</p>
                    <h3 className="text-2xl font-bold">35</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cobranças Pagas</p>
                    <h3 className="text-2xl font-bold">22</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cobranças Pendentes</p>
                    <h3 className="text-2xl font-bold">10</h3>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
                    <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cobranças Atrasadas</p>
                    <h3 className="text-2xl font-bold">3</h3>
                  </div>
                  <div className="p-2 bg-red-100 rounded-full dark:bg-red-900">
                    <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status das Cobranças</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="bg-muted w-full h-64 rounded-md flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground/50" />
                  <span className="ml-2 text-muted-foreground">Gráfico de Pizza</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Cobranças</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="bg-muted w-full h-64 rounded-md flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground/50" />
                  <span className="ml-2 text-muted-foreground">Gráfico de Barras</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Dados de 01/01/2024 a 31/01/2024
          </div>
          <Button className="gap-2">
            <Download size={16} />
            Exportar Relatório
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Componente para o relatório de unidades
const UnitsReport = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Unidades</CardTitle>
          <CardDescription>
            Informações gerais sobre as unidades do condomínio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Unidades</p>
                    <h3 className="text-2xl font-bold">48</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                    <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unidades Ocupadas</p>
                    <h3 className="text-2xl font-bold">42</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                    <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unidades Vagas</p>
                    <h3 className="text-2xl font-bold">6</h3>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
                    <Home className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Blocos</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="bg-muted w-full h-64 rounded-md flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground/50" />
                  <span className="ml-2 text-muted-foreground">Gráfico de Pizza</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status de Pagamento por Unidade</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="bg-muted w-full h-64 rounded-md flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground/50" />
                  <span className="ml-2 text-muted-foreground">Gráfico de Barras</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button className="gap-2">
            <Download size={16} />
            Exportar Relatório
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Componente principal da página de relatórios
const Reports = () => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">Relatórios</h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-200">
          Gere relatórios detalhados para acompanhar o desempenho do condomínio.
        </p>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2" onClick={() => setIsGeneratingReport(true)}>
          <FileText size={16} />
          Novo Relatório Personalizado
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Período do Relatório</CardTitle>
              <CardDescription>
                Selecione o período para os relatórios abaixo.
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input id="startDate" type="date" defaultValue="2024-01-01" />
              </div>
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input id="endDate" type="date" defaultValue="2024-01-31" />
              </div>
              <Button>Aplicar</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="financial">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="financial" className="gap-2">
            <BarChart4 size={16} />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <FileText size={16} />
            <span className="hidden sm:inline">Cobranças</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="gap-2">
            <Home size={16} />
            <span className="hidden sm:inline">Unidades</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial">
          <FinancialReport />
        </TabsContent>
        
        <TabsContent value="billing">
          <BillingReport />
        </TabsContent>
        
        <TabsContent value="units">
          <UnitsReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
