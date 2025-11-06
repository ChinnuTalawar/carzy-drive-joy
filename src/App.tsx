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
import AddCar from "./pages/AddCar";

const queryClient = new QueryClient();

const AppContent = () => {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Handle OAuth callback and role assignment
    const handleAuthStateChange = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Extract role from OAuth state parameter
        const urlParams = new URLSearchParams(window.location.search);
        const stateParam = urlParams.get('state');
        
        if (stateParam) {
          try {
            const stateData = JSON.parse(atob(stateParam));
            const pendingRole = stateData.role;
            
            if (pendingRole && ['user', 'car-owner'].includes(pendingRole)) {
              // Use setTimeout to avoid blocking the auth callback
              setTimeout(async () => {
                try {
                  await addUserRole(session.user.id, pendingRole as AppRole);
                  // Clean up URL after processing
                  window.history.replaceState({}, document.title, window.location.pathname);
                } catch (error) {
                  // Error already logged in roleService
                }
              }, 0);
            }
          } catch (error) {
            // Invalid state parameter, ignore
          }
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
        <Route path="/add-car" element={<AddCar />} />
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
