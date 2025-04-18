
import { BillWithItems } from "@/data/models";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Constants for shop information
const SHOP_NAME = "Vivaa's";
const SHOP_ADDRESS_LINE1 = "804, Ravivar Peth, Kapad Ganj";
const SHOP_ADDRESS_LINE2 = "Opp. Shani Mandir, Pune - 411002";
const SHOP_CONTACT = "9890669994/9307060539";
const SHOP_GSTIN = "27AFIFS6956E1ZJ"; // Updated GSTIN as per Shanti Agency
const SHOP_LOGO = "public/lovable-uploads/3ea4f499-fcd3-4858-9d48-f45847e83e52.png"; // Path to the uploaded eagle logo

export const generatePDF = (bill: BillWithItems): Blob => {
  console.log("Generating PDF for bill:", bill);
  
  // Validate the bill has items
  if (!bill.items || bill.items.length === 0) {
    console.error("No items found in the bill for PDF generation", bill);
  }
  
  try {
    // Create a new jsPDF instance with smaller page size to match receipt style
    const doc = new jsPDF({
      format: 'a7',
      unit: 'mm'
    });
    
    // Set smaller margins
    const margin = 5;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    
    // Add logo - using a smaller size for the compact receipt
    try {
      doc.addImage(SHOP_LOGO, 'PNG', (pageWidth / 2) - 10, margin, 20, 12, undefined, 'FAST');
    } catch (logoError) {
      console.error("Could not add logo:", logoError);
    }
    
    // Add shop name and information
    const headerY = margin + 15; // Starting Y position after logo
    let currentY = headerY;
    
    // Set shop name
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(SHOP_NAME, pageWidth / 2, currentY, { align: "center" });
    currentY += 4;
    
    // Shop address and contact
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(SHOP_ADDRESS_LINE1, pageWidth / 2, currentY, { align: "center" });
    currentY += 3;
    doc.text(SHOP_ADDRESS_LINE2, pageWidth / 2, currentY, { align: "center" });
    currentY += 3;
    doc.text(`MOB No. ${SHOP_CONTACT}`, pageWidth / 2, currentY, { align: "center" });
    currentY += 3;
    doc.text(`GSTIN : ${SHOP_GSTIN}`, pageWidth / 2, currentY, { align: "center" });
    currentY += 3;
    
    // Add horizontal line
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 3;
    
    // Add bill information (Bill No, Date, Counter, Time)
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    
    // Create two columns for bill info
    doc.text(`Bill No : ${bill.id}`, margin, currentY);
    doc.text(`Date : ${new Date(bill.createdAt).toLocaleDateString()}`, pageWidth - margin, currentY, { align: "right" });
    currentY += 3;
    
    doc.text(`Counter No : 1`, margin, currentY);
    doc.text(`Time : ${new Date(bill.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, pageWidth - margin, currentY, { align: "right" });
    currentY += 2;
    
    // Add a separator line
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 3;
    
    // Add header for table columns
    doc.setFontSize(6);
    doc.text("Particulars", margin, currentY);
    doc.text("Qty", margin + 35, currentY, { align: "center" });
    doc.text("MRP", margin + 45, currentY, { align: "center" });
    doc.text("SSP", margin + 55, currentY, { align: "center" });
    doc.text("Tot.Amount", pageWidth - margin, currentY, { align: "right" });
    currentY += 2;
    
    // Add a separator line
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 3;
    
    // Add items - manual rendering instead of autoTable for more control
    const hasItems = bill.items && bill.items.length > 0;
    
    if (hasItems) {
      bill.items.forEach(item => {
        const productName = item.productName || (item.product ? item.product.name : "Unknown Product");
        const productPrice = item.productPrice || (item.product ? item.product.price : 0);
        const discountPercentage = item.discountPercentage || (item.product ? item.product.discountPercentage : 0);
        const ssp = productPrice * (1 - discountPercentage / 100);
        const mrp = productPrice;
        
        doc.setFont("helvetica", "normal");
        doc.text(productName.toUpperCase(), margin, currentY);
        doc.text(item.quantity.toString(), margin + 35, currentY, { align: "center" });
        doc.text(formatCurrency(mrp, false), margin + 45, currentY, { align: "center" });
        doc.text(formatCurrency(ssp, false), margin + 55, currentY, { align: "center" });
        doc.text(formatCurrency(item.total, false), pageWidth - margin, currentY, { align: "right" });
        
        currentY += 3;
      });
    } else {
      doc.text("No items in this bill", pageWidth / 2, currentY, { align: "center" });
      currentY += 3;
    }
    
    // Add a separator line
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 3;
    
    // Calculate totals
    const totalMRP = bill.items ? bill.items.reduce((sum, item) => {
      const productPrice = item.productPrice || (item.product ? item.product.price : 0);
      return sum + (productPrice * item.quantity);
    }, 0) : 0;
    
    const totalQty = bill.items ? bill.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    const savings = totalMRP - bill.subtotal;
    
    // Add quantity and MRP totals
    doc.setFont("helvetica", "bold");
    doc.text(`Qty: ${totalQty}`, margin, currentY);
    doc.text(`Total MRP: ${formatCurrency(totalMRP, false)}`, pageWidth - margin, currentY, { align: "right" });
    currentY += 3;
    
    // Add savings
    doc.text(`Your Saving :`, margin, currentY);
    doc.text(`${formatCurrency(savings, false)}`, pageWidth - margin, currentY, { align: "right" });
    currentY += 3;
    
    // Add total
    doc.text(`Total :`, margin, currentY);
    doc.text(`${formatCurrency(bill.total, false)}`, pageWidth - margin, currentY, { align: "right" });
    currentY += 3;
    
    // Add GST summary box
    doc.setLineWidth(0.1);
    doc.rect(margin, currentY, contentWidth, 12);
    currentY += 3;
    
    // Add GST summary header
    doc.setFontSize(6);
    doc.text("GST Summary :", margin + 2, currentY);
    currentY += 2;
    
    // Add line inside GST box
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 2;
    
    // GST table headers
    doc.setFont("helvetica", "normal");
    doc.text("Description", margin + 2, currentY);
    doc.text("Taxable", margin + 25, currentY);
    doc.text("CGST", margin + 40, currentY);
    doc.text("SGST", margin + 50, currentY);
    currentY += 2;
    
    // Calculate GST amounts - assuming 18% GST (9% CGST + 9% SGST)
    const taxableAmount = bill.subtotal;
    const cgst = bill.tax / 2;
    const sgst = bill.tax / 2;
    
    // GST details
    doc.text("GST 18.00%", margin + 2, currentY);
    doc.text(formatCurrency(taxableAmount, false), margin + 25, currentY);
    doc.text(formatCurrency(cgst, false), margin + 40, currentY);
    doc.text(formatCurrency(sgst, false), margin + 50, currentY);
    currentY += 2;
    
    // Line before the totals
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 2;
    
    // GST table totals
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(taxableAmount, false), margin + 25, currentY);
    doc.text(formatCurrency(cgst, false), margin + 40, currentY);
    doc.text(formatCurrency(sgst, false), margin + 50, currentY);
    currentY += 3;
    
    // Add Net Amount line
    doc.text(`Net Amount :`, margin, currentY + 3);
    doc.text(`₹ ${formatCurrency(bill.total, false)}`, pageWidth - margin, currentY + 3, { align: "right" });
    currentY += 6;
    
    // Add payment details
    doc.setFont("helvetica", "normal");
    doc.text(`${getPaymentMethodName(bill.paymentMethod)} : ${formatCurrency(bill.total, false)}`, margin, currentY);
    doc.text(`${getPaymentMethodName(bill.paymentMethod)} Date : ${new Date(bill.createdAt).toLocaleDateString()}`, pageWidth / 2, currentY);
    currentY += 3;
    
    // Add UPI details
    doc.text(`UPI No. 0`, margin, currentY);
    doc.text(`Bank :`, pageWidth / 2, currentY);
    currentY += 5;
    
    // Thank you message
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("Thank you for shopping with us", pageWidth / 2, currentY, { align: "center" });
    currentY += 2;
    doc.text("Please visit again..!", pageWidth / 2, currentY, { align: "center" });
    currentY += 2;
    doc.text("*** Have A Nice Day ***", pageWidth / 2, currentY, { align: "center" });
    
    // Generate PDF blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error("Error creating PDF:", error);
    // Return a simple text blob as fallback
    return new Blob(['Error generating PDF'], { type: 'text/plain' });
  }
};

export const generateReceiptHTML = (bill: BillWithItems): string => {
  const hasItems = bill.items && bill.items.length > 0;
  
  const itemsHTML = hasItems 
    ? bill.items.map(item => {
        const productName = item.productName || (item.product ? item.product.name : "Unknown Product");
        const productPrice = item.productPrice || (item.product ? item.product.price : 0);
        const discountPercentage = item.discountPercentage || (item.product ? item.product.discountPercentage : 0);
        const finalPrice = productPrice * (1 - discountPercentage / 100);
        
        return `
          <tr>
            <td style="padding: 4px 0;">${productName}</td>
            <td style="text-align: center; padding: 4px 0;">${item.quantity}</td>
            <td style="text-align: right; padding: 4px 0;">${formatCurrency(finalPrice)}</td>
            <td style="text-align: right; padding: 4px 0;">${formatCurrency(item.total)}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="4" style="text-align: center; padding: 10px;">No items in this bill</td></tr>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${bill.id}</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
        .receipt { max-width: 80mm; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 15px; }
        .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { text-align: left; padding: 5px 0; border-bottom: 1px solid #ddd; }
        .items-table td { vertical-align: top; }
        .total-table { width: 100%; margin-top: 10px; }
        .total-table td { padding: 3px 0; }
        .total-table .total-row td { font-weight: bold; padding-top: 5px; border-top: 1px solid #ddd; }
        .footer { margin-top: 20px; text-align: center; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="store-name">Vivaas</div>
          <div>Shiv Park Phase 2 Shop No-6-7 Pune Solapur Road</div>
          <div>Lakshumi Colony Opposite HDFC Bank Near Angle School, Pune-412307</div>
          <div>9657171777 || 9765971717</div>
          <div style="margin-top: 10px;">${new Date(bill.createdAt).toLocaleString()}</div>
          <div style="margin-top: 5px;">Receipt #${bill.id}</div>
        </div>
        
        <div style="margin: 15px 0;">
          <div><strong>Customer:</strong> ${bill.customerName || "Walk-in Customer"}</div>
          ${bill.customerPhone ? `<div><strong>Phone:</strong> ${bill.customerPhone}</div>` : ''}
          ${bill.customerEmail ? `<div><strong>Email:</strong> ${bill.customerEmail}</div>` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <table class="total-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">${formatCurrency(bill.subtotal)}</td>
          </tr>
          <tr>
            <td>Tax (8%):</td>
            <td style="text-align: right;">${formatCurrency(bill.tax)}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td style="text-align: right;">${formatCurrency(bill.total)}</td>
          </tr>
        </table>
        
        <div style="margin-top: 15px;">
          <div><strong>Payment Method:</strong> ${getPaymentMethodName(bill.paymentMethod)}</div>
        </div>
        
        <div class="footer">
          <p>Thank you for shopping at Vivaas!</p>
          <p>Visit us again soon!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateSalesReportPDF = (reportData: any, period: string): Blob => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Vivaas - Sales Report (${period})`, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    
    // Add report data
    // This would need to be customized based on your actual report data structure
    
    return doc.output('blob');
  } catch (error) {
    console.error("Error generating sales report PDF:", error);
    return new Blob([`Error generating sales report for ${period}`], { type: 'text/plain' });
  }
};

export const generateSalesReportExcel = (reportData: any, period: string): Blob => {
  // This would generate a sales report Excel/CSV
  const csv = `Period,Sales\n${period},${Math.random() * 10000}`;
  return new Blob([csv], { type: 'text/csv' });
};

// Helper function to format currency
function formatCurrency(amount: number, includeCurrencySymbol: boolean = true): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: includeCurrencySymbol ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

// Helper function to get payment method name
function getPaymentMethodName(method: string): string {
  switch (method) {
    case 'cash': return 'Cash';
    case 'card': return 'Card';
    case 'digital-wallet': return 'UPI';
    default: return 'Unknown';
  }
}
