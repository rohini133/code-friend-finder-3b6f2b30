
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import BillHistory from "./pages/BillHistory";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import { ShopProvider } from "@/contexts/ShopContext";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { toast } from "./components/ui/use-toast";

// Create a new query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error("Query error:", error);
        toast({
          title: "Data Loading Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive"
        });
      }
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation error:", error);
        toast({
          title: "Operation Failed",
          description: "Failed to complete operation. Please try again.",
          variant: "destructive"
        });
      }
    }
  }
});

// Auto-login component for development mode
const DevAutoLogin = () => {
  useEffect(() => {
    const autoLogin = async () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          const { data: session } = await supabase.auth.getSession();
          if (!session?.session) {
            console.log("DEV: Auto-login attempt...");
            // Try to sign in with development credentials
            await supabase.auth.signInWithPassword({
              email: 'dev@example.com',
              password: 'password123',
            });
          }
        } catch (error) {
          console.error("DEV: Auto-login failed:", error);
        }
      }
    };
    
    autoLogin();
  }, []);
  
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ShopProvider>
              <DevAutoLogin />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Index />} />
                
                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/billing" 
                  element={
                    <ProtectedRoute>
                      <Billing />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/bill-history" 
                  element={
                    <ProtectedRoute>
                      <BillHistory />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/inventory" 
                  element={
                    <ProtectedRoute requiredRole="admin" restrictedRoles={["cashier"]}>
                      <Inventory />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/products" 
                  element={
                    <ProtectedRoute requiredRole="admin" restrictedRoles={["cashier"]}>
                      <Products />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requiredRole="admin" restrictedRoles={["cashier"]}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ShopProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
