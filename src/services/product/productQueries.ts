
import { Product } from "@/types/supabase-extensions";
import { supabase, debugAuthStatus, refreshSession } from "@/integrations/supabase/client";
import { getLocalProducts, getLocalProductById, updateLocalProductStore } from "./productStore";
import { mapDatabaseProductToProduct } from "./productHelpers";

/**
 * Fetch all products from Supabase or fallback to local data
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log("Fetching products from Supabase...");
    
    // Check authentication status first
    const authStatus = await debugAuthStatus();
    console.log("Auth status before fetching products:", authStatus);
    
    // Fetch products from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error("Error fetching products:", error);
      console.error("Detailed error:", {
        message: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Try session refresh if auth error
      if (error.code === 'PGRST301' || error.message.includes('JWT')) {
        console.log("Attempting to refresh session...");
        const refreshed = await refreshSession();
        if (refreshed) {
          return getProducts(); // Retry with fresh token
        }
      }
      
      // Fallback to local data if Supabase fetch fails
      return getLocalProducts();
    }
    
    // If we got data from Supabase, use it and update local cache
    if (data && data.length > 0) {
      console.log(`Successfully fetched ${data.length} products from Supabase`);
      const mappedProducts = data.map(item => mapDatabaseProductToProduct(item));
      
      // Update local cache
      updateLocalProductStore(mappedProducts);
      
      return mappedProducts;
    }
    
    console.log("No products found in database, using sample data");
    return getLocalProducts();
  } catch (e) {
    console.error("Error in getProducts:", e);
    // Return local data as fallback
    return getLocalProducts();
  }
};

/**
 * Get a single product by ID
 */
export const getProduct = async (id: string): Promise<Product | undefined> => {
  try {
    // Try to get product from Supabase first
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error fetching product:", error);
      // Fallback to local data
      return getLocalProductById(id);
    }
    
    if (data) {
      // Map database fields to Product type
      return mapDatabaseProductToProduct(data);
    }
    
    return getLocalProductById(id);
  } catch (e) {
    console.error("Error in getProduct:", e);
    // Return from local data as fallback
    return getLocalProductById(id);
  }
};
