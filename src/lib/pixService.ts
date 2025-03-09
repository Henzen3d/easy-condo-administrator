import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "./invoiceService";

// Função para gerar um código PIX para pagamento
export async function generatePixCode(invoiceId: number): Promise<string | null> {
  try {
    // Buscar a fatura
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, bank_accounts!invoices_payment_account_id_fkey(*)')
      .eq('id', invoiceId)
      .single();
      
    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Fatura não encontrada');
    
    // Verificar se a fatura já está paga
    if (invoice.status === 'paid') {
      throw new Error('Esta fatura já foi paga');
    }
    
    // Buscar a conta bancária padrão para recebimento
    let bankAccount = null;
    
    // Se a fatura já tem uma conta de pagamento associada, usar essa
    if (invoice.payment_account_id) {
      bankAccount = invoice.bank_accounts;
    } else {
      // Caso contrário, buscar a primeira conta com chave PIX
      const { data: accounts, error: accountsError } = await supabase
        .from('bank_accounts')
        .select('*')
        .not('pix_key', 'is', null)
        .order('name')
        .limit(1);
        
      if (accountsError) throw accountsError;
      if (!accounts || accounts.length === 0) {
        throw new Error('Nenhuma conta bancária com chave PIX configurada');
      }
      
      bankAccount = accounts[0];
    }
    
    if (!bankAccount.pix_key) {
      throw new Error('A conta bancária selecionada não possui chave PIX');
    }
    
    // Gerar o código PIX (formato simplificado para demonstração)
    // Em um ambiente real, você usaria uma biblioteca específica para gerar o QR code PIX
    // seguindo as especificações do Banco Central do Brasil
    
    // Dados para o PIX
    const pixData = {
      keyType: bankAccount.pix_key_type,
      key: bankAccount.pix_key,
      name: bankAccount.name,
      city: "Sua Cidade", // Em um ambiente real, isso viria da configuração do condomínio
      amount: invoice.total_amount.toFixed(2),
      description: `Fatura ${invoice.invoice_number}`,
      reference: invoice.id.toString()
    };
    
    // Simulação de geração de código PIX
    // Em um ambiente real, você usaria algo como o pacote 'pix-utils' ou 'pix-qrcode'
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${pixData.key}5204000053039865802BR5913${pixData.name}6008Sua Cidade62150511${pixData.reference}6304${calculateCRC16(JSON.stringify(pixData))}`;
    
    return pixCode;
  } catch (error) {
    console.error('Erro ao gerar código PIX:', error);
    return null;
  }
}

// Função para gerar QR Code PIX
export async function generatePixQRCode(invoiceId: number): Promise<string | null> {
  try {
    const pixCode = await generatePixCode(invoiceId);
    if (!pixCode) return null;
    
    // Em um ambiente real, você usaria uma biblioteca como 'qrcode' para gerar o QR code
    // Aqui estamos apenas simulando retornando uma URL para uma API de geração de QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;
    
    return qrCodeUrl;
  } catch (error) {
    console.error('Erro ao gerar QR code PIX:', error);
    return null;
  }
}

// Função auxiliar para calcular o CRC16 (simulação)
function calculateCRC16(str: string): string {
  // Em um ambiente real, você implementaria o algoritmo CRC16-CCITT
  // Aqui estamos apenas retornando um valor fixo para demonstração
  return "ABCD";
}

// Função para verificar se uma conta bancária tem PIX configurado
export async function hasBankAccountWithPix(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('id')
      .not('pix_key', 'is', null)
      .limit(1);
      
    if (error) throw error;
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Erro ao verificar contas com PIX:', error);
    return false;
  }
} 