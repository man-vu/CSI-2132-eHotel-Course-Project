import HotelList from "./components/HotelList";
import Navbar from "./components/Navbar";
import RoomList from "./components/RoomList";
import AvailableRoomsPerArea from "./components/AvailableRoomsPerArea";
import AggregatedRoomCapacity from "./components/AggregatedRoomCapacity";

export default function Home() {
  return <>
    <AvailableRoomsPerArea />
    <AggregatedRoomCapacity />
    <RoomList />
  </>;
}
