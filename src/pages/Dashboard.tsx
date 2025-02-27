
import { ArrowDownLeft, ArrowUpRight, BarChart, Building, CreditCard, DollarSign, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { FinancialAreaChart, ExpenseCategoryChart } from "@/components/dashboard/FinancialChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

export default function Dashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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
          value={formatCurrency(25700)}
          icon={<DollarSign size={24} className="text-primary-600" />}
          trend="up"
          trendValue="12% em relação ao mês anterior"
          className="animate-fade-in"
        />
        
        <StatCard
          title="Receitas (Mês)"
          value={formatCurrency(13200)}
          icon={<ArrowUpRight size={24} className="text-emerald-500" />}
          variant="success"
          trend="up"
          trendValue="8% em relação ao mês anterior"
          className="animate-fade-in animation-delay-100"
        />
        
        <StatCard
          title="Despesas (Mês)"
          value={formatCurrency(10800)}
          icon={<ArrowDownLeft size={24} className="text-red-500" />}
          variant="danger"
          trend="down"
          trendValue="3% em relação ao mês anterior"
          className="animate-fade-in animation-delay-200"
        />
        
        <StatCard
          title="Inadimplência"
          value="5%"
          icon={<BarChart size={24} className="text-amber-500" />}
          variant="warning"
          trend="down"
          trendValue="2% em relação ao mês anterior"
          className="animate-fade-in animation-delay-300"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FinancialAreaChart />
        <ExpenseCategoryChart />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentTransactions />
        
        <div className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total de Unidades"
              value="64"
              icon={<Building size={24} className="text-primary-600" />}
              className="animate-fade-in"
            />
            
            <StatCard
              title="Total de Moradores"
              value="142"
              icon={<Users size={24} className="text-primary-600" />}
              className="animate-fade-in animation-delay-100"
            />
            
            <StatCard
              title="Contas Bancárias"
              value="3"
              icon={<CreditCard size={24} className="text-primary-600" />}
              className="animate-fade-in animation-delay-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
