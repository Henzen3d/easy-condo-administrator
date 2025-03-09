import { supabase } from '@/integrations/supabase/client';

export type BillingStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Billing {
  id: string;
  unit: string;
  resident: string;
  description: string;
  amount: number;
  dueDate: string;
  status: BillingStatus;
  isPrinted: boolean;
  isSent: boolean;
}

// Função para buscar todas as cobranças
export async function fetchBillings() {
  try {
    const { data, error } = await supabase
      .from('billings')
      .select('*')
      .order('due_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Converter do formato do banco para o formato da aplicação
    return data.map(item => ({
      id: item.id,
      unit: item.unit,
      resident: item.resident,
      description: item.description,
      amount: item.amount,
      dueDate: item.due_date,
      status: item.status as BillingStatus,
      isPrinted: item.is_printed,
      isSent: item.is_sent
    }));
  } catch (error) {
    console.error('Erro ao buscar cobranças:', error);
    return [];
  }
}

// Função para buscar cobranças por unidade
export async function fetchBillingsByUnit(unit: string) {
  try {
    const { data, error } = await supabase
      .from('billings')
      .select('*')
      .eq('unit', unit)
      .order('due_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      unit: item.unit,
      resident: item.resident,
      description: item.description,
      amount: item.amount,
      dueDate: item.due_date,
      status: item.status as BillingStatus,
      isPrinted: item.is_printed,
      isSent: item.is_sent
    }));
  } catch (error) {
    console.error('Erro ao buscar cobranças por unidade:', error);
    return [];
  }
}

// Função para atualizar o status de uma cobrança
export async function updateBillingStatus(id: string, status: BillingStatus) {
  try {
    const { error } = await supabase
      .from('billings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar status da cobrança:', error);
    return false;
  }
}

// Função para marcar uma cobrança como impressa
export async function markBillingAsPrinted(id: string) {
  try {
    const { error } = await supabase
      .from('billings')
      .update({ is_printed: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao marcar cobrança como impressa:', error);
    return false;
  }
}

// Função para marcar uma cobrança como enviada
export async function markBillingAsSent(id: string) {
  try {
    const { error } = await supabase
      .from('billings')
      .update({ is_sent: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao marcar cobrança como enviada:', error);
    return false;
  }
}

// Função para criar uma nova cobrança
export async function createBilling(billing: Omit<Billing, 'id'>) {
  try {
    const { error } = await supabase
      .from('billings')
      .insert({
        unit: billing.unit,
        resident: billing.resident,
        description: billing.description,
        amount: billing.amount,
        due_date: billing.dueDate,
        status: billing.status || 'pending',
        is_printed: billing.isPrinted || false,
        is_sent: billing.isSent || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    // Buscar a cobrança recém-criada
    const { data } = await supabase
      .from('billings')
      .select('*')
      .eq('unit', billing.unit)
      .eq('resident', billing.resident)
      .eq('description', billing.description)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      return {
        ...billing,
        id: data[0].id
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    return null;
  }
}

// Função para agrupar cobranças por unidade (pendentes e atrasadas)
export function groupBillingsByUnit(billings: Billing[]) {
  const filteredBillings = billings.filter(
    billing => billing.status === 'pending' || billing.status === 'overdue'
  );
  
  const grouped: Record<string, {
    unit: string;
    resident: string;
    totalAmount: number;
    items: Billing[];
  }> = {};
  
  filteredBillings.forEach(billing => {
    if (!grouped[billing.unit]) {
      grouped[billing.unit] = {
        unit: billing.unit,
        resident: billing.resident,
        totalAmount: 0,
        items: []
      };
    }
    
    grouped[billing.unit].totalAmount += billing.amount;
    grouped[billing.unit].items.push(billing);
  });
  
  return Object.values(grouped);
} 