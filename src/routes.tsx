import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import NotFound from "./pages/NotFound";

// Loading component for lazy loaded routes
const PageLoading = () => (
  <div className="flex items-center justify-center h-full w-full min-h-[400px]">
    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Lazy load all page components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Units = lazy(() => import("./pages/Units"));
const Billing = lazy(() => import("./pages/Billing"));
const InvoiceHistory = lazy(() => import("./pages/InvoiceHistory"));
const BillingGenerator = lazy(() => import("./pages/BillingGenerator"));
const Transactions = lazy(() => import("./pages/Transactions"));
const BankAccounts = lazy(() => import("./pages/BankAccounts"));
const Settings = lazy(() => import("./pages/Settings"));
const UtilityManagement = lazy(() => import("./pages/UtilityManagement"));
const Reports = lazy(() => import("./pages/Reports"));

// Wrap component with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: "", // Rota vazia para o index
        element: null, // O App.tsx já vai renderizar o Index
      },
      {
        path: "dashboard",
        element: withSuspense(Dashboard),
      },
      {
        path: "units",
        element: withSuspense(Units),
      },
      {
        path: "billing",
        element: withSuspense(Billing),
      },
      {
        path: "invoice-history",
        element: withSuspense(InvoiceHistory),
      },
      {
        path: "billing-generator",
        element: withSuspense(BillingGenerator),
      },
      {
        path: "transactions",
        element: withSuspense(Transactions),
      },
      {
        path: "bank-accounts",
        element: withSuspense(BankAccounts),
      },
      {
        path: "utility-management",
        element: withSuspense(UtilityManagement),
      },
      {
        path: "reports",
        element: withSuspense(Reports),
      },
      {
        path: "settings",
        element: withSuspense(Settings),
      }
    ],
  },
]);

export default router; 