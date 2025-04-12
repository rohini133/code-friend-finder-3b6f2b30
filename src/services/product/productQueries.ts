
import { Product } from "@/types/supabase-extensions";
import { supabase, debugAuthStatus, refreshSession } from "@/integrations/supabase/client";
import { mapDatabaseProductToProduct } from "./productHelpers";

/**
 * Fetch all products from Supabase without local fallback
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log("Fetching products directly from Supabase...");
    
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
      
      // Return empty array instead of falling back to local data
      console.error("Failed to fetch products and no fallback available");
      throw new Error(`Database error: ${error.message}`);
    }
    
    // If we got data from Supabase, use it
    if (data && data.length > 0) {
      console.log(`Successfully fetched ${data.length} products from Supabase`);
      const mappedProducts = data.map(item => mapDatabaseProductToProduct(item));
      return mappedProducts;
    }
    
    console.log("No products found in database");
    return []; // Return empty array instead of sample data
  } catch (e) {
    console.error("Error in getProducts:", e);
    throw e; // Re-throw to be handled by the caller
  }
};

/**
 * Get a single product by ID directly from Supabase
 */
export const getProduct = async (id: string): Promise<Product | undefined> => {
  try {
    console.log(`Fetching product ${id} directly from Supabase...`);
    
    // Get product from Supabase only
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error fetching product:", error);
      console.error("Detailed error:", {
        message: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (data) {
      // Map database fields to Product type
      return mapDatabaseProductToProduct(data);
    }
    
    return undefined;
  } catch (e) {
    console.error("Error in getProduct:", e);
    throw e; // Re-throw to be handled by the caller
  }
};
