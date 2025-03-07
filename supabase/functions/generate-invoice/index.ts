import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types (simplified from frontend)
interface InvoiceData {
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

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the invoice data from the request
    const invoiceData: InvoiceData = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create the invoices bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      throw new Error(`Error checking buckets: ${bucketsError.message}`);
    }

    const invoicesBucket = buckets?.find(b => b.name === 'invoices');
    if (!invoicesBucket) {
      const { error: createError } = await supabase
        .storage
        .createBucket('invoices', { public: true });

      if (createError) {
        throw new Error(`Error creating bucket: ${createError.message}`);
      }
    }

    // Check if PIX key is available, if not, use default phone number
    if (!invoiceData.pixKey) {
      invoiceData.pixKey = "00446547905"; // CPF para testes
    }

    // Ensure there is a transaction ID for the PIX code
    if (!invoiceData.transactionId) {
      invoiceData.transactionId = `${invoiceData.unitBlock}${invoiceData.unitNumber}${invoiceData.referenceMonth}${invoiceData.referenceYear}`;
    }

    // Ensure there's a beneficiary name for the PIX
    if (!invoiceData.beneficiaryName) {
      invoiceData.beneficiaryName = "CONDOMINIO EXEMPLO";
    }

    // In a real implementation, you would:
    // 1. Generate the PDF on the server using a library like PDFKit
    // 2. Save it to Supabase Storage
    // 3. Return the public URL to the client

    // For this demo, we'll simulate a successful operation
    const simulatedUrl = `${supabaseUrl}/storage/v1/object/public/invoices/faturas/fatura_${invoiceData.unitBlock}_${invoiceData.unitNumber}_${invoiceData.referenceMonth}_${invoiceData.referenceYear}.pdf`;

    // Return the result
    return new Response(
      JSON.stringify({
        success: true,
        message: "Invoice generated successfully",
        invoiceUrl: simulatedUrl,
        pixData: {
          key: invoiceData.pixKey,
          transactionId: invoiceData.transactionId,
          beneficiaryName: invoiceData.beneficiaryName,
          amount: invoiceData.total
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
  } catch (error) {
    console.error("Error generating invoice:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to generate invoice",
        error: error.message
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
  }
});
