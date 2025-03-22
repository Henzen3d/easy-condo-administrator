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
  const finalY = (pdf as any).lastAutoTable.finalY + 10;
  
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
  
  // Add due date information - positioned to not overlap with QR code
  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(10);
  pdf.text(`Data de vencimento: ${format(new Date(invoiceData.dueDate), 'dd/MM/yyyy')}`, 140, finalY + 25);
  
  // Generate PIX QR code with improved positioning
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
        invoiceData.city || 'BRASIL',
        description
      );
      
      if (qrCodeDataURL) {
        // Add QR code on the bottom left with better spacing
        pdf.addImage(qrCodeDataURL, 'PNG', 20, finalY + 20, 45, 45);
        
        // Add text to the right of QR code
        pdf.setTextColor(50, 50, 50);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Escaneie o código PIX:', 70, finalY + 30);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Use o aplicativo do seu banco para', 70, finalY + 38);
        pdf.text('pagar via PIX usando este QR Code.', 70, finalY + 46);
        
        // Exibir tipo da chave PIX e chave formatada
        const { identifyPixKeyType, formatPixKey } = require('./pixUtils');
        const pixKeyType = identifyPixKeyType(invoiceData.pixKey);
        const formattedPixKey = formatPixKey(invoiceData.pixKey);
        
        const pixKeyTypeStr = {
          'cpf': 'CPF',
          'cnpj': 'CNPJ',
          'email': 'E-mail',
          'phone': 'Telefone',
          'random': 'Chave Aleatória'
        }[pixKeyType] || 'Chave PIX';
        
        pdf.text(`Tipo de Chave: ${pixKeyTypeStr}`, 70, finalY + 56);
        pdf.text(`Chave PIX: ${formattedPixKey}`, 70, finalY + 64);
      }
    } catch (error) {
      console.error('Error adding QR code to PDF:', error);
    }
  }
  
  // Add footer
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text('Este documento é uma fatura simplificada e não tem valor fiscal.', 105, 285, { align: 'center' });
  
  // Generate the PDF as blob
  return pdf.output('blob');
};

// Function to format PIX key for better display
function formatPixKeyForDisplay(pixKey: string): string {
  if (!pixKey) return '';
  
  // Use the formatPixKey function from pixUtils
  const { formatPixKey } = require('./pixUtils');
  return formatPixKey(pixKey);
}

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
  
  // ----- STEP 1: Filter items by type -----
  
  // 1. Global charges (for all units) - These are charges that apply to every unit
  const globalCharges = billingData.chargeItems?.filter((item: any) => {
    return (item.targetUnits === "all" || 
           !item.unit || 
           item.unit === "all" || 
           item.unit === "" || 
           item.unit === null);
  }) || [];

  // Add condominium fees and reserve funds
  if (billingData.condominiumFees) {
    const condoFee = {
      category: 'Taxa de Condomínio',
      description: billingData.condominiumFees.type === 'fixed' 
        ? 'Taxa Fixa de Condomínio' 
        : 'Taxa Rateada de Condomínio',
      value: billingData.condominiumFees.value,
      targetUnits: 'all'
    };
    globalCharges.push(condoFee);
  }

  if (billingData.reserveFund) {
    const reserveFee = {
      category: 'Fundo de Reserva',
      description: billingData.reserveFund.type === 'fixed' 
        ? 'Contribuição Fixa ao Fundo de Reserva' 
        : 'Contribuição Rateada ao Fundo de Reserva',
      value: billingData.reserveFund.value,
      targetUnits: 'all'
    };
    globalCharges.push(reserveFee);
  }
  
  console.log("Global charges:", globalCharges);
  
  // 2. Unit-specific charges - These are charges targeted specifically to this unit
  const unitSpecificCharges = billingData.chargeItems?.filter((item: any) => {
    // Only include charges specifically for this unit
    return (item.targetUnits !== "all" && 
           item.unit && 
           item.unit !== "all" && 
           item.unit !== "" && 
           item.unit !== null && 
           String(item.unit) === String(unitInfo.id));
  }) || [];

  // Add any unit-specific condominium fees or reserve funds
  if (billingData.unitSpecificFees) {
    const unitFees = billingData.unitSpecificFees.filter((fee: any) => 
      String(fee.unit) === String(unitInfo.id)
    );
    
    unitFees.forEach((fee: any) => {
      if (fee.type === 'condominium') {
        unitSpecificCharges.push({
          category: 'Taxa de Condomínio',
          description: fee.calculationMethod === 'fixed' 
            ? 'Taxa Fixa de Condomínio (Unidade)' 
            : 'Taxa Rateada de Condomínio (Unidade)',
          value: fee.value,
          targetUnits: fee.unit
        });
      } else if (fee.type === 'reserve') {
        unitSpecificCharges.push({
          category: 'Fundo de Reserva',
          description: fee.calculationMethod === 'fixed' 
            ? 'Contribuição Fixa ao Fundo de Reserva (Unidade)' 
            : 'Contribuição Rateada ao Fundo de Reserva (Unidade)',
          value: fee.value,
          targetUnits: fee.unit
        });
      }
    });
  }
  
  console.log("Unit specific charges:", unitSpecificCharges);
  
  // 3. Gas consumption items for this unit only
  let gasConsumptionItems = [];
  if (billingData.includeGasConsumption && billingData.gasConsumptionItems) {
    // Filter gas consumption items to include ONLY those for this specific unit
    gasConsumptionItems = billingData.gasConsumptionItems.filter((item: any) => {
      return String(item.unit) === String(unitInfo.id);
    });
  }
  
  console.log("Gas consumption items for this unit:", gasConsumptionItems);
  
  // 4. Water consumption items for this unit only
  let waterConsumptionItems = [];
  if (billingData.includeWaterConsumption && billingData.waterConsumptionItems) {
    // Filter water consumption items to include ONLY those for this specific unit
    waterConsumptionItems = billingData.waterConsumptionItems.filter((item: any) => {
      return String(item.unit) === String(unitInfo.id);
    });
  }
  
  console.log("Water consumption items for this unit:", waterConsumptionItems);
  
  // ----- STEP 2: Combine all items for this unit -----
  // Make sure there are no duplicates
  const allUnitItems = [
    ...globalCharges,
    ...unitSpecificCharges,
    ...gasConsumptionItems,
    ...waterConsumptionItems
  ];
  
  // Create a map to track unique items by a composite key
  const uniqueItemsMap = new Map();
  
  allUnitItems.forEach(item => {
    // Create a composite key using relevant properties
    const compositeKey = `${item.category || ''}:${item.description || ''}:${item.value || ''}`;
    
    // Only add if this item hasn't been seen before
    if (!uniqueItemsMap.has(compositeKey)) {
      uniqueItemsMap.set(compositeKey, item);
    }
  });
  
  // Convert map values back to array
  const uniqueItems = Array.from(uniqueItemsMap.values());
  
  console.log("All unique items for this unit:", uniqueItems);
  
  // ----- STEP 3: Calculate financial totals -----
  
  // Calculate subtotal from unique items only
  const subtotal = uniqueItems.reduce(
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
    
    items: uniqueItems.map((item: any) => ({
      description: item.description || "",
      category: item.category || "Geral",
      value: parseFloat(item.value || 0)
    })),
    
    subtotal,
    discount: discountObject,
    total: totalAmount,
    
    // Use CPF as PIX key (for testing)
    pixKey: "00446547905", // CPF para testes, conforme solicitado
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
    
    pixKey: "00446547905",
    transactionId: `${unitDisplay.block}${unitDisplay.number}${billingData.reference?.month || new Date().getMonth()}${billingData.reference?.year || new Date().getFullYear()}`,
    beneficiaryName: "CONDOMINIO EXEMPLO"
  };
};
