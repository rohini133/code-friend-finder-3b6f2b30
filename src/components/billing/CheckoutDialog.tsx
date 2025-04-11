
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Printer, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendBillToWhatsApp } from "@/services/billService";
import { CartItem, BillItemWithProduct, BillWithItems } from "@/data/models";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generatePDF } from "@/utils/pdfGenerator";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string | null;
  customerPhone?: string;
  cartItems: CartItem[];
  customerName?: string;
  customerEmail?: string;
  paymentMethod: "cash" | "card" | "digital-wallet";
  subtotal: number;
  tax: number;
  total: number;
}

export const CheckoutDialog = ({
  open,
  onOpenChange,
  billId,
  customerPhone,
  cartItems,
  customerName,
  customerEmail,
  paymentMethod,
  subtotal,
  tax,
  total
}: CheckoutDialogProps) => {
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const createBillWithItems = (): BillWithItems => {
    if (!billId) throw new Error("Bill ID is required");
    
    const billItems: BillItemWithProduct[] = cartItems.map(item => ({
      id: `bi-${Math.random().toString(36).substring(2, 9)}`,
      billId: billId,
      productId: item.product.id,
      productPrice: item.product.price,
      discountPercentage: item.product.discountPercentage,
      quantity: item.quantity,
      total: item.product.price * (1 - item.product.discountPercentage / 100) * item.quantity,
      productName: item.product.name,
      product: item.product
    }));
    
    return {
      id: billId,
      items: billItems,
      subtotal,
      tax,
      total,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      createdAt: new Date().toISOString(),
      status: "completed",
      userId: "system"
    };
  };

  const handleSendWhatsApp = async () => {
    if (!billId) return;
    
    setIsSendingWhatsApp(true);
    try {
      const billWithItems = createBillWithItems();
      await sendBillToWhatsApp(billWithItems);
      
      toast({
        title: "WhatsApp Receipt Sent",
        description: `The receipt has been sent to ${customerPhone}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send WhatsApp",
        description: "There was an error sending the bill via WhatsApp. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handlePrintReceipt = () => {
    setIsPrinting(true);
    
    try {
      const billWithItems = createBillWithItems();
      
      // Generate and print PDF
      const pdfBlob = generatePDF(billWithItems);
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        printWindow.location.href = pdfUrl;
        setTimeout(() => {
          printWindow.print();
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
      }
      
      toast({
        title: "Receipt Printed",
        description: "The receipt has been sent to the printer.",
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Failed",
        description: "There was an error printing the receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!billId) {
      toast({
        title: "Download Failed",
        description: "Invalid bill information. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      const billWithItems = createBillWithItems();
      
      // Generate PDF
      const pdfBlob = generatePDF(billWithItems);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-${billId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Receipt Downloaded",
        description: "The receipt has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bill Generated Successfully</DialogTitle>
          <DialogDescription>
            Bill #{billId} has been created and inventory has been updated.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">What would you like to do next?</p>
          
          <Button 
            className="w-full mb-3"
            onClick={handlePrintReceipt}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Print Receipt
          </Button>
          
          <Button 
            className="w-full mb-3"
            variant="secondary"
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download Receipt
          </Button>
          
          {customerPhone && (
            <Button 
              className="w-full mb-3 dmart-button"
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsApp}
            >
              {isSendingWhatsApp ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Send Receipt via WhatsApp
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Return to Billing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
