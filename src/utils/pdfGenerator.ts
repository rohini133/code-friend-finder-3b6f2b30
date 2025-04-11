import { BillWithItems } from "@/data/models";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDF = (bill: BillWithItems): Blob => {
  try {
    // Create a new document with jsPDF
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add business info
    doc.setFontSize(20);
    doc.text("Demo", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("Retail Management System", pageWidth / 2, 28, { align: "center" });
    doc.text("123 Shopping Street, Retail City", pageWidth / 2, 35, { align: "center" });
    doc.text("Contact: +91 98765 43210", pageWidth / 2, 42, { align: "center" });
    
    // Add bill info with more prominent bill number
    doc.setFontSize(14);
    doc.text(`Bill #${bill.id}`, 14, 55);
    
    // Add date in a clearer format
    doc.setFontSize(10);
    const date = new Date(bill.createdAt);
    const formattedDate = `Date: ${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()} at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'pm' : 'am'}`;
    doc.text(formattedDate, 14, 62);
    
    // Add customer details
    doc.text(`Customer: ${bill.customerName || "Walk-in Customer"}`, 14, 70);
    if (bill.customerPhone) {
      doc.text(`Phone: ${bill.customerPhone}`, 14, 77);
    }
    if (bill.customerEmail) {
      doc.text(`Email: ${bill.customerEmail}`, 14, 84);
    }
    
    // Add payment method with clearer labels
    const paymentMethodMap = {
      "cash": "Cash",
      "card": "Credit/Debit Card",
      "digital-wallet": "Digital Wallet"
    };
    doc.text(`Payment Method: ${paymentMethodMap[bill.paymentMethod as keyof typeof paymentMethodMap] || bill.paymentMethod}`, 14, 91);
    
    // Make sure the items table is always included and properly formatted
    if (bill.items && bill.items.length > 0) {
      // Add items table with more detailed columns
      const tableColumn = ["No.", "Item", "Price", "Qty", "Discount", "Total"];
      const tableRows = bill.items.map((item, index) => {
        const productName = item.productName || item.product?.name || "Unknown Product";
        const productPrice = item.productPrice || item.product?.price || 0;
        const discount = item.discountPercentage || item.product?.discountPercentage || 0;
        const quantity = item.quantity;
        const discountedPrice = productPrice * (1 - discount / 100);
        const totalPrice = discountedPrice * quantity;
        
        return [
          (index + 1).toString(),
          productName,
          `₹ ${productPrice.toFixed(2)}`,
          quantity.toString(),
          `${discount}%`,
          `₹ ${totalPrice.toFixed(2)}`
        ];
      });
      
      // Use autoTable plugin with improved styling
      autoTable(doc, {
        startY: 100,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { top: 100 },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 10 }, // No.
          1: { cellWidth: 60 }, // Item
          2: { cellWidth: 25 }, // Price
          3: { cellWidth: 15 }, // Qty
          4: { cellWidth: 25 }, // Discount
          5: { cellWidth: 30 }  // Total
        }
      });
    } else {
      // If no items are present, display a message
      doc.setFontSize(12);
      doc.text("No items in this bill", pageWidth / 2, 120, { align: "center" });
    }
    
    // Calculate the Y position after the table
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 130;
    
    // Add summary with more formatting
    doc.setFontSize(10);
    const subtotalText = `Subtotal:`;
    const subtotalValue = `₹ ${bill.subtotal.toFixed(2)}`;
    doc.text(subtotalText, pageWidth - 80, finalY + 10);
    doc.text(subtotalValue, pageWidth - 20, finalY + 10, { align: 'right' });
    
    const taxText = `Tax (8%):`;
    const taxValue = `₹ ${bill.tax.toFixed(2)}`;
    doc.text(taxText, pageWidth - 80, finalY + 17);
    doc.text(taxValue, pageWidth - 20, finalY + 17, { align: 'right' });
    
    // Grand total with bold formatting
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    const grandTotalText = `Grand Total:`;
    const grandTotalValue = `₹ ${bill.total.toFixed(2)}`;
    doc.text(grandTotalText, pageWidth - 80, finalY + 27);
    doc.text(grandTotalValue, pageWidth - 20, finalY + 27, { align: 'right' });
    doc.setFont(undefined, 'normal');
    
    // Add footer
    doc.setFontSize(8);
    doc.text("Thank you for shopping with us!", pageWidth / 2, finalY + 40, { align: "center" });
    doc.text("This is a computer-generated receipt and does not require a signature.", pageWidth / 2, finalY + 45, { align: "center" });
    
    // Convert to blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw new Error("Failed to generate PDF");
  }
};

export const generateSalesReportPDF = (reportData: any, timeframe: string): Blob => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add report header
    doc.setFontSize(20);
    doc.text("Sales Report", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text(`${timeframe} Sales Overview`, pageWidth / 2, 30, { align: "center" });
    
    const currentDate = new Date();
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate.toLocaleDateString('en-IN')}`, 14, 40);
    
    // Add sales chart data as table
    let salesData;
    let title;
    
    switch(timeframe.toLowerCase()) {
      case 'daily':
        salesData = reportData.dailySales;
        title = 'Daily Sales - Current Month';
        break;
      case 'weekly':
        salesData = reportData.weeklySales;
        title = 'Weekly Sales - Last 12 Weeks';
        break;
      case 'monthly':
        salesData = reportData.monthlySales;
        title = 'Monthly Sales - Current Year';
        break;
      case 'yearly':
        salesData = reportData.yearlySales;
        title = 'Yearly Sales - Last 5 Years';
        break;
      default:
        salesData = reportData.monthlySales;
        title = 'Monthly Sales';
    }
    
    doc.setFontSize(12);
    doc.text(title, 14, 50);
    
    // Create table for sales data
    const salesTableColumns = ["Period", "Sales Amount"];
    const salesTableRows = salesData.map((item: any) => [
      item.day || item.week || item.month || item.name || item.year || "Period",
      `₹ ${item.sales.toLocaleString('en-IN')}`
    ]);
    
    autoTable(doc, {
      startY: 55,
      head: [salesTableColumns],
      body: salesTableRows,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Calculate the Y position after the first table
    const firstTableEndY = (doc as any).lastAutoTable.finalY + 10;
    
    // Add category distribution if available
    if (reportData.categoryDistribution) {
      doc.setFontSize(12);
      doc.text("Sales by Category", 14, firstTableEndY + 5);
      
      const categoryColumns = ["Category", "Percentage"];
      const categoryRows = reportData.categoryDistribution.map((item: any) => [
        item.name,
        `${item.value}%`
      ]);
      
      autoTable(doc, {
        startY: firstTableEndY + 10,
        head: [categoryColumns],
        body: categoryRows,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
    }
    
    // Add top products if available
    if (reportData.topProducts && reportData.topProducts.length > 0) {
      const categoryEndY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : firstTableEndY + 10;
      
      doc.setFontSize(12);
      doc.text("Top Selling Products", 14, categoryEndY + 5);
      
      const productsColumns = ["Product", "Category", "Units Sold"];
      const productRows = reportData.topProducts.map((item: any) => [
        item.product.name,
        item.product.category,
        item.soldCount.toString()
      ]);
      
      autoTable(doc, {
        startY: categoryEndY + 10,
        head: [productsColumns],
        body: productRows,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
    }
    
    // Add recent transactions if available
    if (reportData.recentTransactions && reportData.recentTransactions.length > 0) {
      const previousEndY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : firstTableEndY + 10;
      
      doc.setFontSize(12);
      doc.text("Recent Transactions", 14, previousEndY + 5);
      
      const transactionColumns = ["ID", "Customer", "Date", "Total"];
      const transactionRows = reportData.recentTransactions.slice(0, 5).map((bill: any) => [
        bill.id,
        bill.customerName || "Walk-in Customer",
        new Date(bill.createdAt).toLocaleDateString(),
        `₹ ${bill.total.toLocaleString('en-IN')}`
      ]);
      
      autoTable(doc, {
        startY: previousEndY + 10,
        head: [transactionColumns],
        body: transactionRows,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
    }
    
    // Add footer
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 200;
    doc.setFontSize(8);
    doc.text("Sales Report - Confidential", pageWidth / 2, finalY, { align: "center" });
    doc.text("© Demo Retail Management System", pageWidth / 2, finalY + 5, { align: "center" });
    
    return doc.output('blob');
  } catch (error) {
    console.error("Sales Report PDF Generation Error:", error);
    throw new Error("Failed to generate sales report PDF");
  }
};

export const generateSalesReportExcel = (reportData: any, timeframe: string): Blob => {
  try {
    // This is a simple CSV generation, in a real app you'd use a proper Excel library
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += `Sales Report - ${timeframe}\r\n`;
    csvContent += `Generated on: ${new Date().toLocaleDateString('en-IN')}\r\n\r\n`;
    
    // Get the correct data based on timeframe
    let salesData;
    let periodName;
    
    switch(timeframe.toLowerCase()) {
      case 'daily':
        salesData = reportData.dailySales;
        periodName = "Day";
        break;
      case 'weekly':
        salesData = reportData.weeklySales;
        periodName = "Week";
        break;
      case 'monthly':
        salesData = reportData.monthlySales;
        periodName = "Month";
        break;
      case 'yearly':
        salesData = reportData.yearlySales;
        periodName = "Year";
        break;
      default:
        salesData = reportData.monthlySales;
        periodName = "Period";
    }
    
    // Add sales data
    csvContent += `${periodName},Sales Amount\r\n`;
    salesData.forEach((item: any) => {
      const period = item.day || item.week || item.month || item.name || item.year || "Unknown";
      csvContent += `${period},${item.sales}\r\n`;
    });
    
    // Add a separator
    csvContent += "\r\n";
    
    // Add category distribution if available
    if (reportData.categoryDistribution) {
      csvContent += "Category Distribution\r\n";
      csvContent += "Category,Percentage\r\n";
      reportData.categoryDistribution.forEach((item: any) => {
        csvContent += `${item.name},${item.value}%\r\n`;
      });
      csvContent += "\r\n";
    }
    
    // Add top products if available
    if (reportData.topProducts && reportData.topProducts.length > 0) {
      csvContent += "Top Selling Products\r\n";
      csvContent += "Product,Category,Units Sold\r\n";
      reportData.topProducts.forEach((item: any) => {
        csvContent += `${item.product.name},${item.product.category},${item.soldCount}\r\n`;
      });
      csvContent += "\r\n";
    }
    
    // Add recent transactions if available
    if (reportData.recentTransactions && reportData.recentTransactions.length > 0) {
      csvContent += "Recent Transactions\r\n";
      csvContent += "ID,Customer,Date,Total\r\n";
      reportData.recentTransactions.slice(0, 5).forEach((bill: any) => {
        csvContent += `${bill.id},${bill.customerName || "Walk-in Customer"},${new Date(bill.createdAt).toLocaleDateString()},${bill.total}\r\n`;
      });
    }
    
    // Convert to blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return blob;
  } catch (error) {
    console.error("Sales Report Excel Generation Error:", error);
    throw new Error("Failed to generate Excel report");
  }
};
