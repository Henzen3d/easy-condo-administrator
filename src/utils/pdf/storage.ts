
import { supabase } from '@/integrations/supabase/client';

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
