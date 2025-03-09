import { supabase } from '@/integrations/supabase/client';
import { Billing, updateBillingStatus } from './billingService';

export type InvoiceStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'pix' | 'bank_transfer' | 'cash' | 'check' | 'other';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  referenceMonth: number;
  referenceYear: number;
  unit: string;
  unitId: number;
  resident: string;
  totalAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  paymentDate: string | null;
  paymentMethod: PaymentMethod | null;
  paymentAccountId: number | null;
  notes: string | null;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id?: number;
  invoiceId?: number;
  billingId: string;
  description: string;
  amount: number;
}

/**
 * Cria uma nova fatura no banco de dados
 */
export async function createInvoice(
  unitId: number,
  unit: string,
  resident: string,
  dueDate: string,
  billingIds: number[],
  referenceMonth: number,
  referenceYear: number,
  notes?: string
): Promise<Invoice | null> {
  try {
    // Buscar as cobranças relacionadas
    const { data: billings, error: billingsError } = await supabase
      .from('billings')
      .select('*')
      .in('id', billingIds);
      
    if (billingsError) throw billingsError;
    if (!billings || billings.length === 0) {
      throw new Error('Nenhuma cobrança encontrada para os IDs fornecidos');
    }
    
    // Calcular o valor total
    const totalAmount = billings.reduce((sum, billing) => sum + billing.amount, 0);
    
    // Gerar número da fatura
    const invoiceNumber = await generateInvoiceNumber();
    
    // Criar a fatura
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        reference_month: referenceMonth,
        reference_year: referenceYear,
        unit_id: unitId,
        unit,
        resident,
        total_amount: totalAmount,
        due_date: dueDate,
        status: 'pending',
        notes
      })
      .select()
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('Erro ao criar fatura');
    
    // Criar os itens da fatura
    const invoiceItems = billings.map(billing => ({
      invoice_id: data.id,
      billing_id: billing.id,
      description: billing.description,
      amount: billing.amount
    }));
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);
      
    if (itemsError) throw itemsError;
    
    // Retornar a fatura criada
    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      referenceMonth: data.reference_month,
      referenceYear: data.reference_year,
      unit: data.unit,
      unitId: data.unit_id,
      resident: data.resident,
      totalAmount: data.total_amount,
      dueDate: data.due_date,
      status: data.status as InvoiceStatus,
      notes: data.notes,
      items: invoiceItems.map((item, index) => ({
        id: null, // ID será gerado pelo banco
        invoiceId: data.id,
        billingId: item.billing_id,
        description: item.description,
        amount: item.amount
      }))
    };
  } catch (error) {
    console.error('Erro ao criar fatura:', error);
    return null;
  }
}

/**
 * Busca todas as faturas
 */
export async function fetchInvoices() {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      invoiceNumber: item.invoice_number,
      referenceMonth: item.reference_month,
      referenceYear: item.reference_year,
      unit: item.unit,
      unitId: item.unit_id,
      resident: item.resident,
      totalAmount: item.total_amount,
      dueDate: item.due_date,
      status: item.status,
      paymentDate: item.payment_date,
      paymentMethod: item.payment_method,
      paymentAccountId: item.payment_account_id,
      notes: item.notes,
      items: []
    }));
  } catch (error) {
    console.error('Erro ao buscar faturas:', error);
    return [];
  }
}

/**
 * Busca uma fatura específica com seus itens
 */
export async function fetchInvoiceWithItems(invoiceId: number) {
  try {
    // Buscar a fatura
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
      
    if (invoiceError) throw invoiceError;
    if (!invoiceData) throw new Error('Fatura não encontrada');
    
    // Buscar os itens da fatura
    const { data: itemsData, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);
      
    if (itemsError) throw itemsError;
    
    // Converter para o formato da aplicação
    const invoice: Invoice = {
      id: invoiceData.id,
      invoiceNumber: invoiceData.invoice_number,
      referenceMonth: invoiceData.reference_month,
      referenceYear: invoiceData.reference_year,
      unit: invoiceData.unit,
      unitId: invoiceData.unit_id,
      resident: invoiceData.resident,
      totalAmount: invoiceData.total_amount,
      dueDate: invoiceData.due_date,
      status: invoiceData.status,
      paymentDate: invoiceData.payment_date,
      paymentMethod: invoiceData.payment_method,
      paymentAccountId: invoiceData.payment_account_id,
      notes: invoiceData.notes,
      items: itemsData.map(item => ({
        id: item.id,
        invoiceId: item.invoice_id,
        billingId: item.billing_id,
        description: item.description,
        amount: item.amount
      }))
    };
    
    return invoice;
  } catch (error) {
    console.error('Erro ao buscar fatura com itens:', error);
    return null;
  }
}

/**
 * Atualiza o status de uma fatura
 */
export async function updateInvoiceStatus(invoiceId: number, status: InvoiceStatus) {
  try {
    const { error } = await supabase
      .from('invoices')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', invoiceId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status da fatura:', error);
    return false;
  }
}

/**
 * Marca uma fatura como paga
 */
export async function markInvoiceAsPaid(
  invoiceId: number, 
  paymentMethod: PaymentMethod, 
  paymentAccountId: number,
  paymentDate: string = new Date().toISOString().split('T')[0]
) {
  try {
    // Buscar a fatura
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
      
    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Fatura não encontrada');
    
    // Iniciar uma transação para garantir consistência
    // 1. Atualizar o status da fatura
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        payment_date: paymentDate,
        payment_method: paymentMethod,
        payment_account_id: paymentAccountId,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId);
      
    if (updateError) throw updateError;
    
    // 2. Buscar os itens da fatura para atualizar as cobranças relacionadas
    const { data: invoiceItems, error: itemsError } = await supabase
      .from('invoice_items')
      .select('billing_id')
      .eq('invoice_id', invoiceId);
      
    if (itemsError) throw itemsError;
    
    // 3. Atualizar o status das cobranças para 'paid'
    if (invoiceItems && invoiceItems.length > 0) {
      const billingIds = invoiceItems.map(item => item.billing_id);
      
      const { error: billingsError } = await supabase
        .from('billings')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .in('id', billingIds);
        
      if (billingsError) throw billingsError;
    }
    
    // 4. Atualizar o saldo da conta bancária
    const { data: account, error: accountError } = await supabase
      .from('bank_accounts')
      .select('balance')
      .eq('id', paymentAccountId)
      .single();
      
    if (accountError) throw accountError;
    if (!account) throw new Error('Conta bancária não encontrada');
    
    const newBalance = account.balance + invoice.total_amount;
    
    const { error: balanceError } = await supabase
      .from('bank_accounts')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentAccountId);
      
    if (balanceError) throw balanceError;
    
    // 5. Registrar a transação
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        account: paymentAccountId.toString(),
        amount: invoice.total_amount,
        category: 'Receita',
        date: paymentDate,
        description: `Pagamento da fatura ${invoice.invoice_number}`,
        payee: invoice.resident,
        status: 'completed',
        type: 'income',
        unit: invoice.unit
      });
      
    if (transactionError) throw transactionError;
    
    return true;
  } catch (error) {
    console.error('Erro ao marcar fatura como paga:', error);
    return false;
  }
}

/**
 * Edita uma fatura existente
 */
export async function editInvoice(
  invoiceId: number,
  updates: {
    dueDate?: string;
    notes?: string;
    status?: InvoiceStatus;
  }
) {
  try {
    const { error } = await supabase
      .from('invoices')
      .update({ 
        due_date: updates.dueDate,
        notes: updates.notes,
        status: updates.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erro ao editar fatura:', error);
    return false;
  }
}

/**
 * Verifica e atualiza o status das faturas vencidas
 */
export async function updateOverdueInvoices() {
  try {
    const { error } = await supabase.rpc('update_overdue_invoices');
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao atualizar faturas vencidas:', error);
    return false;
  }
}

// Função para gerar o número da fatura
export async function generateInvoiceNumber(): Promise<string> {
  try {
    // Buscar o último número de fatura
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    
    // Formato: INV-AAAAMM-XXXX (ano, mês, sequencial)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `INV-${year}${month}-`;
    
    let sequentialNumber = 1;
    
    // Se encontrou uma fatura anterior, incrementa o número sequencial
    if (data && data.length > 0 && data[0].invoice_number) {
      const lastInvoiceNumber = data[0].invoice_number;
      
      // Verificar se o prefixo é o mesmo (mesmo mês e ano)
      if (lastInvoiceNumber.startsWith(prefix)) {
        // Extrair o número sequencial e incrementar
        const lastSequential = parseInt(lastInvoiceNumber.split('-')[2], 10);
        sequentialNumber = lastSequential + 1;
      }
    }
    
    // Formatar o número sequencial com zeros à esquerda (4 dígitos)
    const formattedSequential = String(sequentialNumber).padStart(4, '0');
    
    return `${prefix}${formattedSequential}`;
  } catch (error) {
    console.error('Erro ao gerar número de fatura:', error);
    // Fallback: gerar um número baseado no timestamp
    const timestamp = Date.now().toString().slice(-8);
    return `INV-${timestamp}`;
  }
} 