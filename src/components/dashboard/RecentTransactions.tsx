
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Building, Home, Droplet, Zap, Shield, Trash2, FileText } from "lucide-react";
import { useBankAccounts } from "@/contexts/BankAccountContext";
import { useNavigate } from "react-router-dom";

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
  switch (category.toLowerCase()) {
    case "taxa condominial":
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
  const { transactions } = useBankAccounts();
  const navigate = useNavigate();

  // Ordenar transações por data (mais recentes primeiro)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md animate-fade-in animation-delay-300 cursor-pointer hover:bg-gray-50"
      onClick={() => navigate('/transactions')}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTransactions.slice(0, 5).map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <div className="flex items-center justify-center w-full h-full">
                    {getCategoryIcon(transaction.category)}
                  </div>
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
