
import { Product, ProductWithStatus, mapRawProductToProduct, mapProductToRawProduct } from "@/types/supabase-extensions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Get all products from Supabase
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

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

    return mapRawProductToProduct(data);
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
};

// Add a new product
export const addProduct = async (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  try {
    const now = new Date().toISOString();
    const productToInsert = {
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      description: newProduct.description,
      price: newProduct.price,
      discount_percentage: newProduct.discountPercentage,
      stock: newProduct.stock,
      low_stock_threshold: newProduct.lowStockThreshold,
      image: newProduct.image,
      size: newProduct.size,
      color: newProduct.color,
      item_number: newProduct.itemNumber,
      created_at: now,
      updated_at: now
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert(productToInsert)
      .select()
      .single();

    if (error) {
      console.error("Error adding product:", error);
      throw error;
    }

    return mapRawProductToProduct(data);
  } catch (error) {
    console.error("Failed to add product:", error);
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
    const newStock = product.stock - quantity;
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

// Subscribe to product changes
export const subscribeToProducts = (
  callback: (products: Product[]) => void
) => {
  const subscription = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
      },
      async () => {
        // When any change happens to products, fetch the latest data
        try {
          const products = await getProducts();
          callback(products);
        } catch (error) {
          console.error("Error refreshing products after change:", error);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
};
