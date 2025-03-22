import { supabase } from "@/integrations/supabase/client";

export interface Billing {
  id: string;
  unit: string;
  unit_id?: number;
  resident: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  is_printed: boolean;
  is_sent: boolean;
  created_at?: string;
  updated_at?: string;
  reference_year?: string;
}

export async function fetchBillings() {
  console.log("billingService.ts: Iniciando fetchBillings()");
  try {
    const { data, error } = await supabase
      .from('billings')
      .select(`
        *,
        units:unit_id (
          number,
          resident_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar cobranças:', error);
      throw error;
    }

    console.log("billingService.ts: Dados recebidos do Supabase:", data);

    return data.map(item => ({
      id: item.id,
      unit: item.units?.number || item.unit || 'N/A',
      unit_id: item.unit_id,
      resident: item.units?.resident_name || item.resident || 'N/A',
      description: item.description,
      amount: Number(item.amount) || 0,
      due_date: item.due_date,
      status: validateBillingStatus(item.status),
      is_printed: Boolean(item.is_printed),
      is_sent: Boolean(item.is_sent),
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error('Erro ao buscar cobranças:', error);
    return [];
  }
}

function validateBillingStatus(status: string): Billing['status'] {
  const validStatuses: Billing['status'][] = ['pending', 'paid', 'overdue', 'cancelled'];
  return validStatuses.includes(status as Billing['status']) 
    ? (status as Billing['status']) 
    : 'pending';
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
    // Buscar a cobrança atual para ter todas as informações
    const { data: billing, error: fetchError } = await supabase
      .from('billings')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    if (!billing) throw new Error('Cobrança não encontrada');
    
    // Atualizar o status
    const { error } = await supabase
      .from('billings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Retornar a cobrança atualizada
    return {
      success: true,
      billing: {
        ...billing,
        status
      }
    };
  } catch (error) {
    console.error('Erro ao atualizar status da cobrança:', error);
    return { success: false };
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

export async function generateUtilityBilling({
  unit,
  utility_type,
  reading_id,
  amount
}: {
  unit: string;
  utility_type: string;
  reading_id: string;
  amount: number;
}) {
  try {
    // 1. Criar a cobrança no Supabase
    const { data: billing, error: billingError } = await supabase
      .from('billings')
      .insert({
        unit,
        description: `Consumo de ${utility_type === 'water' ? 'água' : 'gás'} - ${new Date().toLocaleDateString()}`,
        amount,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        status: 'pending',
        is_printed: false,
        is_sent: false,
        reading_id, // Relacionar com a leitura
        type: 'utility', // Identificar como cobrança de consumo
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (billingError) {
      console.error('Erro ao criar cobrança:', billingError);
      return { success: false, error: billingError };
    }

    // 2. Criar transação pendente
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        description: `Cobrança de ${utility_type === 'water' ? 'água' : 'gás'} - Unidade ${unit}`,
        amount,
        type: 'income',
        category: utility_type === 'water' ? 'Água' : 'Gás',
        status: 'pending',
        date: new Date().toISOString(),
        unit,
        billing_id: billing.id
      });

    if (transactionError) {
      console.error('Erro ao criar transação:', transactionError);
      // Mesmo com erro na transação, retornamos sucesso pois a cobrança foi criada
      return { success: true, data: billing };
    }

    return { success: true, data: billing };
  } catch (error) {
    console.error('Erro ao gerar cobrança de consumo:', error);
    return { success: false, error };
  }
}

