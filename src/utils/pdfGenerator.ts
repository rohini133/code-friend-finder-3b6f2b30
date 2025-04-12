import { BillWithItems } from "@/data/models";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Constants for shop information
const SHOP_NAME = "Vivaas";
const SHOP_ADDRESS_LINE1 = "Shiv Park Phase 2 Shop No-6-7 Pune Solapur Road";
const SHOP_ADDRESS_LINE2 = "Lakshumi Colony Opposite HDFC Bank Near Angle School, Pune-412307";
const SHOP_CONTACT = "9657171777 || 9765971717";
const SHOP_GSTIN = "27AHDPS0010G1ZU"; // Replace with actual GSTIN if available
const SHOP_LOGO = "public/lovable-uploads/4074e4b6-df93-42f1-9e94-22828d9dfb57.png"; // Path to the uploaded logo

export const generatePDF = (bill: BillWithItems): Blob => {
  console.log("Generating PDF for bill:", bill);
  
  // Validate the bill has items
  if (!bill.items || bill.items.length === 0) {
    console.error("No items found in the bill for PDF generation", bill);
  }
  
  try {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add logo
    try {
      doc.addImage(SHOP_LOGO, 'PNG', doc.internal.pageSize.getWidth() / 2 - 20, 10, 40, 20, undefined, 'FAST');
    } catch (logoError) {
      console.error("Could not add logo:", logoError);
    }
    
    // Add Vivaas shop information
    const headerY = 35; // Starting Y position after logo
    
    // Set font sizes
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(SHOP_NAME, doc.internal.pageSize.getWidth() / 2, headerY, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(SHOP_ADDRESS_LINE1, doc.internal.pageSize.getWidth() / 2, headerY + 7, { align: "center" });
    doc.text(SHOP_ADDRESS_LINE2, doc.internal.pageSize.getWidth() / 2, headerY + 12, { align: "center" });
    doc.text(SHOP_CONTACT, doc.internal.pageSize.getWidth() / 2, headerY + 17, { align: "center" });
    doc.text(`GSTIN : ${SHOP_GSTIN}`, doc.internal.pageSize.getWidth() / 2, headerY + 22, { align: "center" });
    
    // Add a separator line
    doc.setLineWidth(0.5);
    doc.line(14, headerY + 25, doc.internal.pageSize.getWidth() - 14, headerY + 25);
    
    // Add receipt information
    const receiptInfoY = headerY + 30;
    doc.setFontSize(11);
    doc.text(`Bill No : ${bill.id}`, 14, receiptInfoY);
    doc.text(`Date : ${new Date(bill.createdAt).toLocaleDateString()}`, doc.internal.pageSize.getWidth() - 14, receiptInfoY, { align: "right" });
    
    doc.text(`Counter No : 1`, 14, receiptInfoY + 5);
    doc.text(`Time : ${new Date(bill.createdAt).toLocaleTimeString()}`, doc.internal.pageSize.getWidth() - 14, receiptInfoY + 5, { align: "right" });
    
    // Add customer information if available
    let startY = receiptInfoY + 10;
    if (bill.customerName || bill.customerPhone || bill.customerEmail) {
      doc.text("Customer:", 14, startY);
      startY += 5;
      
      if (bill.customerName) {
        doc.text(`Name: ${bill.customerName}`, 14, startY);
        startY += 5;
      }
      
      if (bill.customerPhone) {
        doc.text(`Phone: ${bill.customerPhone}`, 14, startY);
        startY += 5;
      }
      
      if (bill.customerEmail) {
        doc.text(`Email: ${bill.customerEmail}`, 14, startY);
        startY += 5;
      }
      
      startY += 5;
    }
    
    // Create items table with MRP and SSP columns as in the reference
    const hasItems = bill.items && bill.items.length > 0;
    
    if (hasItems) {
      const tableData = bill.items.map(item => {
        const productName = item.productName || (item.product ? item.product.name : "Unknown Product");
        const productPrice = item.productPrice || (item.product ? item.product.price : 0);
        const discountPercentage = item.discountPercentage || (item.product ? item.product.discountPercentage : 0);
        const ssp = productPrice * (1 - discountPercentage / 100);
        const mrp = productPrice;
        
        return [
          productName,
          item.quantity.toString(),
          formatCurrency(mrp, false),
          formatCurrency(ssp, false),
          formatCurrency(item.total, false)
        ];
      });
      
      autoTable(doc, {
        startY: startY,
        head: [["Particulars", "Qty", "MRP", "SSP", "Tot.Amount"]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [100, 100, 100] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' }
        }
      });
    } else {
      doc.text("No items in this bill", doc.internal.pageSize.getWidth() / 2, startY + 10, { align: "center" });
    }
    
    // Get the Y position after the table
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : startY + 20;
    
    // Calculate totals for MRP, savings and net amount
    const totalMRP = bill.items ? bill.items.reduce((sum, item) => {
      const productPrice = item.productPrice || (item.product ? item.product.price : 0);
      return sum + (productPrice * item.quantity);
    }, 0) : 0;
    
    const savings = totalMRP - bill.subtotal;
    
    // Add Quantity total and Total MRP line
    doc.setFont("helvetica", "bold");
    doc.text(`Qty:`, 14, finalY);
    doc.text(`${bill.items?.reduce((sum, item) => sum + item.quantity, 0)}`, 30, finalY);
    doc.text(`Total MRP:`, 100, finalY);
    doc.text(`${formatCurrency(totalMRP, false)}`, doc.internal.pageSize.getWidth() - 14, finalY, { align: "right" });
    
    // Add savings line
    doc.text(`Your Saving :`, 14, finalY + 7);
    doc.text(`${formatCurrency(savings, false)}`, doc.internal.pageSize.getWidth() - 14, finalY + 7, { align: "right" });
    
    // Add total line
    doc.text(`Total :`, 14, finalY + 14);
    doc.text(`${formatCurrency(bill.total, false)}`, doc.internal.pageSize.getWidth() - 14, finalY + 14, { align: "right" });
    
    // Add GST summary box
    const gstY = finalY + 20;
    doc.rect(14, gstY, doc.internal.pageSize.getWidth() - 28, 30);
    
    // Add GST summary header
    doc.text("GST Summary :", 18, gstY + 6);
    
    // Add GST table headers
    doc.setFont("helvetica", "normal");
    doc.text("Description", 18, gstY + 12);
    doc.text("Taxable", 70, gstY + 12);
    doc.text("CGST", 110, gstY + 12);
    doc.text("SGST", 150, gstY + 12);
    
    // Calculate GST amounts - assuming 18% GST (9% CGST + 9% SGST)
    const taxableAmount = bill.subtotal;
    const cgst = bill.tax / 2; // Assuming tax is already split for CGST+SGST
    const sgst = bill.tax / 2;
    
    // Add GST details row - splitting into 9% CGST and 9% SGST
    doc.text("GST 18.00%", 18, gstY + 18);
    doc.text(formatCurrency(taxableAmount, false), 70, gstY + 18);
    doc.text(formatCurrency(cgst, false), 110, gstY + 18);
    doc.text(formatCurrency(sgst, false), 150, gstY + 18);
    
    // Add GST table totals
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(taxableAmount, false), 70, gstY + 24);
    doc.text(formatCurrency(cgst, false), 110, gstY + 24);
    doc.text(formatCurrency(sgst, false), 150, gstY + 24);
    
    // Add Net Amount line
    const netAmountY = gstY + 35;
    doc.setFont("helvetica", "bold");
    doc.text(`Net Amount : `, 14, netAmountY);
    doc.text(`₹ ${formatCurrency(bill.total, false)}`, doc.internal.pageSize.getWidth() - 14, netAmountY, { align: "right" });
    
    // Add payment details
    const paymentY = netAmountY + 7;
    doc.setFont("helvetica", "normal");
    doc.text(`${getPaymentMethodName(bill.paymentMethod)} : ${formatCurrency(bill.total, false)}`, 14, paymentY);
    doc.text(`${getPaymentMethodName(bill.paymentMethod)} Date : ${new Date(bill.createdAt).toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2 + 10, paymentY);
    
    // Add UPI details
    doc.text(`UPI No. 0`, 14, paymentY + 7);
    doc.text(`Bank : `, doc.internal.pageSize.getWidth() / 2 + 10, paymentY + 7);
    
    // Add thank you message
    const thankYouY = paymentY + 14;
    doc.text("Thank you for shopping with us", doc.internal.pageSize.getWidth() / 2, thankYouY, { align: "center" });
    doc.text("Please visit again..!", doc.internal.pageSize.getWidth() / 2, thankYouY + 5, { align: "center" });
    doc.text("*** Have A Nice Day ***", doc.internal.pageSize.getWidth() / 2, thankYouY + 10, { align: "center" });
    
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
