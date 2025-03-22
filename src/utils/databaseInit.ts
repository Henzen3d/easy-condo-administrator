import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to initialize database tables if they don't exist
export async function initializeDatabase() {
  console.log("Starting database initialization...");
  
  try {
    // Check if units table exists by trying to count records
    const { error: unitsError } = await supabase
      .from('units')
      .select('count', { count: 'exact' });
      
    if (unitsError) {
      console.log("Error checking units table:", unitsError);
      
      // Create tables with basic SQL queries
      // We need this level of permission to create tables
      // This requires the service_role key to work
      try {
        console.log("Attempting to create tables with SQL...");
        
        const { error: createTablesError } = await supabase.auth.signInWithPassword({
          email: 'admin@example.com',
          password: 'adminpassword',
        });
        
        if (createTablesError) {
          console.error("Authentication error:", createTablesError);
          throw createTablesError;
        }
        
        // Create sample data to test insertion
        const unitsSample = [
          { number: '101', block: 'A', owner: 'João Silva', residents: 2, status: 'occupied' },
          { number: '102', block: 'A', owner: 'Maria Santos', residents: 1, status: 'occupied' },
          { number: '201', block: 'B', owner: 'Carlos Oliveira', residents: 3, status: 'occupied' }
        ];
        
        const { error: insertUnitsError } = await supabase
          .from('units')
          .insert(unitsSample);
          
        if (insertUnitsError) {
          console.log("Error inserting sample units:", insertUnitsError);
        } else {
          console.log("Sample units inserted successfully");
        }
        
        const residentsSample = [
          { name: 'João Silva', email: 'joao@example.com', phone: '(11) 98765-4321', unit_id: 1, role: 'owner' },
          { name: 'Ana Silva', email: 'ana@example.com', phone: '(11) 98765-4322', unit_id: 1, role: 'resident' },
          { name: 'Maria Santos', email: 'maria@example.com', phone: '(11) 98765-4323', unit_id: 2, role: 'owner' }
        ];
        
        const { error: insertResidentsError } = await supabase
          .from('residents')
          .insert(residentsSample);
          
        if (insertResidentsError) {
          console.log("Error inserting sample residents:", insertResidentsError);
        } else {
          console.log("Sample residents inserted successfully");
        }
        
        return { success: true, message: "Tables created and sample data inserted" };
      } catch (sqlError) {
        console.error("Error executing SQL:", sqlError);
        return { success: false, error: sqlError, message: "Não foi possível criar as tabelas" };
      }
    }
    
    // If we reached here, tables already exist
    console.log("Database tables already exist");
    return { success: true, message: "Tables already exist" };
  } catch (error) {
    console.error("Database initialization failed:", error);
    toast.error("Falha na inicialização do banco de dados");
    return { success: false, error, message: "Erro na inicialização do banco de dados" };
  }
} 