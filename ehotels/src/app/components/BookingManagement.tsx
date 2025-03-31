"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

interface Booking {
  BookingID: number;
  CustomerID: number;
  RoomID: number;
  StartDate: string;
  EndDate: string;
  IsArchived: boolean;
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    apiFetch("/bookings")
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  };

  const handleCheckIn = (bookingID: number) => {
    apiFetch(`/rentings`, {
      method: "POST",
      body: JSON.stringify({ bookingID }),
    }).then(() => fetchBookings());
  };

  if (loading) return <p className="text-center text-gray-500">Loading bookings...</p>;

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Bookings</h3>
      {bookings.length === 0 ? (
        <p>No active bookings</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => (
            <div key={booking.BookingID} className="border p-4 shadow">
              <p>Room ID: {booking.RoomID}</p>
              <p>Customer ID: {booking.CustomerID}</p>
              <p>Check-in: {booking.StartDate}</p>
              <p>Check-out: {booking.EndDate}</p>
              <button
                onClick={() => handleCheckIn(booking.BookingID)}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                Convert to Renting
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
