"use client";
import { useState } from "react";
import { apiFetch } from "@/app/utils/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const RoomBookingForm = ({ roomId, hotelId }: { roomId: number, hotelId: number }) => {
  const { user } = useAuth();
  const router = useRouter();

  // Get current date and a date one week in the future
  const currentDate = new Date().toISOString().split("T")[0];
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const defaultEndDate = nextWeekDate.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const handleBooking = async () => {
    if (!user) {
      alert("You must be logged in to book a room.");
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    try {
      const response = await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({ customerId: user.userId, roomId, hotelId, startDate, endDate }),
      });

      if (response.ok) {
        alert("Booking successful!");
        router.push("/manage-bookings");
      } else {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          alert(`Booking failed: ${errorData.error}`);
        } else {
          alert(`Booking failed: HTTP error! Status: ${response.status}`);
        }
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      alert(`Booking failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Book This Room</h3>
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
        className="bg-blue-600 text-white p-2 rounded w-full"
        onClick={handleBooking}
      >
        Confirm Booking
      </button>
    </div>
  );
};

export default RoomBookingForm;