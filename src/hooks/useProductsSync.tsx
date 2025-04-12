
import { useEffect, useState } from 'react';
import { supabase, debugAuthStatus, checkActiveSession, enhancedLogin } from '@/integrations/supabase/client';
import { Product } from '@/data/models';
import { getProducts } from '@/services/productService';
import { useToast } from '@/components/ui/use-toast';

export function useProductsSync() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status...");
      const authStatus = await debugAuthStatus();
      console.log("Authentication check result:", authStatus);
      setIsAuthenticated(authStatus.isAuthenticated);
      
      if (!authStatus.isAuthenticated) {
        console.warn("Not authenticated. Attempting automatic login for development...");
        
        try {
          // For development - try to auto-login if not authenticated
          // This is just for development convenience - should be removed in production
          const result = await enhancedLogin(
            'admin@example.com', 
            'password123'
          );
          
          if (result.success) {
            console.log("Auto-login successful:", result);
            setIsAuthenticated(true);
            toast({
              title: "Auto-login successful",
              description: "Using default development credentials",
            });
          } else {
            setError("Not authenticated. Please log in to view and modify products.");
            toast({
              title: "Authentication required",
              description: "Please log in to access product data",
              variant: "destructive",
            });
          }
        } catch (e) {
          console.error("Auto-login failed:", e);
          setError("Not authenticated. Please log in to view and modify products.");
        }
      }
    };
    
    checkAuth();
  }, [toast]);

  // Fetch initial products data
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        // Log authentication status before fetching
        const authCheck = await checkActiveSession();
        console.log("Auth status before fetching products:", authCheck ? "Authenticated" : "Not authenticated");
        
        if (!authCheck) {
          throw new Error("Authentication required to fetch products");
        }
        
        console.log("Fetching products from Supabase...");
        const data = await getProducts();
        console.log("Products fetched successfully:", data.length);
        setProducts(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products");
        toast({
          title: "Error",
          description: err.message || "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [toast, isAuthenticated]);

  // Setup real-time listeners for product changes
  useEffect(() => {
    if (!isAuthenticated) return;
    
    console.log("Setting up real-time product changes subscription");
    
    // Set up the subscription to product changes
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'products' }, 
        (payload) => {
          console.log('New product added via realtime:', payload);
          // Map the new product to our Product type
          if (payload.new) {
            const newProduct: Product = {
              id: payload.new.id,
              name: payload.new.name,
              price: payload.new.price,
              stock: payload.new.stock,
              brand: payload.new.brand,
              category: payload.new.category,
              itemNumber: payload.new.item_number,
              discountPercentage: payload.new.discount_percentage,
              lowStockThreshold: payload.new.low_stock_threshold,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
              image: payload.new.image || '',
              description: payload.new.description || '',
              size: payload.new.size || null,
              color: payload.new.color || null
            };
            
            setProducts(prev => [...prev, newProduct]);
            
            toast({
              title: "Product Added",
              description: `${newProduct.name} has been added to the inventory.`
            });
          }
      })
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'products' }, 
        (payload) => {
          console.log('Product updated via realtime:', payload);
          if (payload.new) {
            const updatedProduct: Product = {
              id: payload.new.id,
              name: payload.new.name,
              price: payload.new.price,
              stock: payload.new.stock,
              brand: payload.new.brand,
              category: payload.new.category,
              itemNumber: payload.new.item_number,
              discountPercentage: payload.new.discount_percentage,
              lowStockThreshold: payload.new.low_stock_threshold,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
              image: payload.new.image || '',
              description: payload.new.description || '',
              size: payload.new.size || null,
              color: payload.new.color || null
            };
            
            setProducts(prev => prev.map(p => 
              p.id === updatedProduct.id ? updatedProduct : p
            ));
          }
      })
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'products' }, 
        (payload) => {
          console.log('Product deleted via realtime:', payload);
          if (payload.old && payload.old.id) {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
            
            toast({
              title: "Product Removed",
              description: `A product has been removed from the inventory.`
            });
          }
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    console.log('Realtime subscription for products initialized');

    // Cleanup function to remove the subscription when component unmounts
    return () => {
      console.log('Removing realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [toast, isAuthenticated]);

  return { products, isLoading, error, isAuthenticated };
}
