import { supabase } from "@/integrations/supabase/client";

// Log environment variables check without creating a new client
console.log('Environment variables check:', {
  url: import.meta.env.VITE_SUPABASE_URL ? 'Defined' : 'Undefined',
  key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Defined' : 'Undefined'
});

// Use the existing supabase client instead of creating a new one
export async function testSupabaseConnection() {
  try {
    // Test if we can ping the database - use the correct approach for count
    const { data, error } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase test connection error:', error);
      return { success: false, error };
    }
    
    console.log('Supabase test connection successful:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Supabase test connection exception:', err);
    return { success: false, error: err };
  }
} 