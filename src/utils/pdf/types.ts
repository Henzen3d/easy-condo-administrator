
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
