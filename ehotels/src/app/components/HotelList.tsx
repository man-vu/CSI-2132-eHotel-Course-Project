"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import HotelDetails from "./HotelDetails";

interface Hotel {
  HotelID: number;
  Name: string;
  Address: string;
  StarRating: number;
}

const HotelList = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);

  useEffect(() => {
    apiFetch("/hotels")
      .then((data) => setHotels(data))
      .catch((err) => console.error("Error fetching hotels:", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Available Hotels</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hotels.map((hotel) => (
          <div
            key={hotel.HotelID}
            className="border p-4 rounded-lg shadow cursor-pointer"
            onClick={() => setSelectedHotelId(hotel.HotelID)}
          >
            <h3 className="text-xl font-semibold">{hotel.Name}</h3>
            <p>{hotel.Address}</p>
            <p>⭐ {hotel.StarRating}</p>
          </div>
        ))}
      </div>

      {/* Render modal when a hotel is selected */}
      {selectedHotelId && (
        <HotelDetails
          hotelId={selectedHotelId}
          onClose={() => setSelectedHotelId(null)}
        />
      )}
    </div>
  );
};

export default HotelList;
