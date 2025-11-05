import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WelcomeScreen } from "./components/ui/welcome-screen";
import HeaderNavigation from "./components/ui/bottom-navigation";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import SplitBill from "./pages/SplitBill";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/';

  return (
    <>
      {showHeader && <HeaderNavigation />}
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/menu/:category" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/split-bill" element={<SplitBill />} />
        <Route path="/success" element={<Success />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  // Show welcome screen FIRST, before anything else
  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-champagne">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;
