"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

interface RoomAvailability {
  area: string;
  totalAvailableRooms: number;
}

const RoomAvailabilityView = () => {
  const [rooms, setRooms] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/views/available-rooms")
      .then((data: RoomAvailability[]) => {
        setRooms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching available rooms:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading available rooms...</p>;

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4">Room Availability</h3>
      {rooms.length === 0 ? (
        <p>No available rooms.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {rooms.map((room, index) => (
            <li key={index} className="border p-4 shadow-md rounded-lg bg-white">
              <p className="text-gray-700">
                <strong>{room.area}:</strong> {room.totalAvailableRooms} rooms available
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoomAvailabilityView;
