"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faBed, faEye, faDollarSign, faCalendarAlt, faCheck, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import PaymentModal from "./PaymentModal";

interface Renting {
  RentingID: number;
  RoomID: number;
  HotelID: number;
  Duration: number;
  RentDate: string;
  StartDate: string;
  EndDate: string;
  IsArchived: boolean;
  Customer: {
    CustomerID: number;
    FullName: string;
    Email: string;
  };
  Room: {
    Price: number;
    Capacity: string;
    ViewType: string;
  };
  isPaidInFull: boolean;
  TotalPaid: number;
  RemainingAmount: number;
}

const CheckInCustomers = () => {
  const [rentings, setRentings] = useState<Renting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRentingId, setSelectedRentingId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  useEffect(() => {
    fetchRentings();
  }, []);

  const fetchRentings = async () => {
    try {
      const data = await apiFetch("/rentings/");
      setRentings(data);
      setLoading(false);
      console.log("Rentings fetched:", data);
    } catch (error) {
      console.error("Error fetching rentings:", error);
      setLoading(false);
    }
  };

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleCheckOut = async (rentingId: number) => {
    const renting = rentings.find((r) => r.RentingID === rentingId);
    if (renting && !renting.isPaidInFull) {
      setMessage({ text: "Payment must be made in full before check-out.", type: "error" });
      setTimeout(() => setMessage(null), 3000); // Clear the message after 3 seconds
      return;
    }

    try {
      await apiFetch(`/rentings/${rentingId}/check-out`, {
        method: "POST",
      });
      setMessage({ text: "Check-out successful!", type: "success" });
      fetchRentings(); // Refresh the rentings list
    } catch (error) {
      console.error("Error checking out:", error);
      setMessage({ text: "Check-out failed.", type: "error" });
    } finally {
      setTimeout(() => setMessage(null), 3000); // Clear the message after 3 seconds
    }
  };

  const openPaymentModal = (rentingId: number, customerId: number, remainingAmount: number) => {
    setSelectedRentingId(rentingId);
    setSelectedCustomerId(customerId);
    setIsPaymentModalOpen(true);
    console.log("Remaining Amount:", remainingAmount); // You can use this value as needed
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedRentingId(null);
    setSelectedCustomerId(null);
  };

  const calculateEndDate = (rentDate: string, duration: number) => {
    const rentDateObj = new Date(rentDate);
    rentDateObj.setDate(rentDateObj.getDate() + duration);
    return rentDateObj.toISOString().split("T")[0];
  };

  if (loading) return <p className="text-center text-gray-500">Loading rentings...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Checked-In Customers</h2>
      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
      {rentings.length === 0 ? (
        <p className="text-gray-500">No checked-in customers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rentings.map((renting) => (
            <div key={renting.RentingID} className="border rounded-lg p-6 shadow-lg bg-white">
              <h3 className="text-xl font-semibold mb-2">Renting {renting.RentingID}</h3>
              <div className="mb-4">
                <p className="text-gray-700"><FontAwesomeIcon icon={faUser} className="mr-2" /><span className="font-semibold">Customer:</span> {renting.Customer.FullName}</p>
                <p className="text-gray-700"><FontAwesomeIcon icon={faEnvelope} className="mr-2" /><span className="font-semibold">Email:</span> {renting.Customer.Email}</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-700"><FontAwesomeIcon icon={faBed} className="mr-2" /><span className="font-semibold">Room Capacity:</span> {renting.Room.Capacity}</p>
                <p className="text-gray-700"><FontAwesomeIcon icon={faEye} className="mr-2" /><span className="font-semibold">Room View:</span> {renting.Room.ViewType}</p>
                <p className="text-gray-700"><FontAwesomeIcon icon={faDollarSign} className="mr-2" /><span className="font-semibold">Price:</span> ${(renting.Room.Price / 100).toFixed(2)}</p>
                <div className="mb-4 text-center">
                  <p className="text-gray-700 font-semibold">Total Paid: ${(renting.TotalPaid / 100).toFixed(2)}</p>
                  <div className="relative w-20 h-20 mx-auto">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e6e6e6"
                        strokeWidth="2"
                      />
                      <path
                        className="circle"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4caf50"
                        strokeWidth="2"
                        strokeDasharray={`${(renting.TotalPaid / renting.Room.Price) * 100}, 100`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                      {((renting.TotalPaid / renting.Room.Price) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-gray-700"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /><span className="font-semibold">Rent Date:</span> {new Date(renting.RentDate).toLocaleDateString("en-CA", { timeZone: "UTC" })}</p>
                <p className="text-gray-700"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /><span className="font-semibold">Duration:</span> {renting.Duration} days</p>
                <p className="text-gray-700"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /><span className="font-semibold">End Date:</span> {new Date(calculateEndDate(renting.RentDate, renting.Duration)).toLocaleDateString("en-CA", { timeZone: "UTC" })}</p>
              </div>
              {!renting.IsArchived ? (
              <button
                onClick={() => handleCheckOut(renting.RentingID)}
                className="mt-4 inline-block text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" />Check-Out
              </button>
              ) : (
              <p className="text-gray-500">This renting is archived.</p>
              )}
                {renting.isPaidInFull ? (
                <p className="text-green-500">Paid in full</p>
                ) : (
                <button
                  onClick={() => openPaymentModal(renting.RentingID, renting.Customer.CustomerID, renting.RemainingAmount)}
                  className="mt-4 inline-block text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />Make Payment
                </button>
                )}
            </div>
          ))}
        </div>
      )}
      {selectedRentingId && selectedCustomerId && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          rentingId={selectedRentingId}
          customerId={selectedCustomerId}
          remainingAmount={rentings.find((r) => r.RentingID === selectedRentingId)?.RemainingAmount || 0}
          onPaymentSuccess={fetchRentings} // Pass the callback
        />
      )}
    </div>
  );
};

export default CheckInCustomers;