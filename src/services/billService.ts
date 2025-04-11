
import { Bill, CartItem, BillWithItems, mapBillToRawBill, mapRawBillToBill } from "@/types/supabase-extensions";
import { sampleBills } from "@/data/sampleData";
import { decreaseStock } from "./productService";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// In a real application, these functions would make API calls to a backend
let bills = [...sampleBills];

export const getBills = async (): Promise<Bill[]> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 300));
  // Return bills sorted by date with most recent first
  return [...bills].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getBill = async (id: string): Promise<Bill | undefined> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return bills.find(bill => bill.id === id);
};

export const createBill = async (
  items: CartItem[],
  customerDetails: {
    name?: string;
    phone?: string;
    email?: string;
  },
  paymentMethod: "cash" | "card" | "digital-wallet"
): Promise<BillWithItems> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => {
      const discountedPrice = 
        item.product.price * (1 - item.product.discountPercentage / 100);
      return sum + discountedPrice * item.quantity;
    }, 
    0
  );
  
  const taxRate = 0.18; // GST rate (18%)
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  // Create new bill
  const newBill: BillWithItems = {
    id: `B${String(bills.length + 1).padStart(3, '0')}`,
    items: items.map(item => ({
      id: `bi${Math.random().toString(36).substring(2, 9)}`,
      billId: '', // Will be set after bill creation
      productId: item.product.id,
      productPrice: item.product.price,
      discountPercentage: item.product.discountPercentage,
      quantity: item.quantity,
      total: item.product.price * (1 - item.product.discountPercentage / 100) * item.quantity,
      productName: item.product.name,
      product: item.product
    })),
    subtotal,
    tax,
    total,
    customerName: customerDetails.name,
    customerPhone: customerDetails.phone,
    customerEmail: customerDetails.email,
    paymentMethod,
    createdAt: new Date().toISOString(),
    status: "completed",
    userId: "system" // In a real app, this would be the authenticated user's ID
  };
  
  // Update bill items with the bill ID
  if (newBill.items) {
    newBill.items.forEach(item => {
      item.billId = newBill.id;
    });
  }
  
  // Update inventory stock
  try {
    for (const item of items) {
      await decreaseStock(item.product.id, item.quantity);
    }
  } catch (error) {
    toast({
      title: "Error creating bill",
      description: "Failed to update inventory. Please try again.",
      variant: "destructive"
    });
    throw error;
  }
  
  // Add bill to database
  bills.push(newBill);
  
  toast({
    title: "Bill created successfully",
    description: `Bill #${newBill.id} has been created.`,
  });
  
  return newBill;
};

export const sendBillToWhatsApp = async (bill: BillWithItems): Promise<boolean> => {
  // This function would integrate with WhatsApp Business API in a production environment
  
  if (!bill.customerPhone) {
    toast({
      title: "Cannot send WhatsApp",
      description: "Customer phone number is required to send bill via WhatsApp.",
      variant: "destructive"
    });
    return false;
  }
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a production environment, you would integrate with WhatsApp Business API here
  // Example: Call a Supabase Edge Function that connects to WhatsApp API
  
  toast({
    title: "Bill sent successfully",
    description: `Bill #${bill.id} has been sent to ${bill.customerPhone} via WhatsApp.`,
  });
  
  return true;
};

export const searchBills = async (query: string): Promise<Bill[]> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query.trim()) {
    return [...bills].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  const lowerCaseQuery = query.toLowerCase();
  return bills.filter(
    bill => 
      bill.id.toLowerCase().includes(lowerCaseQuery) ||
      (bill.customerName && bill.customerName.toLowerCase().includes(lowerCaseQuery)) ||
      (bill.customerPhone && bill.customerPhone.toLowerCase().includes(lowerCaseQuery))
  ).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
