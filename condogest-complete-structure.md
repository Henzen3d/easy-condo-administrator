## Detalhamento dos Componentes Principais

### Componentes de Layout

#### `components/layout/sidebar.tsx`
```tsx
// Barra lateral responsiva
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { mainMenuItems, moreMenuItems } from '@/lib/constants/menu-items';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const pathname = usePathname();

  // Renderiza itens do menu principal
  // Renderiza menu "Mais" quando clicado
  // Botão de toggle para recolher/expandir
}
```

#### `components/layout/navbar.tsx`
```tsx
// Barra superior com pesquisa e perfil
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Search, Moon, Sun, Bell, User,
  Settings, LogOut 
} from 'lucide-react';
import { useTheme } from '@/lib/hooks/use-theme';
import { useAuth } from '@/lib/hooks/use-auth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  // Renderiza campo de pesquisa
  // Renderiza botão de tema
  // Renderiza botão de notificações
  // Renderiza dropdown de perfil com opções
}
```

### Componentes do Dashboard

#### `components/dashboard/finance-summary-card.tsx`
```tsx
// Card de resumo financeiro
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowUp, ArrowDown, DollarSign, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

type FinanceSummaryCardProps = {
  title: string;
  value: number;
  type: 'balance' | 'income' | 'expense' | 'default';
  percentageChange?: number;
  icon?: React.ReactNode;
}

export const FinanceSummaryCard = ({
  title,
  value,
  type,
  percentageChange,
  icon
}: FinanceSummaryCardProps) => {
  // Renderiza card com título, valor e ícone
  // Mostra variação percentual quando disponível
  // Aplica estilo baseado no tipo (receita/despesa)
}
```

#### `components/dashboard/financial-flow-chart.tsx`
```tsx
// Gráfico de fluxo financeiro
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Select } from '../ui/select';
import { formatCurrency } from '@/lib/utils/currency';

type FinancialFlowData = {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

type FinancialFlowChartProps = {
  data: FinancialFlowData[];
  title?: string;
}

export const FinancialFlowChart = ({
  data,
  title = "Fluxo Financeiro"
}: FinancialFlowChartProps) => {
  const [period, setPeriod] = useState<'year' | 'semester' | 'quarter'>('year');
  
  // Filtra dados baseado no período selecionado
  // Renderiza gráfico de linha com receitas, despesas e saldo
  // Permite interação com tooltip e legenda
}
```

### Componentes de Moradores

#### `components/moradores/morador-form.tsx`
```tsx
// Formulário de cadastro/edição de morador
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../ui/form';
import { moradoresSchema } from '@/lib/schemas/moradores';
import { useToast } from '@/lib/hooks/use-toast';

type MoradorFormProps = {
  initialData?: any;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export const MoradorForm = ({
  initialData,
  onSuccess,
  onCancel
}: MoradorFormProps) => {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(moradoresSchema),
    defaultValues: initialData || {
      nome: '',
      email: '',
      telefone: '',
      unidade: '',
      bloco: '',
      tipo: 'Morador'
    }
  });
  
  // Gerencia estado do formulário
  // Validação em tempo real
  // Submissão para API
  // Feedback de sucesso/erro
}
```

### Componentes de Contas Bancárias

#### `components/contas/conta-card.tsx`
```tsx
// Card de conta bancária
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { CreditCard, MoreVertical, Edit, Trash, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { ContaBancaria } from '@/types/conta';
import { useModal } from '@/lib/hooks/use-modal';

type ContaCardProps = {
  conta: ContaBancaria;
  onEdit: (conta: ContaBancaria) => void;
  onDelete: (id: string) => void;
  onTransfer: (fromId: string) => void;
}

export const ContaCard = ({
  conta,
  onEdit,
  onDelete,
  onTransfer
}: ContaCardProps) => {
  // Renderiza card com informações da conta
  // Mostra saldo em destaque
  // Opções de editar, excluir e transferir
}
```

#### `components/contas/transferencia-form.tsx`
```tsx
// Formulário de transferência entre contas
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../ui/form';
import { transferenciaSchema } from '@/lib/schemas/transferencia';
import { useToast } from '@/lib/hooks/use-toast';
import { ContaBancaria } from '@/types/conta';

type TransferenciaFormProps = {
  contas: ContaBancaria[];
  contaOrigem?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TransferenciaForm = ({
  contas,
  contaOrigem,
  onSuccess,
  onCancel
}: TransferenciaFormProps) => {
  // Gerencia seleção de contas origem e destino
  // Valida valor da transferência
  // Submissão para API
  // Feedback de sucesso/erro
}
```

### Componentes de Transações

#### `components/transacoes/transacao-filters.tsx`
```tsx
// Filtros de transações
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { DateRangePicker } from '../ui/date-range-picker';
import { categorias } from '@/lib/constants/categories';
import { Label } from '../ui/label';
import { Filter, X } from 'lucide-react';

type TransacaoFiltersProps = {
  onFilter: (filters: any) => void;
}

export const TransacaoFilters = ({
  onFilter
}: TransacaoFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: undefined,
    category: '',
    conta: '',
    status: '',
    minValue: '',
    maxValue: ''
  });
  
  // Gerencia estado dos filtros
  // Permite limpar filtros
  // Submete filtros para o componente pai
}
```

### Componentes de Cobranças

#### `components/cobrancas/faturamento-form.tsx`
```tsx
// Formulário de geração de faturamento
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { Checkbox } from '../ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../ui/form';
import { faturamentoSchema } from '@/lib/schemas/faturamento';
import { useToast } from '@/lib/hooks/use-toast';

type FaturamentoFormProps = {
  onPreview: (data: any) => void;
  onCancel: () => void;
}

export const FaturamentoForm = ({
  onPreview,
  onCancel
}: FaturamentoFormProps) => {
  // Gerencia seleção de mês e dia de vencimento
  // Opções para incluir taxas fixas e leituras
  // Submete para preview antes de confirmar
}
```

### Componentes de Utilities

#### `components/utilities/leitura-form.tsx`
```tsx
// Formulário de leitura de medidores
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../ui/form';
import { leituraSchema } from '@/lib/schemas/leitura';
import { useToast } from '@/lib/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type LeituraFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
}

export const LeituraForm = ({
  onSuccess,
  onCancel
}: LeituraFormProps) => {
  const [tipo, setTipo] = useState<'agua' | 'gas'>('agua');
  const [leituraAnterior, setLeituraAnterior] = useState(0);
  
  // Carrega leitura anterior automaticamente
  // Valida se leitura atual é maior que anterior
  // Submete leitura para API
}
```

## Supabase - Estrutura de Tabelas

### Tabelas Principais

#### `unidades`
```sql
create table unidades (
  id uuid default uuid_generate_v4() primary key,
  bloco text not null,
  numero text not null,
  area numeric,
  quartos integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint unique_bloco_numero unique (bloco, numero)
);
```

#### `moradores`
```sql
create table moradores (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  email text,
  telefone text,
  tipo text not null check (tipo in ('Proprietário', 'Morador')),
  unidade_id uuid references unidades(id),
  usuario_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint unique_unidade_proprietario unique (unidade_id, tipo) 
    where tipo = 'Proprietário'
);
```

#### `contas_bancarias`
```sql
create table contas_bancarias (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  banco text not null,
  agencia text not null,
  conta text not null,
  tipo text not null check (tipo in ('Corrente', 'Poupança')),
  saldo numeric not null default 0,
  chave_pix text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### `transacoes`
```sql
create table transacoes (
  id uuid default uuid_generate_v4() primary key,
  descricao text not null,
  tipo text not null check (tipo in ('Receita', 'Despesa', 'Transferência')),
  categoria text not null,
  valor numeric not null,
  data date not null,
  conta_id uuid references contas_bancarias(id),
  conta_destino_id uuid references contas_bancarias(id),
  status text not null check (status in ('Confirmado', 'Pendente', 'Cancelado')),
  comprovante_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### `cobrancas`
```sql
create table cobrancas (
  id uuid default uuid_generate_v4() primary key,
  descricao text not null,
  valor numeric not null,
  vencimento date not null,
  data_pagamento date,
  status text not null check (status in ('Pendente', 'Pago', 'Atrasado', 'Cancelado')),
  unidade_id uuid references unidades(id),
  mes_referencia text not null,
  ano_referencia integer not null,
  url_boleto text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone 
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  taxa_juros numeric default 0,
  taxa_multa numeric default 0,
  linha_digitavel text,
  codigo_barras text
);
```

#### `taxas_fixas`
```sql
create table taxas_fixas (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  valor numeric not null,
  tipo text not null check (tipo in ('Condomínio', 'Fundo de Reserva', 'Outro')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### `leituras`
```sql
create table leituras (
  id uuid default uuid_generate_v4() primary key,
  tipo text not null check (tipo in ('Água', 'Gás')),
  unidade_id uuid references unidades(id),
  leitura_anterior numeric not null,
  leitura_atual numeric not null,
  data_leitura date not null,
  consumo numeric generated always as (leitura_atual - leitura_anterior) stored,
  valor_unitario numeric not null,
  valor_total numeric generated always as (consumo * valor_unitario) stored,
  cobranca_id uuid references cobrancas(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### `configuracoes`
```sql
create table configuracoes (
  id uuid default uuid_generate_v4() primary key,
  nome_condominio text not null,
  cnpj text,
  logradouro text,
  numero text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  nome_sindico text,
  email_sindico text,
  telefone_sindico text,
  telefone_condominio text,
  dia_vencimento integer not null check (dia_vencimento between 1 and 31),
  taxa_multa numeric default 2,
  taxa_juros numeric default 0.033,
  valor_padrao_taxa numeric,
  valor_m3_agua numeric,
  valor_m3_gas numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## APIs e Integração com Supabase

### Configuração do Cliente Supabase
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Exemplo de API Route para Moradores
```typescript
// app/api/moradores/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: cookieStore.get, set: () => {}, remove: () => {} } }
    );
    
    const { searchParams } = new URL(request.url);
    const bloco = searchParams.get('bloco');
    const tipo = searchParams.get('tipo');
    
    let query = supabase
      .from('moradores')
      .select(`
        *,
        unidades (
          id,
          bloco,
          numero
        )
      `);
    
    if (bloco) {
      query = query.eq('unidades.bloco', bloco);
    }
    
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: cookieStore.get, set: () => {}, remove: () => {} } }
    );
    
    const body = await request.json();
    const { nome, email, telefone, tipo, unidade_id } = body;
    
    // Verificar se já existe um proprietário para esta unidade
    if (tipo === 'Proprietário') {
      const { data: existingProp } = await supabase
        .from('moradores')
        .select('id')
        .eq('unidade_id', unidade_id)
        .eq('tipo', 'Proprietário')
        .maybeSingle();
      
      if (existingProp) {
        return NextResponse.json(
          { error: 'Esta unidade já possui um proprietário' },
          { status: 400 }
        );
      }
    }
    
    const { data, error } = await supabase
      .from('moradores')
      .insert([
        { nome, email, telefone, tipo, unidade_id }
      ])
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
```

### Serviço de Transações
```typescript
// lib/api/transacoes.ts
import { supabase } from '@/lib/supabase/client';
import { Transacao } from '@/types/transacao';

export async function getTransacoes(filters = {}) {
  const { data, error } = await supabase
    .from('transacoes')
    .select(`
      *,
      contas_bancarias!conta_id (nome, banco),
      contas_destino:contas_bancarias!conta_destino_id (nome, banco)
    `)
    .order('data', { ascending: false });
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export async function criarTransacao(transacao: Omit<Transacao, 'id'>) {
  // Para transações do tipo Receita ou Despesa
  if (transacao.tipo !== 'Transferência') {
    const { data, error } = await supabase
      .from('transacoes')
      .insert([transacao])
      .select();
      
    if (error) {
      throw new Error(error.message);
    }
    
    // Atualiza o saldo da conta
    const multiplicador = transacao.tipo === 'Receita' ? 1 : -1;
    const { error: updateError } = await supabase.rpc('atualizar_saldo_conta', {
      p_conta_id: transacao.conta_id,
      p_valor: transacao.valor * multiplicador
    });
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    return data[0];
  } 
  // Para transferências entre contas
  else {
    const { data, error } = await supabase
      .from('transacoes')
      .insert([transacao])
      .select();
      
    if (error) {
      throw new Error(error.message);
    }
    
    // Debita da conta de origem
    const { error: debitError } = await supabase.rpc('atualizar_saldo_conta', {
      p_conta_id: transacao.conta_id,
      p_valor: -transacao.valor
    });
    
    if (debitError) {
      throw new Error(debitError.message);
    }
    
    // Credita na conta de destino
    const { error: creditError } = await supabase.rpc('atualizar_saldo_conta', {
      p_conta_id: transacao.conta_destino_id!,
      p_valor: transacao.valor
    });
    
    if (creditError) {
      throw new Error(creditError.message);
    }
    
    return data[0];
  }
}
```

## Exemplos de Páginas Principais

### Dashboard
```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { FinanceSummaryCard } from '@/components/dashboard/finance-summary-card';
import { FinancialFlowChart } from '@/components/dashboard/financial-flow-chart';
import { ExpenseCategoriesChart } from '@/components/dashboard/expense-categories';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { CounterCard } from '@/components/dashboard/counter-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDashboardData } from '@/lib/api/dashboard';

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Cards de resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceSummaryCard 
          title="Saldo Total" 
          value={dashboardData.saldoTotal} 
          type="balance" 
        />
        <FinanceSummaryCard 
          title="Receitas (Mês)" 
          value={dashboardData.receitaMes} 
          type="income" 
          percentageChange={dashboardData.receitaVariacao}
        />
        <FinanceSummaryCard 
          title="Despesas (Mês)" 
          value={dashboardData.despesaMes} 
          type="expense" 
          percentageChange={dashboardData.despesaVariacao}
        />
        <FinanceSummaryCard 
          title="Inadimplência" 
          value={dashboardData.inadimplencia} 
          type="default" 
          percentageChange={dashboardData.inadimplenciaVariacao}
        />
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="w-full h-96" />}>
            <FinancialFlowChart data={dashboardData.fluxoFinanceiro} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="w-full h-96" />}>
            <ExpenseCategoriesChart data={dashboardData.categoriasDespesas} />
          </Suspense>
        </div>
      </div>
      
      {/* Transações Recentes e Contadores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="w-full h-96" />}>
            <RecentTransactions transactions={dashboardData.transacoesRecentes} />
          </Suspense>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <CounterCard 
            title="Unidades" 
            value={dashboardData.totalUnidades} 
            icon="Building"
          />
          <CounterCard 
            title="Moradores" 
            value={dashboardData.totalMoradores} 
            icon="Users" 
          />
          <CounterCard 
            title="Contas Bancárias" 
            value={dashboardData.totalContas} 
            icon="CreditCard"
          />
        </div>
      </div>
    </div>
  );
}
```

### Página de Moradores
```tsx
// app/unidades-moradores/page.tsx
import { Suspense } from 'react';
import { MoradorTable } from '@/components/moradores/morador-table';
import { MoradorFilters } from '@/components/moradores/morador-filters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { getMoradores } from '@/lib/api/moradores';

export default async function MoradoresPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const moradores = await getMoradores(searchParams);
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Unidades e Moradores</h1>
        
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          <span>Adicionar Morador</span>
        </Button>
      </div>
      
      <MoradorFilters />
      
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <MoradorTable moradores={moradores} />
      </Suspense>
    </div>
  );
}
```

## Componentes de Formulários e Modals

### Modal para Adicionar Morador
```tsx
// components/moradores/adicionar-morador-modal.tsx
import { useState } from 'react';
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { MoradorForm } from './morador-form';
import { useToast } from '@/lib/hooks/use-toast';
import { createMorador } from '@/lib/api/moradores';

type AdicionarMoradorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AdicionarMoradorModal({
  open,
  onOpenChange,
  onSuccess
}: AdicionarMoradorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast }