
import { Product, ProductWithStatus } from "@/types/supabase-extensions";

// Re-export functions from the refactored modules
export { getProducts, getProduct } from "./product/productQueries";
export { updateProduct, addProduct, decreaseStock } from "./product/productMutations";
export { getProductStockStatus } from "./product/productHelpers";
