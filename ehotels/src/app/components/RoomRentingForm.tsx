"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/app/utils/api";
import { useAuth } from "@/app/context/AuthContext";

interface Customer {
  CustomerID: number;
  FullName: string;
}

const RoomRentingForm = ({ roomId, hotelId }: { roomId: number, hotelId: number }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  // Get current date and a date one week in the future
  const currentDate = new Date().toISOString().split("T")[0];
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const defaultEndDate = nextWeekDate.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await apiFetch("/customers");
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleRenting = async () => {
    if (!user) {
      setMessage("You must be logged in to rent a room.");
      setIsSuccess(false);
      return;
    }

    if (!selectedCustomerId) {
      setMessage("Please select a customer.");
      setIsSuccess(false);
      return;
    }

    if (!startDate || !endDate) {
      setMessage("Please select both start and end dates.");
      setIsSuccess(false);
      return;
    }

    try {
      const response = await apiFetch("/rentings", {
        method: "POST",
        body: JSON.stringify({ customerId: selectedCustomerId, roomId, hotelId, startDate, endDate }),
      });

      if (response.ok) {
        setMessage("Renting successful! Redirecting to manage check-in customers...");
        setIsSuccess(true);
        setTimeout(() => {
          setMessage(null);
          window.location.href = "/check-in-customers";
        }, 3000);
        
      } else {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          setMessage(`Renting failed: ${errorData.error}`);
        } else {
          setMessage(`Renting failed: HTTP error! Status: ${response.status}`);
        }
        setIsSuccess(false);
      }
    } catch (error: any) {
      console.error("Renting error:", error);
      setMessage(`Renting failed: ${error.message}`);
      setIsSuccess(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Rent This Room</h3>
      {message && (
        <div className={`mb-4 ${isSuccess ? "text-green-500" : "text-red-500"}`}>
          {message}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="customer">
          Select Customer
        </label>
        <select
          id="customer"
          className="border p-2 w-full mb-2"
          value={selectedCustomerId || ""}
          onChange={(e) => setSelectedCustomerId(parseInt(e.target.value, 10))}
        >
          <option value="" disabled>Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.CustomerID} value={customer.CustomerID}>
              {customer.FullName}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="startDate">
          Start Date
        </label>
        <input
          id="startDate"
          type="date"
          className="border p-2 w-full mb-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="endDate">
          End Date
        </label>
        <input
          id="endDate"
          type="date"
          className="border p-2 w-full mb-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <button
        className="bg-orange-600 text-white p-2 rounded w-full"
        onClick={handleRenting}
      >
        Confirm Renting
      </button>
    </div>
  );
};

export default RoomRentingForm;