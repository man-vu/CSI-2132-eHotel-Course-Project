"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import Modal from "./Modal";
import RoomBookingForm from "./RoomBookingForm";
import RoomRentingForm from "./RoomRentingForm";
import { useAuth } from "@/app/context/AuthContext"; // Import the useAuth hook
import RoomFilters from "./RoomFilters";
import RoomListItem from "./RoomListItem";

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

interface HotelChain {
  ChainID: number;
  Name: string;
}

const RoomList = () => {
  const { user } = useAuth(); // Get the user from the useAuth hook
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRooms, setCurrentRooms] = useState<Room[]>([]); // State to hold rooms for the current page
  const [hotelChains, setHotelChains] = useState<HotelChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    capacity: "",
    area: "",
    hotelChain: "",
    category: "",
    totalRooms: "",
    minPrice: "",
    maxPrice: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0); // State to track the total number of rooms
  const roomsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [isRenting, setIsRenting] = useState(false); // State to track if renting or booking

  useEffect(() => {
    fetchHotelChains();
    fetchFilteredRooms();
  }, [filters, currentPage]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = startIndex + roomsPerPage;
    setCurrentRooms(rooms.slice(startIndex, endIndex));
  }, [rooms, currentPage]);

  // Fetch hotel chains for dropdown
  const fetchHotelChains = () => {
    apiFetch("/hotel-chains")
      .then((data) => setHotelChains(data))
      .catch((err) => console.error("Error fetching hotel chains:", err));
  };

  const fetchFilteredRooms = () => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      ...filters,
      page: currentPage.toString(),
      limit: roomsPerPage.toString(),
    } as any).toString();
    apiFetch(`/rooms?${queryParams}`)
      .then((rooms) => {
        console.log("Fetched rooms:", rooms);
        setRooms(rooms);
        setTotalRooms(rooms.length); // Set the total number of rooms
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setLoading(false);
      });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const openModal = (roomId: number, hotelId: number, renting: boolean) => {
    setSelectedRoomId(roomId);
    setSelectedHotelId(hotelId);
    setIsRenting(renting);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoomId(null);
    setSelectedHotelId(null);
    setIsRenting(false);
  };

  if (loading) return <p className="text-center text-gray-500">Loading rooms...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>

      {/* Filter Form */}
        <RoomFilters filters={filters} hotelChains={hotelChains} handleFilterChange={handleFilterChange} />

        {/* Room List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rooms.length === 0 ? (
            <p className="text-gray-500">No rooms match your filters.</p>
            ) : (
            currentRooms.map((room) => (
              <RoomListItem
              key={`${room.RoomID}-${room.HotelID}`}
              room={room}
              userRole={user?.role}
              openModal={openModal}
              />
            ))
            )}
        </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 mx-1">{currentPage}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage * roomsPerPage >= totalRooms}
          className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Booking/Renting Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedRoomId && selectedHotelId && (
          isRenting ? (
            <RoomRentingForm roomId={selectedRoomId} hotelId={selectedHotelId} />
          ) : (
            <RoomBookingForm roomId={selectedRoomId} hotelId={selectedHotelId} />
          )
        )}
      </Modal>
    </div>
  );
};

export default RoomList;