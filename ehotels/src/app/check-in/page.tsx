"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faBed, faEye, faDollarSign, faCalendarAlt, faCheck } from "@fortawesome/free-solid-svg-icons";

interface Renting {
  RentingID: number;
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

const CheckInCustomers = () => {
  const [rentings, setRentings] = useState<Renting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentings();
  }, []);

  const fetchRentings = async () => {
    try {
      const data = await apiFetch("/rentings");
      setRentings(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rentings:", error);
      setLoading(false);
    }
  };

  const handleCheckIn = async (rentingId: number) => {
    try {
      await apiFetch(`/rentings/${rentingId}/check-in`, {
        method: "POST",
      });
      alert("Check-in successful!");
      fetchRentings(); // Refresh the rentings list
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Check-in failed.");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading rentings...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Check-In Customers</h2>
      {rentings.length === 0 ? (
        <p className="text-gray-500">No rentings found.</p>
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
                {(renting.Room.Price / 100).toFixed(2)}</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-700"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /><span className="font-semibold">Start Date:</span> {new Date(renting.StartDate).toLocaleDateString("en-CA", { timeZone: "UTC" })}</p>
                <p className="text-gray-700"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /><span className="font-semibold">End Date:</span> {new Date(renting.EndDate).toLocaleDateString("en-CA", { timeZone: "UTC" })}</p>
              </div>
              <button
                onClick={() => handleCheckIn(renting.RentingID)}
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

export default CheckInCustomers;