"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faBed, faEye, faDollarSign, faCalendarAlt, faCheck } from "@fortawesome/free-solid-svg-icons";

interface Booking {
  BookingID: number;
  RoomID: number;
  HotelID: number;
  StartDate: string;
  EndDate: string;
  Customer: {
    FullName: string;
    Email: string;
  };
  Room: {
    Price: number;
    Capacity: string;
    ViewType: string;
  };
}

const ManageBookings = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const user = await apiFetch("/auth/me"); // Fetch user details
        if (user.role !== "employee") {
          router.push("/unauthorized"); // Redirect if not an employee
        } else {
          fetchBookings();
        }
      } catch (error) {
        console.error("Authorization check failed:", error);
        router.push("/login"); // Redirect to login if not authenticated
      }
    };

    checkAuthorization();
  }, [router]);


  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await apiFetch("/bookings/manage");
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setMessage({ type: "error", text: "Failed to fetch bookings." });
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCheckIn = async (bookingId: number) => {
    try {
      await apiFetch(`/bookings/${bookingId}/check-in`, {
        method: "POST",
      });
      setMessage({ type: "success", text: "Check-in successful! The booking has been converted into a rental. Please visit the 'Check-in Customers' section for more details." });
      fetchBookings(); // Refresh the bookings list
    } catch (error) {
      console.error("Error checking in:", error);
      setMessage({ type: "error", text: "Check-in failed." });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading bookings...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Bookings</h2>
      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={`${booking.BookingID}-${booking.Customer.Email}`} className="border rounded-lg p-6 shadow-lg bg-white">
              <h3 className="text-xl font-semibold mb-2">Booking {booking.BookingID}</h3>
              <div className="mb-4">
                <p className="text-gray-700"><FontAwesomeIcon icon={faUser} className="mr-2" /><span className="font-semibold">Customer:</span> {booking.Customer.FullName}</p>
                <p className="text-gray-700"><FontAwesomeIcon icon={faEnvelope} className="mr-2" /><span className="font-semibold">Email:</span> {booking.Customer.Email}</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-700"><FontAwesomeIcon icon={faBed} className="mr-2" /><span className="font-semibold">Room Capacity:</span> {booking.Room.Capacity}</p>
                <p className="text-gray-700"><FontAwesomeIcon icon={faEye} className="mr-2" /><span className="font-semibold">Room View:</span> {booking.Room.ViewType}</p>
                <p className="text-gray-700"><FontAwesomeIcon icon={faDollarSign} className="mr-2" /><span className="font-semibold">Price:</span> ${(booking.Room.Price / 100).toFixed(2)}</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-700"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /><span className="font-semibold">Start Date:</span> {new Date(booking.StartDate).toLocaleDateString("en-CA", { timeZone: "UTC" })}</p>
                <p className="text-gray-700"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /><span className="font-semibold">End Date:</span> {new Date(booking.EndDate).toLocaleDateString("en-CA", { timeZone: "UTC" })}</p>
              </div>
              <button
                onClick={() => handleCheckIn(booking.BookingID)}
                className="mt-4 inline-block text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" />Check-In
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBookings;