import { useState, useEffect } from "react";
import { Routes, Route, useLocation, BrowserRouter, Outlet } from "react-router-dom";
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
import BankAccountProvider from "@/contexts/BankAccountContext";

function AppContent() {
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();
  const isIndexPage = location.pathname === '/';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {isMounted && (
        <>
          <BankAccountProvider>
            {isIndexPage ? (
              <Routes>
                <Route path="/" element={<Index />} />
              </Routes>
            ) : (
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/units" element={<Units />} />
                  <Route path="/bank-accounts" element={<BankAccounts />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/utility-management" element={<UtilityManagement />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            )}
          </BankAccountProvider>
          <Toaster 
            position="bottom-right" 
            expand={false} 
            richColors 
          />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
