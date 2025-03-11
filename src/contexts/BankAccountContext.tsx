import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Definição de interfaces
export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  bank?: string;
  accountNumber?: string;
  agency?: string;
  type?: string;
  color?: string;
  pixKey?: string | null;
  pixKeyType?: string | null;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  account: string;
  date: string;
  status: string;
  unit?: string;
  payee?: string;
  to_account?: string;
}

// Dados iniciais para contas bancárias
const initialBankAccounts: BankAccount[] = [
  { id: "principal", name: "Conta Principal", balance: 18450.75, bank: "Banco do Brasil", accountNumber: "12345-6", agency: "1234", type: "checking", color: "blue" },
  { id: "reserva", name: "Fundo de Reserva", balance: 42680.30, bank: "Caixa Econômica", accountNumber: "98765-4", agency: "5678", type: "savings", color: "green" },
  { id: "manutencao", name: "Manutenção", balance: 12780.45, bank: "Itaú", accountNumber: "45678-9", agency: "9012", type: "checking", color: "amber" },
];

// Dados iniciais para transações
const initialTransactions: Transaction[] = [
  { 
    id: 1, 
    description: "Pagamento taxa condominial", 
    amount: 450, 
    type: "income", 
    category: "Taxa Condominial", 
    account: "Conta Principal", 
    date: "2023-06-02", 
    unit: "101",
    status: "completed" 
  },
  { 
    id: 2, 
    description: "Manutenção elevador", 
    amount: 1200, 
    type: "expense", 
    category: "Manutenção", 
    account: "Conta Principal", 
    date: "2023-06-01", 
    payee: "ElevaTech",
    status: "completed" 
  },
  { 
    id: 3, 
    description: "Conta de água", 
    amount: 780, 
    type: "expense", 
    category: "Água", 
    account: "Conta Principal", 
    date: "2023-05-28", 
    payee: "Saneamento Municipal",
    status: "completed" 
  },
  { 
    id: 4, 
    description: "Energia elétrica", 
    amount: 550, 
    type: "expense", 
    category: "Energia", 
    account: "Conta Principal", 
    date: "2023-05-25", 
    payee: "Energia S.A.",
    status: "completed" 
  },
  { 
    id: 5, 
    description: "Transferência para reserva", 
    amount: 2000, 
    type: "transfer", 
    category: "Transferência", 
    account: "Conta Principal", 
    to_account: "Fundo de Reserva",
    date: "2023-05-20", 
    status: "completed" 
  },
];

// Interface do contexto
interface BankAccountContextType {
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  updateBankAccount: (account: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: number) => void;
  confirmPayment: (id: number) => void;
  getBankAccountByName: (name: string) => BankAccount | undefined;
  getBankAccountById: (id: string) => BankAccount | undefined;
  reloadData: () => Promise<void>;
  isLoading: boolean;
}

// Criação do contexto
const BankAccountContext = createContext<BankAccountContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const useBankAccounts = () => {
  const context = useContext(BankAccountContext);
  if (!context) {
    throw new Error('useBankAccounts must be used within a BankAccountProvider');
  }
  return context;
};

// Provedor do contexto
export const BankAccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Carregar dados do localStorage ou usar os dados iniciais
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const savedAccounts = localStorage.getItem('bankAccounts');
    return savedAccounts ? JSON.parse(savedAccounts) : initialBankAccounts;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : initialTransactions;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Salvar dados no localStorage quando eles mudarem
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));
    }
  }, [bankAccounts, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions, isLoading]);

  // Função para buscar dados do banco de dados
  const fetchBankAccounts = async () => {
    try {
      console.log("Fetching bank accounts from Supabase...");
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching bank accounts:', error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log("Bank accounts fetched:", data);
        // Mapear os dados do Supabase para o formato esperado pelo contexto
        const formattedAccounts: BankAccount[] = data.map(account => ({
          id: account.id,
          name: account.name,
          bank: account.bank,
          accountNumber: account.account_number,
          agency: account.agency,
          balance: account.balance,
          type: account.type,
          color: account.color || 'blue',
          pixKey: account.pix_key,
          pixKeyType: account.pix_key_type
        }));
        
        setBankAccounts(formattedAccounts);
      }
    } catch (error) {
      console.error('Error in fetchBankAccounts:', error);
    }
  };
  
  const fetchTransactions = async () => {
    try {
      console.log("Fetching transactions from Supabase...");
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('id', { ascending: false });
        
      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log("Transactions fetched:", data);
        // Mapear os dados do Supabase para o formato esperado pelo contexto
        const formattedTransactions: Transaction[] = data.map(transaction => ({
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type as "income" | "expense" | "transfer",
          category: transaction.category,
          account: transaction.account,
          date: transaction.date,
          status: transaction.status,
          unit: transaction.unit,
          payee: transaction.payee,
          to_account: transaction.to_account
        }));
        
        setTransactions(formattedTransactions);
      } else {
        // Se não houver transações, definir como array vazio
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
    }
  };
  
  // Função para recarregar os dados do Supabase
  const reloadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchBankAccounts(), fetchTransactions()]);
    setIsLoading(false);
    toast.success('Dados atualizados com sucesso');
  };

  // Efeito para carregar dados do banco de dados
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchBankAccounts(), fetchTransactions()]);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Função para adicionar uma nova conta bancária
  const addBankAccount = async (account: Omit<BankAccount, 'id'>) => {
    try {
      // Preparar os dados para o Supabase
      const supabaseData = {
        name: account.name,
        bank: account.bank,
        account_number: account.accountNumber,
        agency: account.agency,
        balance: account.balance,
        type: account.type,
        color: account.color,
        pix_key: account.pixKey,
        pix_key_type: account.pixKeyType
      };
      
      // Inserir no Supabase
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([supabaseData])
        .select();
        
      if (error) {
        console.error('Error adding bank account:', error);
        toast.error('Erro ao adicionar conta bancária');
        return;
      }
      
      if (data && data.length > 0) {
        // Mapear o resultado para o formato esperado pelo contexto
        const newAccount: BankAccount = {
          id: data[0].id,
          name: data[0].name,
          bank: data[0].bank,
          accountNumber: data[0].account_number,
          agency: data[0].agency,
          balance: data[0].balance,
          type: data[0].type,
          color: data[0].color || 'blue',
          pixKey: data[0].pix_key,
          pixKeyType: data[0].pix_key_type
        };
        
        // Atualizar o estado local
        setBankAccounts(prev => [...prev, newAccount]);
        toast.success('Conta bancária adicionada com sucesso');
      }
    } catch (error) {
      console.error('Error in addBankAccount:', error);
      toast.error('Erro ao adicionar conta bancária');
    }
  };

  // Função para atualizar uma conta bancária existente
  const updateBankAccount = async (account: BankAccount) => {
    try {
      // Preparar os dados para o Supabase
      const supabaseData = {
        name: account.name,
        bank: account.bank,
        account_number: account.accountNumber,
        agency: account.agency,
        balance: account.balance,
        type: account.type,
        color: account.color,
        pix_key: account.pixKey,
        pix_key_type: account.pixKeyType
      };
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('bank_accounts')
        .update(supabaseData)
        .eq('id', account.id);
        
      if (error) {
        console.error('Error updating bank account:', error);
        toast.error('Erro ao atualizar conta bancária');
        return;
      }
      
      // Atualizar o estado local
      setBankAccounts(prev => 
        prev.map(acc => acc.id === account.id ? account : acc)
      );
      
      toast.success('Conta bancária atualizada com sucesso');
    } catch (error) {
      console.error('Error in updateBankAccount:', error);
      toast.error('Erro ao atualizar conta bancária');
    }
  };

  // Função para excluir uma conta bancária
  const deleteBankAccount = async (id: string) => {
    try {
      // Excluir do Supabase
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting bank account:', error);
        toast.error('Erro ao excluir conta bancária');
        return;
      }
      
      // Atualizar o estado local
      setBankAccounts(prev => prev.filter(acc => acc.id !== id));
      
      toast.success('Conta bancária excluída com sucesso');
    } catch (error) {
      console.error('Error in deleteBankAccount:', error);
      toast.error('Erro ao excluir conta bancária');
    }
  };

  // Função para adicionar uma nova transação
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      // Garantir que a data está no formato correto (YYYY-MM-DD)
      const formattedDate = transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      
      // Preparar os dados para o Supabase
      const supabaseData = {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        account: transaction.account,
        date: formattedDate,
        status: transaction.status,
        unit: transaction.unit || "",
        payee: transaction.payee || "",
        to_account: transaction.to_account || null
      };
      
      console.log('Adicionando transação:', supabaseData);
      
      // Inserir no Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert([supabaseData])
        .select();
        
      if (error) {
        console.error('Error adding transaction:', error);
        toast.error('Erro ao adicionar transação');
        return null;
      }
      
      if (data && data.length > 0) {
        // Mapear o resultado para o formato esperado pelo contexto
        const newTransaction: Transaction = {
          id: data[0].id,
          description: data[0].description,
          amount: data[0].amount,
          type: data[0].type as "income" | "expense" | "transfer",
          category: data[0].category,
          account: data[0].account,
          date: data[0].date,
          status: data[0].status,
          unit: data[0].unit || "",
          payee: data[0].payee || "",
          to_account: data[0].to_account || null
        };
        
        console.log('Transação adicionada:', newTransaction);
        
        // Atualizar o estado local - adicionar no início da lista
        setTransactions(prev => [newTransaction, ...prev]);
        
        // Atualizar o saldo da conta apenas se a transação não estiver pendente
        if (transaction.status !== 'pending') {
          await updateAccountBalanceInDB(newTransaction);
        }
        
        toast.success('Transação adicionada com sucesso');
        return newTransaction;
      }
      
      return null;
    } catch (error) {
      console.error('Error in addTransaction:', error);
      toast.error('Erro ao adicionar transação');
      return null;
    }
  };

  // Função para atualizar uma transação existente
  const updateTransaction = async (transaction: Transaction) => {
    try {
      // Preparar os dados para o Supabase
      const supabaseData = {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        account: transaction.account,
        date: transaction.date,
        status: transaction.status,
        unit: transaction.unit,
        payee: transaction.payee,
        to_account: transaction.to_account
      };
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('transactions')
        .update(supabaseData)
        .eq('id', transaction.id);
        
      if (error) {
        console.error('Error updating transaction:', error);
        toast.error('Erro ao atualizar transação');
        return;
      }
      
      // Atualizar o estado local
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? transaction : t)
      );
      
      toast.success('Transação atualizada com sucesso');
    } catch (error) {
      console.error('Error in updateTransaction:', error);
      toast.error('Erro ao atualizar transação');
    }
  };

  // Função para excluir uma transação
  const deleteTransaction = async (id: number) => {
    try {
      // Excluir do Supabase
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Erro ao excluir transação');
        return;
      }
      
      // Atualizar o estado local
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      toast.success('Transação excluída com sucesso');
    } catch (error) {
      console.error('Error in deleteTransaction:', error);
      toast.error('Erro ao excluir transação');
    }
  };

  // Função para confirmar um pagamento pendente
  const confirmPayment = async (id: number) => {
    try {
      // Encontrar a transação
      const transaction = transactions.find(t => t.id === id);
      if (!transaction || transaction.status !== 'pending') {
        toast.error('Transação não encontrada ou não está pendente');
        return;
      }

      // Atualizar o status da transação no Supabase
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', id);
        
      if (error) {
        console.error('Error confirming payment:', error);
        toast.error('Erro ao confirmar pagamento');
        return;
      }

      // Atualizar o estado local
      const updatedTransaction = { ...transaction, status: 'completed' };
      setTransactions(
        transactions.map(t => t.id === id ? updatedTransaction : t)
      );

      // Atualizar o saldo da conta
      await updateAccountBalanceInDB(updatedTransaction);

      toast.success('Pagamento confirmado com sucesso');
    } catch (error) {
      console.error('Error in confirmPayment:', error);
      toast.error('Erro ao confirmar pagamento');
    }
  };

  // Função auxiliar para buscar uma conta bancária diretamente do Supabase pelo nome
  const fetchBankAccountByName = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('name', name)
        .single();
        
      if (error) {
        console.error('Error fetching bank account by name:', error);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      // Mapear o resultado para o formato esperado pelo contexto
      return {
        id: data.id,
        name: data.name,
        bank: data.bank,
        accountNumber: data.account_number,
        agency: data.agency,
        balance: data.balance,
        type: data.type,
        color: data.color,
        pixKey: data.pix_key,
        pixKeyType: data.pix_key_type
      };
    } catch (error) {
      console.error('Error in fetchBankAccountByName:', error);
      return null;
    }
  };

  // Função auxiliar para buscar uma conta bancária diretamente do Supabase pelo ID
  const fetchBankAccountById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching bank account by ID:', error);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      // Mapear o resultado para o formato esperado pelo contexto
      return {
        id: data.id,
        name: data.name,
        bank: data.bank,
        accountNumber: data.account_number,
        agency: data.agency,
        balance: data.balance,
        type: data.type,
        color: data.color,
        pixKey: data.pix_key,
        pixKeyType: data.pix_key_type
      };
    } catch (error) {
      console.error('Error in fetchBankAccountById:', error);
      return null;
    }
  };

  // Função auxiliar para atualizar o saldo da conta no banco de dados
  const updateAccountBalanceInDB = async (transaction: Transaction) => {
    try {
      if (transaction.type === 'income') {
        // Receita: aumenta o saldo da conta
        // Buscar a conta diretamente do estado local ou do Supabase
        let account = bankAccounts.find(a => a.id.toString() === transaction.account);
        
        if (!account) {
          // Se não encontrar pelo ID, tentar buscar pelo nome (para compatibilidade)
          account = bankAccounts.find(a => a.name === transaction.account);
        }
        
        if (!account) {
          // Se ainda não encontrar, buscar do Supabase
          account = await fetchBankAccountById(transaction.account);
        }
        
        if (account) {
          const newBalance = account.balance + transaction.amount;
          
          // Atualizar o saldo da conta no banco de dados
          await supabase
            .from('bank_accounts')
            .update({ balance: newBalance })
            .eq('id', account.id);
          
          // Atualizar o estado local
          setBankAccounts(prev => 
            prev.map(a => a.id === account.id ? { ...a, balance: newBalance } : a)
          );
          
          console.log(`Receita: Saldo anterior: ${account.balance}, Valor: ${transaction.amount}, Novo saldo: ${newBalance}`);
        }
      } else if (transaction.type === 'expense') {
        // Despesa: diminui o saldo da conta
        // Buscar a conta diretamente do estado local ou do Supabase
        let account = bankAccounts.find(a => a.id.toString() === transaction.account);
        
        if (!account) {
          // Se não encontrar pelo ID, tentar buscar pelo nome (para compatibilidade)
          account = bankAccounts.find(a => a.name === transaction.account);
        }
        
        if (!account) {
          // Se ainda não encontrar, buscar do Supabase
          account = await fetchBankAccountById(transaction.account);
        }
        
        if (account) {
          const newBalance = account.balance - transaction.amount;
          
          // Atualizar o saldo da conta no banco de dados
          await supabase
            .from('bank_accounts')
            .update({ balance: newBalance })
            .eq('id', account.id);
          
          // Atualizar o estado local
          setBankAccounts(prev => 
            prev.map(a => a.id === account.id ? { ...a, balance: newBalance } : a)
          );
          
          console.log(`Despesa: Saldo anterior: ${account.balance}, Valor: ${transaction.amount}, Novo saldo: ${newBalance}`);
        }
      } else if (transaction.type === 'transfer' && transaction.to_account) {
        // Transferência: diminui o saldo da conta de origem e aumenta o da conta de destino
        // Buscar as contas diretamente do estado local ou do Supabase
        let fromAccount = bankAccounts.find(a => a.id.toString() === transaction.account);
        let toAccount = bankAccounts.find(a => a.id.toString() === transaction.to_account);
        
        // Fallback para busca por nome (para compatibilidade)
        if (!fromAccount) {
          fromAccount = bankAccounts.find(a => a.name === transaction.account);
        }
        
        if (!toAccount) {
          toAccount = bankAccounts.find(a => a.name === transaction.to_account);
        }
        
        // Se ainda não encontrar, buscar do Supabase
        if (!fromAccount) {
          fromAccount = await fetchBankAccountById(transaction.account);
        }
        
        if (!toAccount) {
          toAccount = await fetchBankAccountById(transaction.to_account);
        }
        
        if (fromAccount) {
          const newFromBalance = fromAccount.balance - transaction.amount;
          
          // Atualizar o saldo da conta de origem no banco de dados
          await supabase
            .from('bank_accounts')
            .update({ balance: newFromBalance })
            .eq('id', fromAccount.id);
          
          // Atualizar o estado local
          setBankAccounts(prev => 
            prev.map(a => a.id === fromAccount.id ? { ...a, balance: newFromBalance } : a)
          );
          
          console.log(`Transferência (origem): Saldo anterior: ${fromAccount.balance}, Valor: ${transaction.amount}, Novo saldo: ${newFromBalance}`);
        }
        
        if (toAccount) {
          const newToBalance = toAccount.balance + transaction.amount;
          
          // Atualizar o saldo da conta de destino no banco de dados
          await supabase
            .from('bank_accounts')
            .update({ balance: newToBalance })
            .eq('id', toAccount.id);
          
          // Atualizar o estado local
          setBankAccounts(prev => 
            prev.map(a => a.id === toAccount.id ? { ...a, balance: newToBalance } : a)
          );
          
          console.log(`Transferência (destino): Saldo anterior: ${toAccount.balance}, Valor: ${transaction.amount}, Novo saldo: ${newToBalance}`);
        }
      }
    } catch (error) {
      console.error('Error in updateAccountBalanceInDB:', error);
    }
  };

  // Função para obter uma conta bancária pelo nome
  const getBankAccountByName = (name: string) => {
    return bankAccounts.find(account => account.name === name);
  };

  // Função para obter uma conta bancária pelo ID
  const getBankAccountById = (id: string) => {
    return bankAccounts.find(account => account.id === id);
  };

  return (
    <BankAccountContext.Provider
      value={{
        bankAccounts,
        transactions,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        confirmPayment,
        getBankAccountByName,
        getBankAccountById,
        reloadData,
        isLoading
      }}
    >
      {children}
    </BankAccountContext.Provider>
  );
};

export default BankAccountProvider; 