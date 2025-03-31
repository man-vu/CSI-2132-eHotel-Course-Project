import { FC } from "react";
import Link from "next/link";

interface Room {
  RoomID: number;
  HotelID: number;
  Hotel: {
    Name: string;
    Address: string;
    StarRating: number;
  };
  Price: number;
  Capacity: string;
  Amenities: string;
  ViewType: string;
  IsExtendable: boolean;
}

interface RoomListItemProps {
  room: Room;
  userRole: string | undefined;
  openModal: (roomId: number, hotelId: number, renting: boolean) => void;
}

const RoomListItem: FC<RoomListItemProps> = ({ room, userRole, openModal }) => {
  return (
    <div key={room.RoomID} className="border rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold">{room.Hotel?.Name} - Room #{room.RoomID} - {room.Capacity}</h3>
      <p className="text-gray-600">Hotel: {room.Hotel?.Name || "N/A"}</p>
      <p className="text-gray-600">Address: {room.Hotel?.Address || "N/A"}</p>
      <p className="text-gray-600">Category: {room.Hotel?.StarRating || "N/A"} Stars</p>
      <p className="text-gray-600">Capacity: {room.Capacity || "N/A"}</p>
      <p className="text-gray-600">Price: ${(room.Price ? (room.Price / 100).toFixed(2) : "N/A")}</p>
      <p className="text-gray-600">View: {room.ViewType || "N/A"}</p>
      <p className="text-gray-600">Amenities: {room.Amenities || "None"}</p>
      <p className="text-gray-600">
        Extendable: {room.IsExtendable ? "Yes" : "No"}
      </p>
      {userRole === "customer" && (
        <button
          onClick={() => openModal(room.RoomID, room.HotelID, false)}
          className="mt-2 inline-block text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Book Room
        </button>
      )}
      {userRole === "employee" && (
        <button
          onClick={() => openModal(room.RoomID, room.HotelID, true)}
          className="mt-2 inline-block text-white bg-orange-600 px-4 py-2 rounded hover:bg-orange-700 transition"
        >
          Rent Room
        </button>
      )}
    </div>
  );
};

export default RoomListItem;