
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Transaction } from "@/contexts/BankAccountContext";

interface ChartProps {
  transactions: Transaction[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
};

export const FinancialAreaChart = ({ transactions }: ChartProps) => {
  // Processar transações para gerar dados do gráfico
  const processTransactions = () => {
    // Agrupar transações por mês
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[monthKey].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        acc[monthKey].expenses += transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    // Converter para formato do gráfico
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses
    }));
  };

  const chartData = processTransactions();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Receitas: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Despesas: {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-2 overflow-hidden transition-all hover:shadow-md animate-fade-in animation-delay-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Fluxo Financeiro</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis 
                tickFormatter={(value) => `R$${value/1000}k`} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorReceitas)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                fillOpacity={1} 
                fill="url(#colorDespesas)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const ExpenseCategoryChart = ({ transactions }: ChartProps) => {
  // Processar transações para gerar dados do gráfico de categorias
  const processCategories = () => {
    const categories = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Outros';
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount
    }));
  };

  const chartData = processCategories();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in animation-delay-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Categorias de Despesas</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis 
                tickFormatter={(value) => `R$${value/1000}k`} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), "Valor"]}
                labelStyle={{ fontWeight: "bold" }}
                contentStyle={{ 
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)" 
                }}
              />
              <Legend />
              <Bar 
                dataKey="amount" 
                fill="#0369A1" 
                radius={[4, 4, 0, 0]} 
                name="Valor" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
