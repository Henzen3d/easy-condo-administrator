import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Units from "./pages/Units";
import Residents from "./pages/Residents";
import Billing from "./pages/Billing";
import InvoiceHistory from "./pages/InvoiceHistory";
import BillingGenerator from "./pages/BillingGenerator";
import Transactions from "./pages/Transactions";
import BankAccounts from "./pages/BankAccounts";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import App from "./App";
import UtilityManagement from "./pages/UtilityManagement";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/units",
        element: <Units />,
      },
      {
        path: "/residents",
        element: <Residents />,
      },
      {
        path: "/billing",
        element: <Billing />,
      },
      {
        path: "/invoice-history",
        element: <InvoiceHistory />,
      },
      {
        path: "/billing-generator",
        element: <BillingGenerator />,
      },
      {
        path: "/transactions",
        element: <Transactions />,
      },
      {
        path: "/bank-accounts",
        element: <BankAccounts />,
      },
      {
        path: "/utility-management",
        element: <UtilityManagement />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
]);

export default router; 