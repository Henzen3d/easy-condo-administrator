import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Billing } from './billingService';

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
    formatDate(billing.dueDate),
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
  return doc.output('dataurlstring');
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
  doc.text(`Vencimento: ${formatDate(billing.dueDate)}`, 20, 90);
  
  // Código de barras simulado
  doc.setFillColor(0);
  for (let i = 0; i < 30; i++) {
    const width = Math.random() * 3 + 1;
    doc.rect(20 + (i * 5), 110, width, 30, 'F');
  }
  
  // Linha de corte
  doc.setDrawColor(0);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(10, 150, 200, 150);
  doc.text('Recibo do Pagador', 105, 160, { align: 'center' });
  
  // Informações do recibo
  doc.text(`Código de Referência: ${billing.id}`, 20, 170);
  doc.text(`Valor: ${formatCurrency(billing.amount)}`, 20, 180);
  doc.text(`Vencimento: ${formatDate(billing.dueDate)}`, 20, 190);
  
  // Rodapé
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    'EasyCondo - Sistema de Gestão de Condomínios',
    105,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );
  
  return doc.output('dataurlstring');
}

// Função para gerar um QR Code PIX (simulado)
export function generatePixQRCode(billing: Billing) {
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
  doc.text(`Vencimento: ${formatDate(billing.dueDate)}`, 20, 90);
  
  // QR Code simulado
  doc.setFillColor(0);
  doc.roundedRect(70, 110, 70, 70, 3, 3, 'S');
  
  // Desenhar um QR code simulado
  const cellSize = 3;
  const startX = 75;
  const startY = 115;
  const size = 60;
  const cells = 20;
  
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      if (Math.random() > 0.7 || 
          (i < 3 && j < 3) || 
          (i > cells - 4 && j < 3) || 
          (i < 3 && j > cells - 4)) {
        doc.setFillColor(0);
        doc.rect(startX + i * cellSize, startY + j * cellSize, cellSize, cellSize, 'F');
      }
    }
  }
  
  // Adicionar bordas especiais nos cantos do QR code
  doc.setFillColor(0);
  // Canto superior esquerdo
  doc.rect(startX, startY, 9, 3, 'F');
  doc.rect(startX, startY, 3, 9, 'F');
  // Canto superior direito
  doc.rect(startX + size - 9, startY, 9, 3, 'F');
  doc.rect(startX + size - 3, startY, 3, 9, 'F');
  // Canto inferior esquerdo
  doc.rect(startX, startY + size - 3, 9, 3, 'F');
  doc.rect(startX, startY + size - 9, 3, 9, 'F');
  
  // Instruções
  doc.setFontSize(11);
  doc.text('1. Abra o aplicativo do seu banco', 20, 200);
  doc.text('2. Escolha a opção de pagamento via PIX', 20, 210);
  doc.text('3. Escaneie o QR code acima', 20, 220);
  doc.text('4. Confirme as informações e finalize o pagamento', 20, 230);
  
  // Rodapé
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    'EasyCondo - Sistema de Gestão de Condomínios',
    105,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );
  
  return doc.output('dataurlstring');
}

// Funções auxiliares
function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function translateStatus(status: string) {
  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Pago',
    overdue: 'Atrasado',
    cancelled: 'Cancelado'
  };
  
  return statusMap[status] || status;
} 