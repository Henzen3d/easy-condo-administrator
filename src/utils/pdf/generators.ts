
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { InvoiceData } from './types';
import { generatePixQRCode } from './pixUtils';
import { getMonthName, formatCurrency } from './formatters';

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
      const transactionId = invoiceData.transactionId || 
                            `${invoiceData.unitBlock}${invoiceData.unitNumber}${invoiceData.referenceMonth}${invoiceData.referenceYear}`;
      
      const description = `Cond ${invoiceData.referenceMonth}/${invoiceData.referenceYear}`;
      
      const qrCodeDataURL = await generatePixQRCode(
        invoiceData.pixKey,
        invoiceData.total,
        transactionId,
        invoiceData.beneficiaryName,
        description
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

// Function to prepare invoice data from billing data and unit information
export const prepareInvoiceData = (billingData: any, unitInfo: any): InvoiceData => {
  console.log("Preparing invoice data for unit:", unitInfo.id, unitInfo.block, unitInfo.number);
  console.log("Billing data:", billingData);
  
  // ----- STEP 1: Filter items by type -----
  
  // 1. Global charges (for all units)
  const globalCharges = billingData.chargeItems?.filter((item: any) => {
    return item.targetUnits === "all" || !item.unit || item.unit === "all";
  }) || [];
  
  console.log("Global charges:", globalCharges);
  
  // 2. Unit-specific charges
  const unitSpecificCharges = billingData.chargeItems?.filter((item: any) => {
    return item.targetUnits !== "all" && 
           item.unit && 
           item.unit !== "all" && 
           String(item.unit) === String(unitInfo.id);
  }) || [];
  
  console.log("Unit specific charges:", unitSpecificCharges);
  
  // 3. Gas consumption items for this unit only
  let gasConsumptionItems = [];
  if (billingData.includeGasConsumption && billingData.gasConsumptionItems) {
    gasConsumptionItems = billingData.gasConsumptionItems.filter((item: any) => {
      return String(item.unit) === String(unitInfo.id);
    });
  }
  
  console.log("Gas consumption items for this unit:", gasConsumptionItems);
  
  // 4. Water consumption items for this unit only
  let waterConsumptionItems = [];
  if (billingData.includeWaterConsumption && billingData.waterConsumptionItems) {
    waterConsumptionItems = billingData.waterConsumptionItems.filter((item: any) => {
      return String(item.unit) === String(unitInfo.id);
    });
  }
  
  console.log("Water consumption items for this unit:", waterConsumptionItems);
  
  // ----- STEP 2: Combine all items for this unit -----
  const allUnitItems = [
    ...globalCharges,
    ...unitSpecificCharges,
    ...gasConsumptionItems,
    ...waterConsumptionItems
  ];
  
  console.log("All items for this unit:", allUnitItems);
  
  // ----- STEP 3: Calculate financial totals -----
  
  // Calculate subtotal
  const subtotal = allUnitItems.reduce(
    (sum: number, item: any) => sum + parseFloat(item.value || 0), 
    0
  );
  
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
  
  // ----- STEP 4: Prepare final invoice data object -----
  return {
    condoName: "Meu Condomínio",
    condoAddress: "RUA ALEGRE, 123 - CIDADE BRASILEIRA",
    condoPhone: "(12) 3456-7890",
    condoWebsite: "WWW.GRANDESITE.COM.BR",
    condoEmail: "contato@grandesite.com.br",
    
    residentName: unitInfo.owner || billingData.resident || "Morador",
    unitNumber: unitInfo.number || "101",
    unitBlock: unitInfo.block || "A",
    contactPhone: "(47) 3456-7890",
    
    referenceMonth: billingData.reference?.month !== undefined ? billingData.reference.month : new Date().getMonth(),
    referenceYear: billingData.reference?.year || new Date().getFullYear(),
    dueDate: billingData.dueDate || new Date().toISOString(),
    
    items: allUnitItems.map((item: any) => ({
      description: item.description || "",
      category: item.category || "Geral",
      value: parseFloat(item.value || 0)
    })),
    
    subtotal,
    discount: discountObject,
    total: totalAmount,
    
    pixKey: "05351196000187", // Use CNPJ as an example or email or a CPF number
    transactionId: `${unitInfo.block || "A"}${unitInfo.number || "101"}${billingData.reference?.month || new Date().getMonth()}${billingData.reference?.year || new Date().getFullYear()}`,
    beneficiaryName: "CONDOMINIO EXEMPLO"
  };
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
    condoEmail: "contato@grandesite.com.br",
    
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
    
    pixKey: "05351196000187",
    transactionId: `${unitDisplay.block}${unitDisplay.number}${billingData.reference?.month || new Date().getMonth()}${billingData.reference?.year || new Date().getFullYear()}`,
    beneficiaryName: "CONDOMINIO EXEMPLO"
  };
};
