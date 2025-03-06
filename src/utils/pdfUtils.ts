import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

// Interface for invoice data
export interface InvoiceData {
  condoName: string;
  condoAddress: string;
  condoPhone: string;
  condoWebsite: string;
  condoEmail: string;
  
  residentName: string;
  unitNumber: string;
  unitBlock: string;
  contactPhone: string;
  
  referenceMonth: number;
  referenceYear: number;
  dueDate: string;
  
  items: {
    description: string;
    category: string;
    quantity?: number;
    unitValue?: number;
    value: number;
  }[];
  
  subtotal: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  total: number;
  
  pixKey?: string;
  transactionId?: string;
  beneficiaryName?: string;
}

// Generate QR Code for PIX payment
const generatePixQRCode = async (
  pixKey: string,
  value: number,
  transactionId: string,
  beneficiaryName: string
): Promise<string> => {
  try {
    // Format PIX data according to Brazilian Central Bank standards
    // This is a simplified version - in production this should follow the complete spec
    const pixData = `00020126330014BR.GOV.BCB.PIX0111${pixKey}5204000053039865802BR5913${beneficiaryName}6008BRASILIA62070503***6304${Math.floor(Math.random() * 10000)}`;
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(pixData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating PIX QR code:', error);
    return '';
  }
};

// Get month name in Portuguese
const getMonthName = (month: number): string => {
  const date = new Date();
  date.setMonth(month);
  return format(date, 'LLLL', { locale: pt }).toUpperCase();
};

// Format currency as Brazilian Real
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

// Save invoice to Supabase
export const saveInvoiceToStorage = async (pdfBlob: Blob, fileName: string): Promise<string | null> => {
  try {
    // Make sure we're using the faturas/ prefix
    const fullPath = fileName.startsWith('faturas/') ? fileName : `faturas/${fileName}`;
    
    // Upload PDF to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('invoices')
      .upload(fullPath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading invoice to storage:', error);
      return null;
    }
    
    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('invoices')
      .getPublicUrl(data.path);
    
    return publicUrl;
  } catch (error) {
    console.error('Error saving invoice:', error);
    return null;
  }
};

// Main function to generate PDF invoice
export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<Blob> => {
  // Create new PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add logo and header (blue background)
  pdf.setFillColor(41, 98, 255);
  pdf.rect(0, 0, 210, 50, 'F');
  
  // Add condominium name
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.text(invoiceData.condoName, 20, 20);
  
  // Add condominium subtitle
  pdf.setFontSize(12);
  pdf.text('GESTÃO DE CONDOMÍNIO', 20, 30);
  
  // Add condominium contact info
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text(invoiceData.condoAddress, 210 - 20, 15, { align: 'right' });
  pdf.text(invoiceData.condoWebsite, 210 - 20, 20, { align: 'right' });
  pdf.text(invoiceData.condoPhone, 210 - 20, 25, { align: 'right' });
  pdf.text(invoiceData.condoEmail, 210 - 20, 30, { align: 'right' });
  
  // Add invoice title
  pdf.setTextColor(50, 50, 50);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(40);
  pdf.text('Fatura', 20, 80);
  
  // Add invoice reference period
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(14);
  pdf.text(`${getMonthName(invoiceData.referenceMonth)} | ${invoiceData.referenceYear}`, 20, 90);
  
  // Add resident information
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MORADOR:', 20, 110);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoiceData.residentName, 80, 110);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('APARTAMENTO:', 20, 120);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${invoiceData.unitBlock}-${invoiceData.unitNumber}`, 80, 120);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONTATO:', 20, 130);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoiceData.contactPhone, 80, 130);
  
  // Generate invoice items table with adjusted column widths
  autoTable(pdf, {
    startY: 140,
    head: [['SERVIÇO', 'DESCRIÇÃO', 'VALOR']],
    body: invoiceData.items.map(item => [
      item.category,
      item.description,
      formatCurrency(item.value)
    ]),
    headStyles: {
      fillColor: [41, 98, 255],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 110 },
      2: { cellWidth: 40, halign: 'right' }
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      overflow: 'linebreak'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Calculate final table position
  const finalY = (pdf as any).lastAutoTable.finalY + 20;
  
  // Add payment information
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('FORMA DE PAGAMENTO:', 20, finalY);
  pdf.setFont('helvetica', 'normal');
  pdf.text('TRANSFERÊNCIA BANCÁRIA OU PIX', 20, finalY + 8);
  
  // Add total value
  pdf.setFillColor(41, 98, 255);
  pdf.setTextColor(255, 255, 255);
  pdf.roundedRect(140, finalY - 10, 50, 20, 3, 3, 'F');
  pdf.setFontSize(12);
  pdf.text('TOTAL:', 145, finalY);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatCurrency(invoiceData.total), 145, finalY + 8);
  
  // Generate PIX QR code if PIX info is available
  if (invoiceData.pixKey && invoiceData.beneficiaryName) {
    try {
      const qrCodeDataURL = await generatePixQRCode(
        invoiceData.pixKey,
        invoiceData.total,
        invoiceData.transactionId || `${invoiceData.unitBlock}${invoiceData.unitNumber}${invoiceData.referenceMonth}${invoiceData.referenceYear}`,
        invoiceData.beneficiaryName
      );
      
      if (qrCodeDataURL) {
        pdf.addImage(qrCodeDataURL, 'PNG', 70, finalY - 10, 40, 40);
      }
    } catch (error) {
      console.error('Error adding QR code to PDF:', error);
    }
  }
  
  // Add due date information
  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(10);
  pdf.text(`Data de vencimento: ${format(new Date(invoiceData.dueDate), 'dd/MM/yyyy')}`, 20, finalY + 20);
  
  // Add footer
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text('Este documento é uma fatura simplificada e não tem valor fiscal.', 105, 285, { align: 'center' });
  
  // Generate the PDF as blob
  return pdf.output('blob');
};

// Function to generate and download invoice PDF
export const generateAndDownloadInvoice = async (invoiceData: InvoiceData): Promise<void> => {
  try {
    const pdfBlob = await generateInvoicePDF(invoiceData);
    
    // Create a download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fatura_${invoiceData.unitBlock}_${invoiceData.unitNumber}_${getMonthName(invoiceData.referenceMonth)}_${invoiceData.referenceYear}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating and downloading invoice:', error);
    throw error;
  }
};

// Generate mock invoice data for testing
export const generateMockInvoiceData = (billingData: any): InvoiceData => {
  // Get the unit information from billing data
  const unitDisplay = billingData.targetUnits === "all"
    ? { block: "A", number: "101" } // Default unit if "all" is selected
    : { 
        block: billingData.unitBlock || "A", 
        number: billingData.unitNumber || "101"
      };
  
  // Generate mock invoice data based on billing data
  return {
    condoName: "Meu Condomínio",
    condoAddress: "RUA ALEGRE, 123 - CIDADE BRASILEIRA",
    condoPhone: "(12) 3456-7890",
    condoWebsite: "WWW.GRANDESITE.COM.BR",
    condoEmail: "@grandesite",
    
    residentName: billingData.resident || "PEDRO FERNANDES",
    unitNumber: unitDisplay.number,
    unitBlock: unitDisplay.block,
    contactPhone: "(47) 3456-7890",
    
    referenceMonth: billingData.reference?.month || new Date().getMonth(),
    referenceYear: billingData.reference?.year || new Date().getFullYear(),
    dueDate: billingData.dueDate || new Date().toISOString(),
    
    items: billingData.chargeItems?.map((item: any) => ({
      description: item.description,
      category: item.category,
      value: parseFloat(item.value || 0)
    })) || [],
    
    subtotal: billingData.chargeItems?.reduce((sum: number, item: any) => sum + parseFloat(item.value || 0), 0) || 0,
    discount: billingData.earlyPaymentDiscount?.enabled 
      ? {
          type: billingData.earlyPaymentDiscount.discountType as 'percentage' | 'fixed',
          value: parseFloat(billingData.earlyPaymentDiscount.discountValue || 0)
        }
      : undefined,
    total: billingData.chargeItems?.reduce((sum: number, item: any) => sum + parseFloat(item.value || 0), 0) || 0,
    
    pixKey: "exemplo@pix.com",
    transactionId: `${unitDisplay.block}${unitDisplay.number}${billingData.reference?.month || new Date().getMonth()}${billingData.reference?.year || new Date().getFullYear()}`,
    beneficiaryName: "CONDOMINIO EXEMPLO"
  };
};

// Function to prepare invoice data from billing data and unit information
export const prepareInvoiceData = (billingData: any, unitInfo: any): InvoiceData => {
  // Calculate the total amount
  const subtotal = billingData.chargeItems?.reduce(
    (sum: number, item: any) => sum + parseFloat(item.value || 0), 
    0
  ) || 0;
  
  // Calculate discount if applicable
  let discountAmount = 0;
  let discountObject = undefined;
  
  if (billingData.earlyPaymentDiscount?.enabled) {
    discountObject = {
      type: billingData.earlyPaymentDiscount.discountType as 'percentage' | 'fixed',
      value: parseFloat(billingData.earlyPaymentDiscount.discountValue || 0)
    };
    
    discountAmount = discountObject.type === 'percentage'
      ? subtotal * (discountObject.value / 100)
      : discountObject.value;
  }
  
  // Calculate final amount
  const totalAmount = subtotal - discountAmount;
  
  return {
    condoName: "Meu Condomínio",
    condoAddress: "RUA ALEGRE, 123 - CIDADE BRASILEIRA",
    condoPhone: "(12) 3456-7890",
    condoWebsite: "WWW.GRANDESITE.COM.BR",
    condoEmail: "@grandesite",
    
    residentName: unitInfo.owner || billingData.resident || "Morador",
    unitNumber: unitInfo.number || "101",
    unitBlock: unitInfo.block || "A",
    contactPhone: "(47) 3456-7890",
    
    referenceMonth: billingData.reference?.month !== undefined ? billingData.reference.month : new Date().getMonth(),
    referenceYear: billingData.reference?.year || new Date().getFullYear(),
    dueDate: billingData.dueDate || new Date().toISOString(),
    
    items: billingData.chargeItems?.map((item: any) => ({
      description: item.description,
      category: item.category,
      value: parseFloat(item.value || 0)
    })) || [],
    
    subtotal,
    discount: discountObject,
    total: totalAmount,
    
    pixKey: "exemplo@pix.com",
    transactionId: `${unitInfo.block || "A"}${unitInfo.number || "101"}${billingData.reference?.month || new Date().getMonth()}${billingData.reference?.year || new Date().getFullYear()}`,
    beneficiaryName: "CONDOMINIO EXEMPLO"
  };
};
