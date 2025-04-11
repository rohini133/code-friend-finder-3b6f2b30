
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useBillingCart } from "@/hooks/useBillingCart";
import { ItemScanner } from "@/components/billing/ItemScanner";
import { ProductSearch } from "@/components/billing/ProductSearch";
import { ShoppingCart } from "@/components/billing/ShoppingCart";
import { CheckoutDialog } from "@/components/billing/CheckoutDialog";

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  paymentMethod: "cash" | "card" | "digital-wallet";
}

const Billing = () => {
  const { 
    cartItems, 
    addToCart, 
    updateQuantity, 
    removeItem, 
    clearCart,
    calculateSubtotal,
    calculateTax,
    calculateTotal
  } = useBillingCart();
  
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [createdBillId, setCreatedBillId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    paymentMethod: "cash"
  });

  const handleCheckoutComplete = (billId: string, customerInfo: CustomerInfo) => {
    setCreatedBillId(billId);
    setCustomerInfo(customerInfo);
    setIsCheckoutDialogOpen(true);
  };

  return (
    <PageContainer title="Billing" subtitle="Create bills and process sales">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ItemScanner onItemScanned={addToCart} />
          <ProductSearch onAddToCart={addToCart} />
        </div>

        <div>
          <ShoppingCart 
            cartItems={cartItems}
            onUpdateCartItem={updateQuantity}
            onRemoveCartItem={removeItem}
            onCheckoutComplete={handleCheckoutComplete}
            onCartClear={clearCart}
            subtotal={calculateSubtotal()}
            tax={calculateTax()}
            total={calculateTotal()}
          />
        </div>
      </div>

      <CheckoutDialog 
        open={isCheckoutDialogOpen}
        onOpenChange={setIsCheckoutDialogOpen}
        billId={createdBillId}
        customerPhone={customerInfo.phone}
        cartItems={cartItems}
        customerName={customerInfo.name}
        customerEmail={customerInfo.email}
        paymentMethod={customerInfo.paymentMethod}
        subtotal={calculateSubtotal()}
        tax={calculateTax()}
        total={calculateTotal()}
      />
    </PageContainer>
  );
};

export default Billing;
