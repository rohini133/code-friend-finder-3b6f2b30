
import { useState, useRef } from "react";
import { Bill, BillWithItems } from "@/data/models";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendBillToWhatsApp } from "@/services/billService";
import { generatePDF } from "@/utils/pdfGenerator";

interface BillReceiptProps {
  bill: Bill;
}

export const BillReceipt = ({ bill }: BillReceiptProps) => {
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol'
    }).format(amount).replace('₹', '₹ ');
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    
    setIsPrinting(true);

    try {
      const billWithItems: BillWithItems = {
        ...bill,
        items: bill.items || []
      };
      
      // Generate PDF content
      const pdfBlob = generatePDF(billWithItems);
      
      // Create a URL for the PDF blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open the PDF in a new window for printing
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          try {
            printWindow.print();
            setTimeout(() => {
              printWindow.close();
            }, 500);
          } catch (printError) {
            console.error("Print error:", printError);
            toast({
              title: "Print Failed",
              description: "There was an error printing the receipt. Please try the download option instead.",
              variant: "destructive",
            });
          }
        });
        
        toast({
          title: "Receipt Prepared",
          description: "The receipt has been prepared for printing.",
        });
      } else {
        toast({
          title: "Print Failed",
          description: "Could not open print window. Please check your browser settings.",
          variant: "destructive",
        });
        
        // Fallback - just open the PDF directly
        window.open(pdfUrl, '_blank');
      }
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

  const handleSendWhatsApp = async () => {
    if (!bill.customerPhone) {
      toast({
        title: "Cannot send WhatsApp",
        description: "Customer phone number is required to send bill via WhatsApp.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSendingWhatsApp(true);
    try {
      const billWithItems: BillWithItems = {
        ...bill,
        items: bill.items || []
      };
      
      await sendBillToWhatsApp(billWithItems);
      toast({
        title: "Receipt sent",
        description: `Receipt has been sent to ${bill.customerPhone} via WhatsApp.`,
      });
    } catch (error) {
      toast({
        title: "Failed to send receipt",
        description: "There was an error sending the receipt via WhatsApp.",
        variant: "destructive"
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    
    try {
      const billWithItems: BillWithItems = {
        ...bill,
        items: bill.items || []
      };
      
      // Generate PDF content
      const pdfBlob = generatePDF(billWithItems);
      
      // Create download link for PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vivaas-Receipt-${bill.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Receipt Downloaded",
        description: `Receipt has been downloaded as Vivaas-Receipt-${bill.id}.pdf`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Receipt Download Failed",
        description: "There was an error downloading the receipt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!bill.items || bill.items.length === 0) {
    console.warn("No items found in bill:", bill.id);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Vivaas Receipt</span>
          <div className="text-sm font-normal text-gray-500">Bill #{bill.id}</div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-auto">
        <div ref={receiptRef} className="text-center">
          <img 
            src="public/lovable-uploads/4074e4b6-df93-42f1-9e94-22828d9dfb57.png" 
            alt="Vivaas Logo" 
            className="h-16 mx-auto mb-2"
          />
          <div className="text-xl font-bold">Vivaas</div>
          <div className="text-sm text-gray-600">Shiv Park Phase 2 Shop No-6-7 Pune Solapur Road</div>
          <div className="text-sm text-gray-600">Lakshumi Colony Opposite HDFC Bank Near Angle School, Pune-412307</div>
          <div className="text-sm text-gray-600">9657171777 || 9765971717</div>
          
          <div className="border-t border-dashed border-gray-300 my-3"></div>

          <div className="text-left">
            <div className="flex justify-between">
              <div><strong>Bill No:</strong> {bill.id}</div>
              <div><strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex justify-between">
              <div><strong>Counter:</strong> 1</div>
              <div><strong>Time:</strong> {new Date(bill.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>

          <div className="text-left text-sm mt-2">
            <div><strong>Customer:</strong> {bill.customerName || "Walk-in Customer"}</div>
            {bill.customerPhone && <div><strong>Phone:</strong> {bill.customerPhone}</div>}
            {bill.customerEmail && <div><strong>Email:</strong> {bill.customerEmail}</div>}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3"></div>

          <table className="receipt-items w-full text-sm mb-3">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left font-medium py-1">Particulars</th>
                <th className="text-center font-medium py-1">Qty</th>
                <th className="text-right font-medium py-1">MRP</th>
                <th className="text-right font-medium py-1">SSP</th>
                <th className="text-right font-medium py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items && bill.items.map((item, index) => {
                const mrp = item.product.price;
                const ssp = item.product.price * (1 - item.product.discountPercentage / 100);
                
                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-1">{item.product.name}</td>
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-right py-1">{formatCurrency(mrp)}</td>
                    <td className="text-right py-1">{formatCurrency(ssp)}</td>
                    <td className="text-right py-1">{formatCurrency(item.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="text-left text-sm">
            <div className="flex justify-between py-1">
              <span><strong>Qty:</strong> {bill.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</span>
              <span><strong>Total MRP:</strong> {formatCurrency(bill.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span><strong>Your Saving:</strong></span>
              <span>
                {formatCurrency((bill.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0) - bill.subtotal)}
              </span>
            </div>
            <div className="flex justify-between py-1 font-bold">
              <span>Total:</span>
              <span>{formatCurrency(bill.total)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3"></div>
          
          <div className="border border-gray-200 rounded p-2 mb-3">
            <div className="text-left font-bold mb-1">GST Summary:</div>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left">Description</th>
                  <th className="text-right">Taxable</th>
                  <th className="text-right">CGST</th>
                  <th className="text-right">SGST</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>GST 18.00%</td>
                  <td className="text-right">{formatCurrency(bill.subtotal)}</td>
                  <td className="text-right">{formatCurrency(bill.tax / 2)}</td>
                  <td className="text-right">{formatCurrency(bill.tax / 2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td></td>
                  <td className="text-right">{formatCurrency(bill.subtotal)}</td>
                  <td className="text-right">{formatCurrency(bill.tax / 2)}</td>
                  <td className="text-right">{formatCurrency(bill.tax / 2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-left font-bold mb-2">
            <div className="flex justify-between">
              <span>Net Amount:</span>
              <span>{formatCurrency(bill.total)}</span>
            </div>
          </div>
          
          <div className="text-left text-sm">
            <div className="flex justify-between">
              <span>
                {bill.paymentMethod === 'cash' ? 'Cash' : 
                 bill.paymentMethod === 'card' ? 'Card' : 'UPI'}: {formatCurrency(bill.total)}
              </span>
              <span>{new Date(bill.createdAt).toLocaleDateString()}</span>
            </div>
            <div>UPI No. 0</div>
          </div>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Thank you for shopping with us</p>
            <p>Please visit again..!</p>
            <p>*** Have A Nice Day ***</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 mt-auto">
        <div className="flex flex-col w-full gap-2">
          <Button onClick={handlePrint} className="w-full justify-start" disabled={isPrinting}>
            {isPrinting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            Print Receipt
          </Button>
          
          {bill.customerPhone && (
            <Button 
              onClick={handleSendWhatsApp} 
              disabled={isSendingWhatsApp}
              variant="outline" 
              className="w-full justify-start"
            >
              {isSendingWhatsApp ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Send via WhatsApp
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Receipt
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
