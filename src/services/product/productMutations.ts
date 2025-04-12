
import { Product } from "@/types/supabase-extensions";
import { supabase, debugAuthStatus, refreshSession } from "@/integrations/supabase/client";
import { mapProductToDatabaseProduct } from "./productHelpers";
import { 
  getLocalProductById, 
  updateProductInLocalStore, 
  addProductToLocalStore 
} from "./productStore";
import { 
  showLowStockNotification, 
  showOutOfStockNotification,
  showInsufficientStockNotification 
} from "./notificationService";

/**
 * Update an existing product
 */
export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
  try {
    console.log("Updating product in Supabase:", updatedProduct);
    
    // Check active session first
    const authStatus = await debugAuthStatus();
    console.log("Auth status before updating product:", authStatus);
    
    if (!authStatus.isAuthenticated) {
      console.warn("No authenticated session found for product update");
      
      // Try to refresh session
      console.log("Attempting to refresh session...");
      const refreshed = await refreshSession();
      if (!refreshed) {
        throw new Error("Authentication required to update products");
      }
    }
    
    // Prepare the product data for Supabase
    const productData = mapProductToDatabaseProduct(updatedProduct);
    
    // Update in Supabase
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', updatedProduct.id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating product in Supabase:", error);
      console.error("Detailed error:", {
        message: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Fall back to local update
      const index = getLocalProductById(updatedProduct.id);
      if (!index) {
        throw new Error("Product not found");
      }
      
      const updatedLocalProduct = {
        ...updatedProduct,
        updatedAt: new Date().toISOString()
      };
      
      updateProductInLocalStore(updatedLocalProduct);
      
      return updatedLocalProduct;
    }
    
    if (data) {
      console.log("Product successfully updated in Supabase:", data);
      
      // Map response to Product type
      const mappedProduct = mapDatabaseProductToProduct(data);
      
      // Update local cache
      updateProductInLocalStore(mappedProduct);
      
      return mappedProduct;
    }
    
    return updatedProduct;
  } catch (e) {
    console.error("Error in updateProduct:", e);
    throw e;
  }
};

/**
 * Add a new product
 */
export const addProduct = async (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  try {
    console.log("Adding product to Supabase:", newProduct);
    const now = new Date().toISOString();
    
    // First, debug the authentication status
    const authStatus = await debugAuthStatus();
    console.log("Auth debug before product addition:", authStatus);
    
    if (!authStatus.isAuthenticated) {
      // Try to refresh the session
      console.log("Attempting to refresh session...");
      const refreshed = await refreshSession();
      
      if (!refreshed) {
        console.warn("No authenticated session found for product addition");
        
        // Fall back to local creation
        const localProduct: Product = {
          ...newProduct,
          id: `p${Date.now()}`,
          createdAt: now,
          updatedAt: now
        };
        
        addProductToLocalStore(localProduct);
        
        console.log("Added product locally only:", localProduct);
        return localProduct;
      }
    }
    
    // Prepare product data for Supabase
    const productData = {
      name: newProduct.name,
      price: newProduct.price,
      stock: newProduct.stock,
      brand: newProduct.brand,
      category: newProduct.category,
      item_number: newProduct.itemNumber,
      discount_percentage: newProduct.discountPercentage || 0,
      low_stock_threshold: newProduct.lowStockThreshold || 5,
      image: newProduct.image || '',
      description: newProduct.description || '',
      size: newProduct.size,
      color: newProduct.color
    };
    
    console.log("Prepared data for Supabase insertion:", productData);
    
    // Insert in Supabase with more detailed error handling
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
      
    if (error) {
      console.error("Error adding product to Supabase:", error);
      console.error("Detailed error:", {
        message: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Fall back to local creation for UI responsiveness
      const localProduct: Product = {
        ...newProduct,
        id: `p${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };
      
      addProductToLocalStore(localProduct);
      console.log("Added product locally due to Supabase error:", localProduct);
      
      return localProduct;
    }
    
    if (data) {
      console.log("Product added successfully to Supabase:", data);
      
      // Create product object from Supabase response
      const product = mapDatabaseProductToProduct(data);
      
      // Update local cache
      addProductToLocalStore(product);
      
      return product;
    }
    
    throw new Error("Failed to add product");
  } catch (e) {
    console.error("Error in addProduct:", e);
    throw e;
  }
};

/**
 * Decrease stock for a product
 */
export const decreaseStock = async (productId: string, quantity: number = 1): Promise<Product> => {
  try {
    // Get the current product state first
    const product = await getLocalProductById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    
    if (product.stock < quantity) {
      showInsufficientStockNotification(product, quantity);
      throw new Error("Insufficient stock");
    }
    
    const newStock = product.stock - quantity;
    
    // Update in Supabase
    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating stock in Supabase:", error);
      // Fall back to local update
      const localProduct = getLocalProductById(productId);
      if (!localProduct) {
        throw new Error("Product not found in local cache");
      }
      
      const updatedProduct = {
        ...localProduct,
        stock: newStock,
        updatedAt: new Date().toISOString()
      };
      
      updateProductInLocalStore(updatedProduct);
      
      // Check if stock is low after update
      if (updatedProduct.stock <= updatedProduct.lowStockThreshold && updatedProduct.stock > 0) {
        showLowStockNotification(updatedProduct);
      }
      
      // Check if out of stock after update
      if (updatedProduct.stock === 0) {
        showOutOfStockNotification(updatedProduct);
      }
      
      return updatedProduct;
    }
    
    if (data) {
      // Create the updated product object
      const updatedProduct = mapDatabaseProductToProduct(data);
      
      // Update local cache
      updateProductInLocalStore(updatedProduct);
      
      // Check if stock is low after update
      if (updatedProduct.stock <= updatedProduct.lowStockThreshold && updatedProduct.stock > 0) {
        showLowStockNotification(updatedProduct);
      }
      
      // Check if out of stock after update
      if (updatedProduct.stock === 0) {
        showOutOfStockNotification(updatedProduct);
      }
      
      return updatedProduct;
    }
    
    throw new Error("Failed to update stock");
  } catch (e) {
    console.error("Error in decreaseStock:", e);
    throw e;
  }
};
