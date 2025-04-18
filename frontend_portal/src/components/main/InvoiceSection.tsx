// src/components/main/InvoiceSection.tsx
import { useNavigate } from "react-router";
import { toast, ToastContainer } from 'react-toastify';
import jsPDF from "jspdf";

interface Invoice {
  invoice_id: number;
  invoice_number: string;
  items: {
    ad_slot_id: number;
    ad_type: string;
    ad_unit: string;
    quantity: number;
    duration: string;
    total_amount: string;
    date: string;
  }[];
  total_amount: string;
  total_quantity: number;
  date: string;
  status: string;
}

interface InvoiceSectionProps {
  invoice: Invoice;
}

export default function InvoiceSection({ invoice }: InvoiceSectionProps) {
  const navigate = useNavigate();

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yOffset = margin;

    doc.setFillColor(33, 150, 243);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth / 2, yOffset + 10, { align: "center" });
    yOffset += 20;

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`Invoice #: ${invoice.invoice_number}`, margin, yOffset);
    doc.text(`Date: ${new Date(invoice.date).toLocaleString()}`, pageWidth - margin, yOffset, { align: "right" });
    yOffset += 15;

    const tableStart = yOffset;
    const colWidths = { slot: 100, qty: 30, amount: 50 };
    const rowHeight = 10;

    doc.setFillColor(200, 220, 255);
    doc.rect(margin, yOffset, pageWidth - 2 * margin, rowHeight, "F");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Ad Type - Ad Unit", margin + 5, yOffset + 7);
    doc.text("Quantity", margin + colWidths.slot + 15, yOffset + 7);
    doc.text("Amount", margin + colWidths.slot + colWidths.qty + 25, yOffset + 7, { align: "right" });
    yOffset += rowHeight;

    invoice.items.forEach((item, index) => {
      const fillColor = index % 2 === 0 ? 240 : 255;
      doc.setFillColor(fillColor, fillColor, fillColor);
      doc.rect(margin, yOffset, pageWidth - 2 * margin, rowHeight, "F");
      doc.setFont("helvetica", "normal");
      doc.text(`${item.ad_type} - ${item.ad_unit.substring(0, 45)}`, margin + 5, yOffset + 7);
      doc.text(item.quantity.toString(), margin + colWidths.slot + 15, yOffset + 7);
      doc.text(`TShs ${item.total_amount}`, margin + colWidths.slot + colWidths.qty + 25, yOffset + 7, { align: "right" });
      yOffset += rowHeight;
    });

    doc.setLineWidth(0.2);
    doc.setDrawColor(33, 150, 243);
    doc.rect(margin, tableStart, pageWidth - 2 * margin, yOffset - tableStart);

    yOffset += 15;
    doc.setFillColor(230, 245, 255);
    doc.rect(margin, yOffset, pageWidth - 2 * margin, 25, "F");
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Quantity: ${invoice.total_quantity}`, margin + 5, yOffset + 10);
    doc.text(`Total Amount: TShs ${invoice.total_amount}`, pageWidth - margin - 5, yOffset + 10, { align: "right" });

    doc.save(`invoice_${invoice.invoice_number}.pdf`);
    toast.success("Invoice PDF generated successfully!");
  };

  const handleCancelInvoice = () => {
    navigate("/dashboard");
    toast.info("Returning to dashboard");
  };

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Your Invoice</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
        <div className="text-gray-800 dark:text-gray-200">
          <p>Invoice #: {invoice.invoice_number}</p>
          <p>Date: {new Date(invoice.date).toLocaleString()}</p>
          {invoice.items.map((item, index) => (
            <div key={index} className="mt-2">
              <p>Ad Type: {item.ad_type}</p>
              <p>Ad Unit: {item.ad_unit}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Amount: TShs {item.total_amount}</p>
            </div>
          ))}
          <p className="mt-2">Total Quantity: {invoice.total_quantity}</p>
          <p>Total Amount: TShs {invoice.total_amount}</p>
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handlePrintPDF}
            className="py-2 px-6 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Print PDF
          </button>
          <button
            onClick={handleCancelInvoice}
            className="py-2 px-6 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}