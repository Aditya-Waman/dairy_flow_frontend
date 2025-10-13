import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Farmers from "./pages/Farmers";
import Stock from "./pages/Stock";
import Requests from "./pages/Requests";
import Reports from "./pages/Reports";
import Admins from "./pages/Admins";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import DashboardRouter from "./pages/DashboardRouter";
import Protected from "./pages/Protected";
import SuperadminDashboard from "./pages/SuperadminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/signin", element: <SignIn /> },
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/dashboard", element: <DashboardRouter /> },
      {
        element: <Protected />,
        children: [
          { path: "/dashboard/superadmin", element: <SuperadminDashboard /> },
          { path: "/dashboard/admin", element: <AdminDashboard /> },
          { path: "/farmers", element: <Farmers /> },
          { path: "/stock", element: <Stock /> },
          { path: "/requests", element: <Requests /> },
          { path: "/reports", element: <Reports /> },
          { path: "/admins", element: <Admins /> },
          { path: "/settings", element: <Settings /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <DataProvider>
            <RouterProvider router={router} />
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
