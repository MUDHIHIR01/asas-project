// src/components/main/ProcessedSlotsPage.tsx
import { useState } from "react";
import { useLocation } from "react-router";
import 'react-toastify/dist/ReactToastify.css';
import CartSection from "./CartSection";
import InvoiceSection from "./InvoiceSection";

interface AdSlot {
  ad_slot_id: number;
  ad_type: string;
  ad_unit: string;
  dimensions: string;
  device: string;
  platform: string;
  placement_type: string;
  rate: string;
  rate_unit: string;
  duration_limit: string;
  available: number;
  image: string;
  created_at: string;
  updated_at: string;
}

interface BookingSlot extends AdSlot {
  quantity: number | string;
}

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

export default function ProcessedSlotsPage() {
  const location = useLocation();
  const [selectedAds, setSelectedAds] = useState<BookingSlot[]>(
    location.state?.selectedAds.map((ad: AdSlot) => ({ ...ad, quantity: "" })) || []
  );
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const handleBookingSuccess = (newInvoice: Invoice) => {
    setInvoice(newInvoice);
    setSelectedAds([]); // Ensure cart is cleared in parent
  };

  const handleCartUpdate = (updatedAds: BookingSlot[]) => {
    setSelectedAds(updatedAds); // Sync parent state with cart changes
  };

  if (selectedAds.length === 0 && !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-gray-800 dark:text-white">
          <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
          <button
            onClick={() => location.pathname = "/dashboard"}
            className="py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {selectedAds.length > 0 && !invoice && (
          <CartSection 
            initialAds={selectedAds} 
            onBookingSuccess={handleBookingSuccess} 
            onCartUpdate={handleCartUpdate} 
          />
        )}
        {invoice && <InvoiceSection invoice={invoice} />}
      </div>
    </div>
  );
}