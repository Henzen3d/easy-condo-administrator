
import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, BarChart, Building, CreditCard, DollarSign, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { FinancialAreaChart, ExpenseCategoryChart } from "@/components/dashboard/FinancialChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useBankAccounts } from "@/contexts/BankAccountContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { bankAccounts, transactions, isLoading } = useBankAccounts();
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalResidents, setTotalResidents] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    defaultRate: 0,
    trends: {
      balance: { percentage: 0, trend: 'up' as const },
      income: { percentage: 0, trend: 'up' as const },
      expenses: { percentage: 0, trend: 'up' as const },
      defaultRate: { percentage: 0, trend: 'up' as const }
    }
  });

  useEffect(() => {
    calculateDashboardData();
  }, [bankAccounts, transactions]);

  const calculateDashboardData = () => {
    // Calcular saldo atual (soma dos saldos de todas as contas)
    const currentBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

    // Obter datas para o mês atual e anterior
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Filtrar transações por período
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= firstDayCurrentMonth && new Date(t.date) <= now
    );
    
    const lastMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= firstDayLastMonth && new Date(t.date) <= lastDayLastMonth
    );

    // Calcular receitas e despesas do mês atual
    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular receitas e despesas do mês anterior
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular taxa de inadimplência (exemplo: transações pendentes vs total)
    const pendingTransactions = currentMonthTransactions.filter(t => t.status === 'pending');
    const defaultRate = pendingTransactions.length > 0 
      ? (pendingTransactions.length / currentMonthTransactions.length) * 100 
      : 0;

    const lastMonthPendingTransactions = lastMonthTransactions.filter(t => t.status === 'pending');
    const lastMonthDefaultRate = lastMonthPendingTransactions.length > 0 
      ? (lastMonthPendingTransactions.length / lastMonthTransactions.length) * 100 
      : 0;

    // Calcular tendências
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return { percentage: 0, trend: 'up' as const };
      const percentage = ((current - previous) / previous) * 100;
      return {
        percentage: Math.abs(Math.round(percentage)),
        trend: percentage >= 0 ? 'up' as const : 'down' as const
      };
    };

    setDashboardData({
      currentBalance,
      monthlyIncome,
      monthlyExpenses,
      defaultRate,
      trends: {
        balance: calculateTrend(currentBalance, lastMonthIncome - lastMonthExpenses),
        income: calculateTrend(monthlyIncome, lastMonthIncome),
        expenses: calculateTrend(monthlyExpenses, lastMonthExpenses),
        defaultRate: calculateTrend(defaultRate, lastMonthDefaultRate)
      }
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  useEffect(() => {
    fetchUnitsAndResidentsCount();
  }, []);

  const fetchUnitsAndResidentsCount = async () => {
    try {
      // Buscar total de unidades
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('id', { count: 'exact' });

      if (unitsError) throw unitsError;
      
      // Buscar total de moradores
      const { data: residentsData, error: residentsError } = await supabase
        .from('residents')
        .select('id', { count: 'exact' });

      if (residentsError) throw residentsError;

      // Atualizar os estados com os totais
      setTotalUnits(unitsData?.length || 0);
      setTotalResidents(residentsData?.length || 0);

    } catch (error) {
      console.error('Erro ao buscar totais:', error);
      toast.error("Não foi possível carregar os totais de unidades e moradores.");
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Função para navegar para a página Units
  const handleNavigateToUnits = () => {
    navigate('/units');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">Dashboard</h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-100">
          Visão geral das finanças e gestão do condomínio
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Atual"
          value={formatCurrency(dashboardData.currentBalance)}
          icon={<DollarSign size={24} className="text-primary-600" />}
          trend={dashboardData.trends.balance.trend}
          trendValue={`${dashboardData.trends.balance.percentage}% em relação ao mês anterior`}
          className="animate-fade-in cursor-pointer hover:bg-gray-50"
          onClick={() => navigate('/bank-accounts')}
        />
        
        <StatCard
          title="Receitas (Mês)"
          value={formatCurrency(dashboardData.monthlyIncome)}
          icon={<ArrowUpRight size={24} className="text-emerald-500" />}
          variant="success"
          trend={dashboardData.trends.income.trend}
          trendValue={`${dashboardData.trends.income.percentage}% em relação ao mês anterior`}
          className="animate-fade-in animation-delay-100"
        />
        
        <StatCard
          title="Despesas (Mês)"
          value={formatCurrency(dashboardData.monthlyExpenses)}
          icon={<ArrowDownLeft size={24} className="text-red-500" />}
          variant="danger"
          trend={dashboardData.trends.expenses.trend}
          trendValue={`${dashboardData.trends.expenses.percentage}% em relação ao mês anterior`}
          className="animate-fade-in animation-delay-200"
        />
        
        <StatCard
          title="Inadimplência"
          value={`${dashboardData.defaultRate.toFixed(1)}%`}
          icon={<BarChart size={24} className="text-amber-500" />}
          variant="warning"
          trend={dashboardData.trends.defaultRate.trend}
          trendValue={`${dashboardData.trends.defaultRate.percentage}% em relação ao mês anterior`}
          className="animate-fade-in animation-delay-300"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FinancialAreaChart transactions={transactions} />
        <ExpenseCategoryChart transactions={transactions} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentTransactions />
        
        <div className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-fit">
              <StatCard
                title="Total de Unidades"
                value={totalUnits.toString()}
                icon={<Building size={24} className="text-primary-600" />}
                className="animate-fade-in cursor-pointer hover:bg-gray-50"
                onClick={handleNavigateToUnits}
              />
            </div>
            
            <div className="h-fit">
              <StatCard
                title="Total de Moradores"
                value={totalResidents.toString()}
                icon={<Users size={24} className="text-primary-600" />}
                className="animate-fade-in animation-delay-100 cursor-pointer hover:bg-gray-50"
                onClick={handleNavigateToUnits}
              />
            </div>
            
            <StatCard
              title="Contas Bancárias"
              value={bankAccounts.length.toString()}
              icon={<CreditCard size={24} className="text-primary-600" />}
              className="animate-fade-in animation-delay-200"
            >
              <div className="space-y-2">
                {bankAccounts.map((account) => (
                  <div 
                    key={account.id} 
                    className="text-sm p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                  >
                    <div>
                      <p className="font-medium leading-none">{account.name}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{account.bank}</p>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Agência</p>
                        <p>{account.agency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Conta</p>
                        <p>{account.accountNumber}</p>
                      </div>
                    </div>

                    {account.pixKey && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Chave PIX {account.pixKeyType && `(${account.pixKeyType.toUpperCase()})`}
                        </p>
                        <p className="truncate" title={account.pixKey}>
                          {account.pixKey}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </StatCard>
          </div>
        </div>
      </div>

      {/* Espaço adicional para evitar sobreposição do menu flutuante */}
      <div className="h-20" />
    </div>
  );
}
