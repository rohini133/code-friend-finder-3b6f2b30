
import { Product, ProductWithStatus, mapRawProductToProduct, mapProductToRawProduct } from "@/types/supabase-extensions";
import { sampleProducts } from "@/data/sampleData";
import { toast } from "@/components/ui/use-toast";

// In a real application, these functions would make API calls to a backend
let products = [...sampleProducts];

export const getProducts = async (): Promise<Product[]> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...products];
};

export const getProduct = async (id: string): Promise<Product | undefined> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return products.find(product => product.id === id);
};

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index === -1) {
    throw new Error("Product not found");
  }
  
  products[index] = {
    ...updatedProduct,
    updatedAt: new Date().toISOString()
  };
  
  return products[index];
};

// Fixed type definition to match Product model requirements
export const addProduct = async (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date().toISOString();
  const product: Product = {
    ...newProduct,
    id: `p${products.length + 1}`,
    createdAt: now,
    updatedAt: now
  };
  
  products.push(product);
  return product;
};

export const decreaseStock = async (productId: string, quantity: number = 1): Promise<Product> => {
  // Simulate API fetch delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = products.findIndex(p => p.id === productId);
  if (index === -1) {
    throw new Error("Product not found");
  }
  
  if (products[index].stock < quantity) {
    toast({
      title: "Insufficient stock",
      description: `Cannot decrease stock of ${products[index].name} by ${quantity} as only ${products[index].stock} remain.`,
      variant: "destructive"
    });
    throw new Error("Insufficient stock");
  }
  
  products[index] = {
    ...products[index],
    stock: products[index].stock - quantity,
    updatedAt: new Date().toISOString()
  };
  
  // Check if stock is low after update
  if (products[index].stock <= products[index].lowStockThreshold && products[index].stock > 0) {
    toast({
      title: "Low Stock Alert",
      description: `${products[index].name} is running low on stock (${products[index].stock} remaining).`,
      variant: "default"
    });
  }
  
  // Check if out of stock after update
  if (products[index].stock === 0) {
    toast({
      title: "Out of Stock Alert",
      description: `${products[index].name} is now out of stock.`,
      variant: "destructive"
    });
  }
  
  return products[index];
};

export const getProductStockStatus = (product: Product): "in-stock" | "low-stock" | "out-of-stock" => {
  if (product.stock === 0) {
    return "out-of-stock";
  }
  if (product.stock <= product.lowStockThreshold) {
    return "low-stock";
  }
  return "in-stock";
};
