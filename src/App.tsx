import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import OfflinePage from "@/components/OfflinePage";
import { supabase } from "@/integrations/supabase/client";
import { addUserRole, type AppRole } from "@/lib/roleService";
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import BookingHistory from "./pages/BookingHistory";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AdminReports from "./pages/AdminReports";

const queryClient = new QueryClient();

const AppContent = () => {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Handle OAuth callback and role assignment
    const handleAuthStateChange = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Check for pending role from Google OAuth
        const pendingRole = localStorage.getItem('pending_user_role');
        
        if (pendingRole) {
          // Use setTimeout to avoid blocking the auth callback
          setTimeout(async () => {
            try {
              await addUserRole(session.user.id, pendingRole as AppRole);
              localStorage.removeItem('pending_user_role');
            } catch (error) {
              console.error('Failed to assign role after OAuth:', error);
            }
          }, 0);
        }
      }
    });

    return () => {
      handleAuthStateChange.data.subscription.unsubscribe();
    };
  }, []);

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/car/:carId" element={<CarDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="carzy-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
