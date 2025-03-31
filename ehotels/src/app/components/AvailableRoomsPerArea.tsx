"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/api";

interface AvailableRooms {
  Area: string;
  TotalAvailableRooms: number;
}

const AvailableRoomsPerArea = () => {
  const [data, setData] = useState<AvailableRooms[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await apiFetch("/rooms/views/available-rooms-per-area");
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading data...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Available Rooms Per Area</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Area</th>
            <th className="border p-2">Available Rooms</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.Area}>
              <td className="border p-2">{item.Area}</td>
              <td className="border p-2">{item.TotalAvailableRooms}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AvailableRoomsPerArea;