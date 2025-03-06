
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Building, Home, Droplet, Zap, Shield, Trash2, FileText } from "lucide-react";

// Sample data
const recentTransactions = [
  {
    id: 1,
    description: "Pagamento taxa condominial",
    amount: 450,
    type: "income",
    date: "2023-06-02",
    category: "taxa",
    unit: "101",
  },
  {
    id: 2,
    description: "Manutenção elevador",
    amount: 1200,
    type: "expense",
    date: "2023-06-01",
    category: "manutenção",
    payee: "ElevaTech",
  },
  {
    id: 3,
    description: "Conta de água",
    amount: 780,
    type: "expense",
    date: "2023-05-28",
    category: "água",
    payee: "Saneamento Municipal",
  },
  {
    id: 4,
    description: "Energia elétrica",
    amount: 550,
    type: "expense",
    date: "2023-05-25",
    category: "energia",
    payee: "Energia S.A.",
  },
  {
    id: 5,
    description: "Pagamento taxa condominial",
    amount: 450,
    type: "income",
    date: "2023-05-23",
    category: "taxa",
    unit: "204",
  },
  {
    id: 6,
    description: "Serviço de segurança",
    amount: 1500,
    type: "expense",
    date: "2023-05-20",
    category: "segurança",
    payee: "Segurança Total",
  },
  {
    id: 7,
    description: "Serviço de limpeza",
    amount: 650,
    type: "expense",
    date: "2023-05-15",
    category: "limpeza",
    payee: "Clean Service",
  }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(date);
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "taxa":
      return <Home size={16} className="text-emerald-500" />;
    case "manutenção":
      return <Building size={16} className="text-amber-500" />;
    case "água":
      return <Droplet size={16} className="text-blue-500" />;
    case "energia":
      return <Zap size={16} className="text-yellow-500" />;
    case "segurança":
      return <Shield size={16} className="text-purple-500" />;
    case "limpeza":
      return <Trash2 size={16} className="text-green-500" />;
    default:
      return <FileText size={16} className="text-gray-500" />;
  }
};

export function RecentTransactions() {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in animation-delay-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.slice(0, 5).map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 bg-gray-100 dark:bg-gray-800">
                  {getCategoryIcon(transaction.category)}
                </Avatar>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.date)} • 
                    {transaction.type === "income" 
                      ? ` Unidade ${transaction.unit}` 
                      : ` ${transaction.payee}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    transaction.type === "income" 
                      ? "text-emerald-600 dark:text-emerald-500" 
                      : "text-red-600 dark:text-red-500"
                  )}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownLeft size={16} />
                  )}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
