
import { createContext, useContext, ReactNode } from "react";

// Shop details
export interface ShopDetails {
  name: string;
  address: string;
  contactNumbers: string[];
  logo: string;
}

// Default shop details
const shopDetails: ShopDetails = {
  name: "Vivaas",
  address: "Shiv Park Phase 2 Shop No-6-7 Pune Solapur Road Lakshumi Colony Opposite HDFC Bank Near Angle School, Pune-412307",
  contactNumbers: ["9657171777", "9765971717"],
  logo: "/lovable-uploads/af8b6a77-de9a-4740-8a70-f21a327aa9f6.png"
};

// Create context
const ShopContext = createContext<ShopDetails>(shopDetails);

// Provider component
export function ShopProvider({ children }: { children: ReactNode }) {
  return (
    <ShopContext.Provider value={shopDetails}>
      {children}
    </ShopContext.Provider>
  );
}

// Hook for using shop context
export function useShop() {
  return useContext(ShopContext);
}
