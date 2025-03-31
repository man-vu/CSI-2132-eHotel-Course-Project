"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

interface AggregatedCapacity {
  HotelID: number;
  HotelName: string;
  Address: string;
  StarRating: number;
  TotalCapacity: number;
}

const AggregatedRoomCapacity = () => {
  const [data, setData] = useState<AggregatedCapacity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await apiFetch("/rooms/views/aggregated-room-capacity");
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  console.log("AggregatedRoomCapacity", data);

  if (loading) return <p className="text-center text-gray-500">Loading data...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Aggregated Room Capacity Per Hotel</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Hotel ID</th>
            <th className="border p-2">Hotel Name</th>
            <th className="border p-2">Address</th>
            <th className="border p-2">Star Rating</th>
            <th className="border p-2">Total Capacity</th>
          </tr>
        </thead>
        <tbody>
            {data.map((item) => (
            <tr key={item.HotelID}>
              <td className="border p-2">{item.HotelID}</td>
              <td className="border p-2">{item.HotelName}</td>
              <td className="border p-2">{item.Address}</td>
                <td className="border p-2">
                  {Array.from({ length: item.StarRating }, (_, index) => (
                    <FontAwesomeIcon key={index} icon={faStar} className="text-yellow-500" />
                  ))}
                </td>
              <td className="border p-2">{item.TotalCapacity}</td>
            </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default AggregatedRoomCapacity;