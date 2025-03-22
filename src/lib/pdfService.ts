import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';
import { Billing } from './billingService';
import { format } from 'date-fns';

// Adicionar declaração de tipo para jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Função para gerar um PDF de resumo de cobranças por unidade
export function generateBillingsSummaryPDF(
  unit: string,
  resident: string,
  billings: Billing[],
  totalAmount: number
) {
  // Criar uma nova instância do jsPDF
  const doc = new jsPDF() as any;
  
  // Adicionar logo e cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('EasyCondo', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumo de Cobranças', 105, 30, { align: 'center' });
  
  // Informações da unidade
  doc.setFontSize(12);
  doc.text(`Unidade: ${unit}`, 20, 45);
  doc.text(`Morador: ${resident}`, 20, 52);
  doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 59);
  
  // Informações de total
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 65, 170, 15, 'F');
  doc.setFontSize(12);
  doc.text('Total a pagar:', 25, 75);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(totalAmount), 160, 75, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  
  // Tabela de cobranças
  const tableColumn = ['ID', 'Descrição', 'Vencimento', 'Status', 'Valor'];
  const tableRows = billings.map(billing => [
    billing.id,
    billing.description,
    formatDate(billing.due_date),
    translateStatus(billing.status),
    formatCurrency(billing.amount)
  ]);
  
  doc.autoTable({
    startY: 90,
    head: [tableColumn],
    body: tableRows,
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30, halign: 'right' }
    },
    margin: { top: 90 }
  });
  
  // Adicionar rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      'EasyCondo - Sistema de Gestão de Condomínios',
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }
  
  // Adicionar instruções de pagamento
  const finalY = doc.lastAutoTable.finalY || 120;
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Instruções de Pagamento:', 20, finalY + 20);
  doc.setFontSize(10);
  doc.text('1. O pagamento pode ser realizado via PIX ou boleto bancário.', 20, finalY + 30);
  doc.text('2. Após o vencimento, serão cobrados juros de 1% ao mês e multa de 2%.', 20, finalY + 37);
  doc.text('3. Em caso de dúvidas, entre em contato com a administração do condomínio.', 20, finalY + 44);
  
  // Retornar o PDF como URL de dados
  try {
    const pdfOutput = doc.output('arraybuffer');
    const pdfBlob = new Blob([pdfOutput], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdfBlob);
    console.log('Summary PDF blob URL created:', blobUrl.substring(0, 50) + '...');
    return blobUrl;
  } catch (error) {
    console.error('Error creating summary PDF blob URL:', error);
    // Fallback to data URL in case of error
    return doc.output('dataurlstring');
  }
}

// Função para gerar um PDF de boleto (simplificado)
export function generateBillingBoleto(billing: Billing) {
  const doc = new jsPDF() as any;
  
  // Cabeçalho
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Boleto de Cobrança', 105, 20, { align: 'center' });
  
  // Informações do boleto
  doc.setFontSize(12);
  doc.text(`Código de Referência: ${billing.id}`, 20, 40);
  doc.text(`Unidade: ${billing.unit}`, 20, 50);
  doc.text(`Morador: ${billing.resident}`, 20, 60);
  doc.text(`Descrição: ${billing.description}`, 20, 70);
  doc.text(`Valor: ${formatCurrency(billing.amount)}`, 20, 80);
  doc.text(`Vencimento: ${formatDate(billing.due_date)}`, 20, 90);
  
  // Código de barras realista (simulando padrão FEBRABAN)
  // Geralmente um código de barras de boleto tem 44 dígitos
  const barcode = generateFakeBarcode(billing);
  doc.setFontSize(10);
  doc.text(`Código de barras: ${barcode}`, 20, 100);
  
  // Desenhar o código de barras de forma mais realista
  drawBarcode(doc, barcode, 20, 110, 170, 20);
  
  // Linha de corte
  doc.setDrawColor(0);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(10, 150, 200, 150);
  doc.text('Recibo do Pagador', 105, 160, { align: 'center' });
  
  // Informações do recibo
  doc.text(`Código de Referência: ${billing.id}`, 20, 170);
  doc.text(`Valor: ${formatCurrency(billing.amount)}`, 20, 180);
  doc.text(`Vencimento: ${formatDate(billing.due_date)}`, 20, 190);
  
  // Adicionar instruções de pagamento
  doc.setFontSize(10);
  doc.text('Instruções:', 20, 210);
  doc.text('1. Pagável em qualquer banco até o vencimento', 20, 220);
  doc.text('2. Após o vencimento, juros de 1% ao mês + multa de 2%', 20, 230);
  doc.text('3. Em caso de dúvidas, entre em contato com a administração', 20, 240);
  
  // Rodapé
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    'EasyCondo - Sistema de Gestão de Condomínios',
    105,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );
  
  try {
    const pdfOutput = doc.output('arraybuffer');
    const pdfBlob = new Blob([pdfOutput], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdfBlob);
    console.log('Boleto PDF blob URL created:', blobUrl.substring(0, 50) + '...');
    return blobUrl;
  } catch (error) {
    console.error('Error creating boleto PDF blob URL:', error);
    // Fallback to data URL in case of error
    return doc.output('dataurlstring');
  }
}

// Função auxiliar para gerar código de barras simulado
function generateFakeBarcode(billing: Billing): string {
  // Simula um código de barras no padrão FEBRABAN (44 dígitos)
  // Em um sistema real, este seria gerado conforme as regras específicas do banco
  
  // Formato: 
  // - 3 dígitos: código do banco (exemplo: 341 para Itaú)
  // - 1 dígito: código da moeda (9 para Real)
  // - 1 dígito: DV do código de barras
  // - 4 dígitos: fator de vencimento (dias desde 07/10/1997)
  // - 10 dígitos: valor (8 inteiros + 2 decimais)
  // - 25 dígitos: campo livre (identificação da empresa/pagamento)
  
  const bankCode = '341'; // Itaú como exemplo
  const currencyCode = '9';
  const checkDigit = '8'; // Em um sistema real seria calculado
  
  // Calcular fator de vencimento (exemplo simples)
  const baseDate = new Date('1997-10-07');
  const dueDate = new Date(billing.due_date);
  const diffTime = Math.abs(dueDate.getTime() - baseDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const dueFactor = diffDays.toString().padStart(4, '0');
  
  // Formatar valor (centavos sem ponto)
  const valueStr = Math.floor(billing.amount * 100)
    .toString()
    .padStart(10, '0');
  
  // Campo livre (pode conter informações como código do cliente)
  // Em um sistema real, seguiria regras específicas do banco
  const freeField = `${billing.id.toString().padStart(10, '0')}${Date.now().toString().substring(0, 15).padStart(15, '0')}`;
  
  return `${bankCode}${currencyCode}${checkDigit}${dueFactor}${valueStr}${freeField}`;
}

// Função para desenhar um código de barras
function drawBarcode(doc: any, barcode: string, x: number, y: number, width: number, height: number) {
  const digitWidth = width / barcode.length;
  
  doc.setFillColor(0);
  
  for (let i = 0; i < barcode.length; i++) {
    const digit = parseInt(barcode[i], 10);
    const barWidth = (digit + 1) * 0.3; // Largura variável baseada no dígito
    
    if (i % 2 === 0) { // Alternando barras para simular um código de barras real
      doc.rect(x + (i * digitWidth), y, barWidth, height, 'F');
    }
  }
  
  // Adicionar o código numérico abaixo do código de barras
  doc.setFontSize(8);
  doc.text(barcode, x, y + height + 10, { align: 'left' });
}

// Função para gerar um QR Code PIX real
export async function generatePixQRCode(billing: Billing) {
  const doc = new jsPDF() as any;
  
  // Cabeçalho
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Pagamento via PIX', 105, 20, { align: 'center' });
  
  // Informações do PIX
  doc.setFontSize(12);
  doc.text(`Código de Referência: ${billing.id}`, 20, 40);
  doc.text(`Unidade: ${billing.unit}`, 20, 50);
  doc.text(`Morador: ${billing.resident}`, 20, 60);
  doc.text(`Descrição: ${billing.description}`, 20, 70);
  doc.text(`Valor: ${formatCurrency(billing.amount)}`, 20, 80);
  
  try {
    // Importar as funções de utils/pdf para gerar QR code PIX
    // Isso permite usar a versão mais avançada com a biblioteca pix-payload
    const { generatePixQRCode } = await import('@/utils/pdf/pixUtils');
    const { identifyPixKeyType, formatPixKey } = await import('@/utils/pdf/pixUtils');
    
    // Buscar conta bancária com chave PIX no Supabase
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Buscar a primeira conta bancária com chave PIX
    const { data: bankAccounts, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .not('pix_key', 'is', null)
      .order('name')
      .limit(1);
    
    if (error) {
      throw new Error(`Erro ao buscar conta bancária: ${error.message}`);
    }
    
    if (!bankAccounts || bankAccounts.length === 0) {
      throw new Error('Nenhuma conta bancária com chave PIX encontrada');
    }
    
    // Obter dados da conta bancária
    const bankAccount = bankAccounts[0];
    const pixKey = bankAccount.pix_key;
    const pixKeyType = bankAccount.pix_key_type || 'cpf'; // Usar o tipo cadastrado ou cpf como fallback
    const beneficiaryName = bankAccount.name || 'Condomínio';
    
    // Se não houver chave PIX, lançar erro
    if (!pixKey) {
      throw new Error('A conta bancária não possui chave PIX configurada');
    }
    
    console.log(`Usando chave PIX da conta "${bankAccount.name}": ${pixKey} do tipo ${pixKeyType}`);
    
    // Definir data de vencimento do PIX conforme regra:
    // - Até o décimo dia do mês atual se a data atual for <= dia 10
    // - Até o décimo dia do mês seguinte se a data atual for > dia 10
    const today = new Date();
    let dueDate = new Date();
    
    if (today.getDate() <= 10) {
      // Se estamos até o dia 10 do mês, o vencimento é dia 10 do mês atual
      dueDate.setDate(10);
    } else {
      // Se estamos após o dia 10, o vencimento é dia 10 do mês seguinte
      dueDate.setMonth(dueDate.getMonth() + 1);
      dueDate.setDate(10);
    }
    
    // Garantir que a data de vencimento seja sempre futura
    if (dueDate <= today) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
    
    // Formatar data para exibição
    const pixDueDateFormatted = formatDate(dueDate.toISOString());
    
    // Adicionar informação de vencimento do PIX
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0); // Texto em vermelho para destacar
    doc.text(`Vencimento PIX: ${pixDueDateFormatted}`, 20, 90);
    
    console.log(`Data de vencimento do PIX definida para: ${pixDueDateFormatted}`);
    
    // Gerar ID de transação único e simplificado
    // Use apenas números para compatibilidade com os requisitos do PIX
    const transactionId = `${billing.id}${Date.now().toString().substring(0, 5)}`;
    
    // Descrição simplificada
    const description = `Cond ${billing.id}`;
    
    // Obter cidade do banco de dados ou usar SAO PAULO como padrão
    const city = bankAccount.city || "SAO PAULO";
    
    console.log(`Gerando QR Code PIX para transação: ${transactionId}`);
    
    // Gerar QR code usando a função utilitária
    const qrCodeDataURL = await generatePixQRCode(
      pixKey,
      billing.amount,
      transactionId,
      beneficiaryName,
      city, // Cidade real do beneficiário (não usar "BRASIL" como país)
      description, // Descrição simplificada do pagamento
      dueDate.toISOString().split('T')[0] // Data de vencimento no formato YYYY-MM-DD
    );
    
    if (qrCodeDataURL) {
      // Adicionar QR code ao PDF com posicionamento adequado
      doc.addImage(qrCodeDataURL, 'PNG', 75, 110, 60, 60);
      
      // Adicionar borda ao redor do QR Code
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(74.5, 109.5, 61, 61);
      
      // Mapear o tipo de chave PIX para uma string amigável usando o tipo registrado no banco
      const pixKeyTypeStr = {
        'cpf': 'Chave Pix CPF',
        'cnpj': 'Chave Pix CNPJ',
        'email': 'Chave Pix E-mail',
        'phone': 'Chave Pix Telefone',
        'random': 'Chave Pix Aleatória'
      }[pixKeyType.toLowerCase()] || 'Chave PIX';
      
      const formattedPixKey = formatPixKey(pixKey);
      
      // Informações do tipo de chave e chave formatada
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Resetar a cor do texto para preto
      doc.text(`Tipo: ${pixKeyTypeStr}`, 65, 180);
      doc.text(`Chave PIX: ${formattedPixKey}`, 65, 190);
      doc.text(`Beneficiário: ${beneficiaryName}`, 65, 200);
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    
    // Add detailed error information
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text('Erro ao gerar QR Code PIX', 105, 140, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Detalhes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 105, 150, { align: 'center' });
  }
  
  // Instruções simplificadas
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Abra o app do seu banco', 20, 200);
  doc.text('2. Escolha pagar via PIX', 20, 210);
  doc.text('3. Escaneie o QR code acima', 20, 220);
  doc.text('4. Confirme o pagamento', 20, 230);
  
  // Rodapé
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('EasyCondo - Sistema de Gestão de Condomínios', 105, 290, { align: 'center' });
  
  console.log('PDF with PIX QR code generated successfully');
  
  try {
    // Return as blob URL with explicit content type
    const pdfOutput = doc.output('arraybuffer');
    const pdfBlob = new Blob([pdfOutput], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdfBlob);
    console.log('PDF blob URL created:', blobUrl.substring(0, 50) + '...');
    return blobUrl;
  } catch (error) {
    console.error('Error creating blob URL:', error);
    // Fallback to data URL in case of error
    return doc.output('dataurlstring');
  }
}

// Funções auxiliares
function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

function translateStatus(status: string) {
  const statusMap: Record<string, string> = {
    'pending': 'Pendente',
    'paid': 'Pago',
    'overdue': 'Atrasado',
    'cancelled': 'Cancelado'
  };
  
  return statusMap[status] || status;
} 