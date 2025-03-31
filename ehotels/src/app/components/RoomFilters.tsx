import { FC } from "react";

interface RoomFiltersProps {
  filters: any;
  hotelChains: any[];
  handleFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const RoomFilters: FC<RoomFiltersProps> = ({ filters, hotelChains, handleFilterChange }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <input
        type="date"
        name="startDate"
        value={filters.startDate}
        onChange={handleFilterChange}
        className="border p-2 rounded"
        placeholder="Start Date"
      />
      <input
        type="date"
        name="endDate"
        value={filters.endDate}
        onChange={handleFilterChange}
        className="border p-2 rounded"
        placeholder="End Date"
      />
      <select
        name="capacity"
        value={filters.capacity}
        onChange={handleFilterChange}
        className="border p-2 rounded"
      >
        <option value="">Capacity</option>
        <option value="Single">Single</option>
        <option value="Double">Double</option>
        <option value="Suite">Suite</option>
      </select>
      <input
        type="text"
        name="area"
        value={filters.area}
        onChange={handleFilterChange}
        className="border p-2 rounded"
        placeholder="Area"
      />

      {/* Hotel Chain Dropdown */}
      <select
        name="hotelChain"
        value={filters.hotelChain}
        onChange={handleFilterChange}
        className="border p-2 rounded"
      >
        <option value="">Hotel Chain</option>
        {hotelChains.map((chain) => (
          <option key={chain.ChainID} value={chain.ChainID}>
            {chain.Name}
          </option>
        ))}
      </select>

      <select
        name="category"
        value={filters.category}
        onChange={handleFilterChange}
        className="border p-2 rounded"
      >
        <option value="">Hotel Category</option>
        <option value="1">1 Star</option>
        <option value="2">2 Stars</option>
        <option value="3">3 Stars</option>
        <option value="4">4 Stars</option>
        <option value="5">5 Stars</option>
      </select>
      <input
        type="number"
        name="totalRooms"
        value={filters.totalRooms}
        onChange={handleFilterChange}
        className="border p-2 rounded"
        placeholder="Total Rooms in Hotel"
      />
      <div className="flex gap-2">
        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleFilterChange}
          className="border p-2 rounded w-full"
          placeholder="Min Price"
        />
        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          className="border p-2 rounded w-full"
          placeholder="Max Price"
        />
      </div>
    </div>
  );
};

export default RoomFilters;