
import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
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

function App() {
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isIndexPage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {isMounted && (
        <>
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
                <Route path="/billing-generator" element={<BillingGenerator />} />
                <Route path="/utility-management" element={<UtilityManagement />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          )}
          <Toaster position="bottom-right" />
        </>
      )}
    </div>
  );
}

export default App;
