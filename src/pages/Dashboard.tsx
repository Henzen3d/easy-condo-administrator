import { useEffect, useState, useCallback, useMemo } from "react";
import React from "react";
import { ArrowDownLeft, ArrowUpRight, BarChart, Building, CreditCard, DollarSign, Users, Copy, Check } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { FinancialAreaChart, ExpenseCategoryChart } from "@/components/dashboard/FinancialChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useBankAccounts } from "@/contexts/BankAccountContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Memoized StatCard component for better performance
const MemoizedStatCard = React.memo(StatCard);

// Tipo que usamos para definir o estado de tendências
interface TrendData {
  percentage: number;
  trend: 'up' | 'down';
}

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
      balance: { percentage: 0, trend: 'up' as 'up' | 'down' },
      income: { percentage: 0, trend: 'up' as 'up' | 'down' },
      expenses: { percentage: 0, trend: 'up' as 'up' | 'down' },
      defaultRate: { percentage: 0, trend: 'up' as 'up' | 'down' }
    }
  });

  // Memoize date calculations that don't change with every render
  const dateRanges = useMemo(() => {
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    return {
      now,
      firstDayCurrentMonth,
      firstDayLastMonth,
      lastDayLastMonth
    };
  }, []);

  // Memoize filtered transactions to prevent recalculations on every render
  const filteredTransactions = useMemo(() => {
    const { now, firstDayCurrentMonth, firstDayLastMonth, lastDayLastMonth } = dateRanges;
    
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= firstDayCurrentMonth && new Date(t.date) <= now
    );
    
    const lastMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= firstDayLastMonth && new Date(t.date) <= lastDayLastMonth
    );
    
    return {
      currentMonthTransactions,
      lastMonthTransactions
    };
  }, [transactions, dateRanges]);

  // Memoize the calculation of trends to avoid recalculation on every render
  const calculateTrend = useCallback((current: number, previous: number): TrendData => {
    if (previous === 0) return { percentage: 0, trend: 'up' };
    const percentage = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(Math.round(percentage)),
      trend: percentage >= 0 ? 'up' : 'down'
    };
  }, []);

  const calculateDashboardData = useCallback(() => {
    // Calcular saldo atual (soma dos saldos de todas as contas)
    const currentBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

    const { currentMonthTransactions, lastMonthTransactions } = filteredTransactions;

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
  }, [bankAccounts, filteredTransactions, calculateTrend]);

  // Effect to calculate dashboard data when dependencies change
  useEffect(() => {
    calculateDashboardData();
  }, [calculateDashboardData]);

  // Memoize the currency formatter to prevent recreation on every render
  const formatCurrency = useMemo(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }, []);

  // Use useCallback for data fetching functions
  const fetchUnitsAndResidentsCount = useCallback(async () => {
    try {
      const { count: unitsCount, error: unitsError } = await supabase
        .from('units')
        .select('*', { count: 'exact', head: true });

      if (unitsError) {
        console.error('Erro ao buscar unidades:', unitsError);
        return;
      }

      const { count: residentsCount, error: residentsError } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true });

      if (residentsError) {
        console.error('Erro ao buscar moradores:', residentsError);
        return;
      }

      setTotalUnits(unitsCount || 0);
      setTotalResidents(residentsCount || 0);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados de unidades e moradores');
    }
  }, []);

  useEffect(() => {
    fetchUnitsAndResidentsCount();
  }, [fetchUnitsAndResidentsCount]);

  // Navigation handlers
  const handleNavigateToUnits = useCallback(() => {
    navigate('/units');
  }, [navigate]);

  const handleNavigateToBankAccounts = useCallback(() => {
    navigate('/bank-accounts');
  }, [navigate]);

  // Add function to handle copying text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Copiado para a área de transferência');
      })
      .catch((err) => {
        toast.error('Erro ao copiar: ' + err);
      });
  };

  // Format account details for copying
  const formatAccountDetails = (account: any) => {
    let details = `${account.name}\n${account.bank}\nAgência: ${account.agency}\nConta: ${account.accountNumber}`;
    if (account.pixKey) {
      details += `\nChave PIX${account.pixKeyType ? ` (${account.pixKeyType})` : ''}: ${account.pixKey}`;
    }
    return details;
  };

  // Render the dashboard with original components
  // We're using the original implementation to avoid type issues
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Função para renderizar o componente RecentTransactions
  // Adaptado para usar os dados do contexto diretamente
  const renderRecentTransactions = () => {
    return <RecentTransactions />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das finanças e gestão do condomínio
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Atual"
          value={formatCurrency.format(dashboardData.currentBalance)}
          icon={<DollarSign size={24} className="text-primary-600" />}
          trend={dashboardData.trends.balance.trend}
          trendValue={`${dashboardData.trends.balance.percentage}% em relação ao mês anterior`}
          className="cursor-pointer hover:bg-gray-50"
          onClick={handleNavigateToBankAccounts}
        />
        
        <StatCard
          title="Receitas (Mês)"
          value={formatCurrency.format(dashboardData.monthlyIncome)}
          icon={<ArrowUpRight size={24} className="text-emerald-500" />}
          variant="success"
          trend={dashboardData.trends.income.trend}
          trendValue={`${dashboardData.trends.income.percentage}% em relação ao mês anterior`}
        />
        
        <StatCard
          title="Despesas (Mês)"
          value={formatCurrency.format(dashboardData.monthlyExpenses)}
          icon={<ArrowDownLeft size={24} className="text-red-500" />}
          variant="danger"
          trend={dashboardData.trends.expenses.trend}
          trendValue={`${dashboardData.trends.expenses.percentage}% em relação ao mês anterior`}
        />
        
        <StatCard
          title="Inadimplência"
          value={`${dashboardData.defaultRate.toFixed(1)}%`}
          icon={<BarChart size={24} className="text-amber-500" />}
          variant="warning"
          trend={dashboardData.trends.defaultRate.trend === 'up' ? 'down' : 'up'}
          trendValue={`${dashboardData.trends.defaultRate.percentage}% em relação ao mês anterior`}
        />
      </div>
      
      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FinancialAreaChart transactions={transactions} />
        </div>
        <div>
          <ExpenseCategoryChart transactions={transactions} />
        </div>
      </div>
      
      {/* Transações Recentes e Contadores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {renderRecentTransactions()}
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard
            title="Total de Unidades"
            value={totalUnits.toString()}
            icon={<Building size={24} className="text-primary-600" />}
            className="cursor-pointer hover:bg-gray-50"
            onClick={handleNavigateToUnits}
          />
          
          <StatCard
            title="Total de Moradores"
            value={totalResidents.toString()}
            icon={<Users size={24} className="text-primary-600" />}
            className="cursor-pointer hover:bg-gray-50"
            onClick={handleNavigateToUnits}
          />
          
          <StatCard
            title="Contas Bancárias"
            value={bankAccounts.length.toString()}
            icon={<CreditCard size={24} className="text-primary-600" />}
            className="cursor-pointer hover:bg-gray-50"
            onClick={handleNavigateToBankAccounts}
          >
            {bankAccounts.length > 0 && (
              <div className="space-y-3 text-sm">
                {bankAccounts.map((account) => (
                  <div 
                    key={account.id} 
                    className="rounded-md bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-muted-foreground">{account.bank}</div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          copyToClipboard(formatAccountDetails(account));
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                        title="Copiar todos os dados da conta"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Agência</div>
                        <div>{account.agency}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Conta</div>
                        <div>{account.accountNumber}</div>
                      </div>
                    </div>
                    
                    {account.pixKey && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground">
                          Chave PIX {account.pixKeyType && `(${account.pixKeyType})`}
                        </div>
                        <div className="truncate">{account.pixKey}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </StatCard>
        </div>
      </div>
      
      {/* Espaço adicional para evitar sobreposição do menu flutuante */}
      <div className="h-20" />
    </div>
  );
}
