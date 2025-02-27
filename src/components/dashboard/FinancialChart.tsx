
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

// Sample data
const monthlyData = [
  { month: "Jan", receitas: 12400, despesas: 10200 },
  { month: "Fev", receitas: 13100, despesas: 10800 },
  { month: "Mar", receitas: 13800, despesas: 11200 },
  { month: "Abr", receitas: 12900, despesas: 11500 },
  { month: "Mai", receitas: 13200, despesas: 10900 },
  { month: "Jun", receitas: 14100, despesas: 11300 },
  { month: "Jul", receitas: 14500, despesas: 12100 },
  { month: "Ago", receitas: 14200, despesas: 12300 },
  { month: "Set", receitas: 13800, despesas: 12000 },
  { month: "Out", receitas: 14300, despesas: 11800 },
  { month: "Nov", receitas: 14700, despesas: 12200 },
  { month: "Dez", receitas: 15200, despesas: 12500 },
];

const expenseCategories = [
  { name: "Manutenção", valor: 5200 },
  { name: "Água", valor: 2400 },
  { name: "Energia", valor: 1800 },
  { name: "Segurança", valor: 1500 },
  { name: "Limpeza", valor: 1200 },
  { name: "Outros", valor: 900 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
};

export function FinancialAreaChart() {
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
              data={monthlyData}
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
                dataKey="receitas" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorReceitas)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="despesas" 
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

export function ExpenseCategoryChart() {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in animation-delay-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Categorias de Despesas</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={expenseCategories}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
                dataKey="valor" 
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
