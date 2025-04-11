import { Product, ProductWithStatus, mapRawProductToProduct, mapProductToRawProduct } from "@/types/supabase-extensions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Get all products from Supabase
export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log("Fetching products from Supabase");
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    console.log("Products fetched successfully:", data?.length || 0, "products");
    // Map the raw data to our Product type
    return data.map(mapRawProductToProduct);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
};

// Get a single product by ID
export const getProduct = async (id: string): Promise<Product | undefined> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      throw error;
    }

    return mapRawProductToProduct(data);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
  try {
    console.log("Updating product:", updatedProduct.id);
    const rawProduct = mapProductToRawProduct(updatedProduct);
    
    const { data, error } = await supabase
      .from('products')
      .update(rawProduct)
      .eq('id', updatedProduct.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }

    console.log("Product updated successfully:", data);
    return mapRawProductToProduct(data);
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
};

// Add a new product with improved error handling
export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  try {
    console.log("Adding product:", product);
    
    // Check for required fields
    if (!product.name || !product.brand || !product.category || !product.itemNumber) {
      console.error("Required fields missing:", { product });
      throw new Error("Required fields missing");
    }
    
    // Check for duplicate item number
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('item_number')
      .eq('item_number', product.itemNumber)
      .limit(1);
      
    if (checkError) {
      console.error("Error checking for duplicate item number:", checkError);
      throw new Error(`Database error: ${checkError.message}`);
    }
    
    if (existingProducts && existingProducts.length > 0) {
      console.error("Item number already exists:", product.itemNumber);
      throw new Error(`Item number "${product.itemNumber}" already exists`);
    }
    
    // Create product object with default values for missing fields
    const productToInsert = {
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description || "",
      price: product.price || 0,
      discount_percentage: product.discountPercentage || 0,
      stock: product.stock || 0,
      low_stock_threshold: product.lowStockThreshold || 5,
      image: product.image || "https://placehold.co/400x300?text=Product+Image",
      size: product.size || null,
      color: product.color || null,
      item_number: product.itemNumber
    };
    
    console.log("Product to insert:", productToInsert);
    
    // Get current auth status
    const { data: session } = await supabase.auth.getSession();
    console.log("Auth status before insert:", session ? "Authenticated" : "Not authenticated");
    
    // Insert the product
    const { data, error } = await supabase
      .from('products')
      .insert(productToInsert)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adding product:", error);
      console.error("Error details:", error.details, error.hint, error.code);
      
      // Special handling for RLS errors
      if (error.message.includes("row-level security") || error.code === "42501") {
        console.error("RLS policy violation. User might not be authenticated or lacks permission.");
        
        // Check if authenticated
        const { data: authCheck } = await supabase.auth.getSession();
        if (!authCheck?.session) {
          throw new Error("Authentication required to add products. Please log in.");
        } else {
          throw new Error("You don't have permission to add products. Please contact an administrator.");
        }
      }
      
      throw new Error(`Failed to add product: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("No data returned after adding product");
    }
    
    console.log("Product added successfully:", data);
    
    // Map the raw product to our camelCase format
    return mapRawProductToProduct(data);
  } catch (error) {
    console.error("Product add error:", error);
    throw error;
  }
};

// Decrease product stock
export const decreaseStock = async (productId: string, quantity: number = 1): Promise<Product> => {
  try {
    // First get the current product
    const { data: productData, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const product = mapRawProductToProduct(productData);
    
    if (product.stock < quantity) {
      toast({
        title: "Insufficient stock",
        description: `Cannot decrease stock of ${product.name} by ${quantity} as only ${product.stock} remain.`,
        variant: "destructive"
      });
      throw new Error("Insufficient stock");
    }

    // Update with new stock
    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock: product.stock - quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const updatedProduct = mapRawProductToProduct(data);
    
    // Check if stock is low after update
    if (updatedProduct.stock <= updatedProduct.lowStockThreshold && updatedProduct.stock > 0) {
      toast({
        title: "Low Stock Alert",
        description: `${updatedProduct.name} is running low on stock (${updatedProduct.stock} remaining).`,
        variant: "default"
      });
    }
    
    // Check if out of stock after update
    if (updatedProduct.stock === 0) {
      toast({
        title: "Out of Stock Alert",
        description: `${updatedProduct.name} is now out of stock.`,
        variant: "destructive"
      });
    }
    
    return updatedProduct;
  } catch (error) {
    console.error("Failed to decrease stock:", error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw error;
  }
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

// Subscribe to product changes with improved error handling
export const subscribeToProducts = (callback: (products: Product[]) => void): () => void => {
  // Initial fetch
  getProducts().then(callback).catch(error => {
    console.error("Error fetching initial products:", error);
  });
  
  // Set up real-time subscription
  const subscription = supabase
    .channel('products-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' },
      async () => {
        // Fetch the updated list of products when any change happens
        try {
          const products = await getProducts();
          callback(products);
        } catch (error) {
          console.error("Error refreshing products after change:", error);
        }
      }
    )
    .subscribe((status) => {
      console.log("Products subscription status:", status);
    });
  
  // Return a cleanup function
  return () => {
    console.log("Cleaning up products subscription");
    supabase.removeChannel(subscription);
  };
};
