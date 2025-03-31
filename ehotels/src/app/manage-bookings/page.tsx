"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/api";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

interface Booking {
  BookingID: number;
  RoomID: number;
  HotelID: number;
  StartDate: string;
  EndDate: string;
  Hotel: {
    Name: string;
    Address: string;
  };
  Room: {
    Price: number;
    Capacity: string;
    ViewType: string;
  };
}

const ManageBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const data = await apiFetch(`/bookings?customerId=${user?.userId}`);
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading bookings...</p>;

  console.log("Bookings:", bookings);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking.BookingID} className="border rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold">Booking {booking.BookingID}</h3>
              <p className="text-gray-600">Hotel: {booking.Hotel.Name}</p>
              <p className="text-gray-600">Address: {booking.Hotel.Address}</p>
              <p className="text-gray-600">Room Capacity: {booking.Room.Capacity}</p>
              <p className="text-gray-600">Room View: {booking.Room.ViewType}</p>
              <p className="text-gray-600">Price: ${Math.round(booking.Room.Price * 100) / 100}</p>
              <p className="text-gray-600">Start Date: {new Date(booking.StartDate).toLocaleDateString("en-CA", { timeZone: "UTC" })}</p>
              <p className="text-gray-600">End Date: {new Date(booking.EndDate).toLocaleDateString("en-CA", { timeZone: "UTC" })}</p>
              {/* <Link href={`/make-payment/${booking.BookingID}`} className="mt-4 inline-block text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition">
                Make Payment
              </Link> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBookings;