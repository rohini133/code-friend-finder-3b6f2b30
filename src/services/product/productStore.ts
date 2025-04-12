
import { Product } from "@/types/supabase-extensions";
import { sampleProducts } from "@/data/sampleData";

// Local store for product data as fallback
let products = [...sampleProducts];

export const getLocalProducts = (): Product[] => {
  return [...products];
};

export const getLocalProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const updateLocalProductStore = (updatedProducts: Product[]): void => {
  products = updatedProducts;
};

export const addProductToLocalStore = (product: Product): void => {
  products.push(product);
};

export const updateProductInLocalStore = (updatedProduct: Product): void => {
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = updatedProduct;
  }
};

export const removeProductFromLocalStore = (productId: string): void => {
  products = products.filter(p => p.id !== productId);
};
