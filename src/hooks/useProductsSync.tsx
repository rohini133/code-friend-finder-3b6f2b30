
import { useEffect, useState } from 'react';
import { supabase, debugAuthStatus, checkActiveSession } from '@/integrations/supabase/client';
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
      const authStatus = await debugAuthStatus();
      setIsAuthenticated(authStatus.isAuthenticated);
      
      if (!authStatus.isAuthenticated) {
        setError("Not authenticated. Please log in to view and modify products.");
      }
    };
    
    checkAuth();
  }, []);

  // Fetch initial products data
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        // Log authentication status before fetching
        const authCheck = await checkActiveSession();
        console.log("Auth status before fetching products:", authCheck ? "Authenticated" : "Not authenticated");
        
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [toast]);

  // Setup real-time listeners for product changes
  useEffect(() => {
    // Set up the subscription to product changes
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'products' }, 
        (payload) => {
          console.log('New product added:', payload);
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
          console.log('Product updated:', payload);
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
          console.log('Product deleted:', payload);
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
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return { products, isLoading, error, isAuthenticated };
}
