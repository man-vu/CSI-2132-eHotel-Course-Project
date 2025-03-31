"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

interface Hotel {
  HotelID: number;
  Name: string;
  Address: string;
  StarRating: number;
  Email?: string;
  Phone?: string;
}

interface Props {
  hotelId: number | null;
  onClose: () => void;
}

const HotelDetails = ({ hotelId, onClose }: Props) => {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hotelId) return;

    setLoading(true);
    apiFetch(`/hotels/${hotelId}`)
      .then(setHotel)
      .catch((err) => console.error("Error fetching hotel details:", err))
      .finally(() => setLoading(false));
  }, [hotelId]);

  if (!hotelId) return null;
  {console.log(hotel)}
  return (
    
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <button className="absolute top-3 right-3 text-xl" onClick={onClose}>
          ✖
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : hotel ? (
          <>
            <h2 className="text-2xl font-semibold">{hotel.Name}</h2>
            <p className="mt-2">{hotel.Address}</p>
            <p>⭐ {hotel.StarRating}</p>
            {hotel.Email && <p>📧 {hotel.Email}</p>}
            {hotel.Phone && <p>📞 {hotel.Phone}</p>}
          </>
        ) : (
          <p>Hotel not found</p>
        )}
      </div>
    </div>
  );
};

export default HotelDetails;
