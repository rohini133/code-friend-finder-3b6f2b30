
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
export const addProduct = async (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  try {
    console.log("Adding new product:", newProduct.name);
    const now = new Date().toISOString();
    
    // Validate required fields
    if (!newProduct.name || !newProduct.brand || !newProduct.category || !newProduct.itemNumber) {
      console.error("Missing required fields for new product");
      throw new Error("Missing required fields: name, brand, category, and item number are required");
    }
    
    if (isNaN(newProduct.price) || newProduct.price <= 0) {
      console.error("Invalid price:", newProduct.price);
      throw new Error("Price must be a positive number");
    }
    
    const productToInsert = {
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      description: newProduct.description || "",
      price: newProduct.price,
      discount_percentage: newProduct.discountPercentage || 0,
      stock: newProduct.stock || 0,
      low_stock_threshold: newProduct.lowStockThreshold || 5,
      image: newProduct.image || "https://placehold.co/400x300?text=Product+Image",
      size: newProduct.size || "",
      color: newProduct.color || "",
      item_number: newProduct.itemNumber,
      created_at: now,
      updated_at: now
    };
    
    console.log("Inserting product into Supabase:", productToInsert);
    
    // Check if item number already exists
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('item_number', newProduct.itemNumber)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking for existing product:", checkError);
      throw new Error(`Database error when checking for duplicate item number: ${checkError.message}`);
    }
    
    if (existingProduct) {
      console.error("Product with this item number already exists:", newProduct.itemNumber);
      throw new Error(`A product with item number ${newProduct.itemNumber} already exists`);
    }
    
    // Insert the new product
    const { data, error } = await supabase
      .from('products')
      .insert(productToInsert)
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding product:", error);
      // Provide more detailed error message based on error code
      if (error.code === '23505') {
        throw new Error(`Duplicate item number: ${newProduct.itemNumber} already exists`);
      } else if (error.code === '23502') {
        throw new Error(`Missing required field: ${error.message}`);
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }

    if (!data) {
      throw new Error("Product was added but no data was returned");
    }

    console.log("Product added successfully:", data);
    return mapRawProductToProduct(data);
  } catch (error: any) {
    console.error("Failed to add product:", error);
    // Ensure we always throw an Error object with a message
    throw new Error(error.message || "Unknown error occurred while adding product");
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
export const subscribeToProducts = (
  callback: (products: Product[]) => void
) => {
  console.log("Setting up real-time subscription for products");
  
  // Enable real-time for the products table if not already enabled
  const enableRealtimeQuery = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error("Error checking products table:", error);
      }
    } catch (err) {
      console.error("Failed to enable realtime for products:", err);
    }
  };
  
  enableRealtimeQuery();
  
  const subscription = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
      },
      async (payload) => {
        console.log("Received real-time product change event:", payload.eventType, payload);
        // When any change happens to products, fetch the latest data
        try {
          const products = await getProducts();
          console.log("Updated products after real-time event:", products.length);
          callback(products);
        } catch (error) {
          console.error("Error refreshing products after change:", error);
        }
      }
    )
    .subscribe((status) => {
      console.log("Supabase channel status:", status);
    });

  // Return unsubscribe function
  return () => {
    console.log("Unsubscribing from products changes");
    supabase.removeChannel(subscription);
  };
};
