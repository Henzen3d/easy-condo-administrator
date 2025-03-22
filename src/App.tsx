import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner"
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Units from "@/pages/Units";
import BankAccounts from "@/pages/BankAccounts";
import Transactions from "@/pages/Transactions";
import Billing from "@/pages/Billing";
import BillingGenerator from "@/pages/BillingGenerator";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import UtilityManagement from "@/pages/UtilityManagement";
import { BankAccountProvider } from "@/contexts/BankAccountContext";
import { supabase } from "@/integrations/supabase/client";

function App() {
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();
  const isIndexPage = location.pathname === '/';

  // Test the database connection when the app loads
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        // Simple check to see if we can connect
        const { error } = await supabase
          .from('units')
          .select('id')
          .limit(1);

        if (error) {
          console.warn('Error connecting to database:', error);
        } else {
          console.log('Successfully connected to database');
        }
      } catch (err) {
        console.error('Database connection error:', err);
      }
    };

    checkDatabaseConnection();
    setIsMounted(true);
  }, []);

  // Se não estiver montado, não renderize nada
  if (!isMounted) {
    return null;
  }

  // Renderiza a página inicial ou o layout com Outlet
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <BankAccountProvider>
        {isIndexPage ? (
          <Index />
        ) : (
          <Layout>
            <Outlet />
          </Layout>
        )}
      </BankAccountProvider>
      <Toaster 
        position="bottom-right" 
        expand={false} 
        richColors 
      />
    </div>
  );
}

export default App;
