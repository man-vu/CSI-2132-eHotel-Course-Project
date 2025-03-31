import prisma from "./prisma";
import { getObject, modelSchema } from "../utils/helpers";

// Create a new room
export const createRoom = async (
  hotelID: number,
  price: number,
  capacity: 'Single' | 'Double' | 'Suite',
  amenities: string,
  viewType: string,
  isExtendable: boolean,
  damageDescription: string
) => {
  const maxRoom = await prisma.$queryRaw<
    { RoomID: number }[]
  >`SELECT MAX(RoomID) + 1 as "RoomID" FROM Room WHERE HotelID = ${hotelID}`;

  const newRoomID = (maxRoom[0]?.RoomID || 0);

  return await prisma.$queryRaw`
    INSERT INTO Room (RoomID, HotelID, Price, Capacity, Amenities, ViewType, IsExtendable, DamageDescription)
    VALUES (${newRoomID}, ${hotelID}, ${price}, ${capacity}, ${amenities}, ${viewType}, ${isExtendable}, ${damageDescription})
    RETURNING RoomID as "RoomID"
  `;
};

// Get all rooms
export const getAllRooms = async () => {
  return await prisma.$queryRaw`SELECT * FROM Room`;
};

// Get a room by ID
export const getRoomById = async (roomID: number) => {
  return await prisma.$queryRaw`
    SELECT * FROM Room WHERE RoomID = ${roomID}
  `;
};


// Fetch available rooms per area
export const getAvailableRoomsByArea = async () => {
  return await prisma.$queryRaw<
    { area: string; totalAvailableRooms: number }[]
  >`SELECT * FROM AvailableRoomsByArea`;
};

// Fetch aggregated room capacity per hotel with hotel information
export const getAggregatedRoomCapacity = async () => {
  return await prisma.$queryRaw<
    { hotelID: number; hotelName: string; totalCapacity: number; address: string; starRating: number }[]
  >`
    SELECT h.HotelID as hotelID, h.Name as hotelName, arc.hoteladdress as address, h.StarRating as starRating, arc.totalCapacity
    FROM AggregatedRoomCapacity arc
    JOIN Hotel h ON arc.HotelID = h.HotelID
    ORDER BY h.HotelID
  `;
};

// Update a room
export const updateRoom = async (
  roomID: number,
  price?: number,
  capacity?: string,
  amenities?: string,
  viewType?: string,
  isExtendable?: boolean,
  damageDescription?: string
) => {
  return await prisma.$queryRaw`
    UPDATE room
    SET 
      price = ${price ?? 0},
      capacity = ${capacity ?? ''},
      amenities = ${amenities ?? ''},
      viewtype = ${viewType ?? ''},
      isExtendable = ${isExtendable ?? false},
      damageDescription = ${damageDescription ?? ''}
    WHERE RoomID = ${roomID}
  `;
};

// Delete a room
export const deleteRoom = async (roomID: number) => {
  return await prisma.$queryRaw`
    DELETE FROM Room WHERE RoomID = ${roomID}
  `;
};
export const getFilteredRooms = async (filters: any) => {
  let whereConditions: string[] = [];

  // 1) Capacity
  if (filters.capacity) {
    whereConditions.push(`r.Capacity = '${filters.capacity}'`);
  }

  // 2) Price Range
  if (filters.minPrice) {
    whereConditions.push(`r.Price >= ${filters.minPrice}`);
  }
  if (filters.maxPrice) {
    whereConditions.push(`r.Price <= ${filters.maxPrice}`);
  }

  // 3) Area / Address
  if (filters.area) {
    whereConditions.push(`ai.Address LIKE '%${filters.area}%'`);
  }

  // 4) Hotel Chain
  if (filters.hotelChain) {
    whereConditions.push(`h.ChainID = ${Number(filters.hotelChain)}`);
  }

  // 5) Star Rating
  if (filters.starRating) {
    whereConditions.push(`h.StarRating = ${Number(filters.starRating)}`);
  }

  // 6) Number of Rooms
  if (filters.numberOfRooms) {
    whereConditions.push(`h.NumberOfRooms >= ${Number(filters.numberOfRooms)}`);
  }

  // 7) Availability (startDate & endDate)
  const parseDate = (date: any) => {
    if (!date) return null;
    if (typeof date === "string") return date.split("T")[0]; // Extract YYYY-MM-DD
    if (date instanceof Date) return date.toISOString().split("T")[0]; // Convert Date to string
    return null;
  };

  const startDate = parseDate(filters.startDate);
  const endDate = parseDate(filters.endDate);

  whereConditions.push(`
    NOT EXISTS (
      SELECT 1 FROM Booking b
      WHERE b.RoomID = r.RoomID AND b.HotelID = r.HotelID
      AND b.IsArchived = FALSE
    )
  `);

  whereConditions.push(`
    NOT EXISTS (
      SELECT 1 FROM Renting rent
      WHERE rent.RoomID = r.RoomID AND rent.HotelID = r.HotelID
    )
  `);

  if (startDate && endDate) {
    whereConditions.push(`
      NOT EXISTS (
        SELECT 1 FROM Booking b
        WHERE b.RoomID = r.RoomID AND b.HotelID = r.HotelID
        AND b.IsArchived = FALSE
        AND b.StartDate <= '${endDate}'
        AND b.EndDate >= '${startDate}'
      )
    `);

    whereConditions.push(`
      NOT EXISTS (
        SELECT 1 FROM Renting rent
        WHERE rent.RoomID = r.RoomID AND b.HotelID = r.HotelID
        AND rent.RentDate <= '${endDate}'
        AND (rent.RentDate + INTERVAL '1 day' * rent.Duration) >= '${startDate}'
      )
    `);
  }

  // Build the WHERE clause dynamically
  const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // Construct the query
  const query = `
    SELECT
      ${modelSchema.Room.map((field) => `r.${field} AS "${field}"`).join(", ")},
      ${modelSchema.Hotel.map((field) => `h.${field} AS "Hotel.${field}"`).join(", ")},
      ai.Address as "Hotel.Address",
      MAX(CASE WHEN ci.ContactType = 'Email' THEN ci.ContactValue END) AS "Hotel.Email",
      MAX(CASE WHEN ci.ContactType = 'Phone' THEN ci.ContactValue END) AS "Hotel.Phone"
    FROM Room r
    JOIN Hotel h ON r.HotelID = h.HotelID
    LEFT JOIN AddressInfo ai
      ON ai.EntityID = h.HotelID AND ai.EntityType = 'Hotel'
    LEFT JOIN ContactInfo ci
      ON ci.EntityID = h.HotelID AND ci.EntityType = 'Hotel'
    ${whereClause}
    GROUP BY r.RoomID, r.HotelID, ${modelSchema.Hotel.map((field) => `h.${field}`).join(", ")}, ai.Address
  `;

  // Execute the raw query
  const results: any = await prisma.$queryRawUnsafe(query);

  // Map the Hotel fields into a nested "Hotel" object
  return results.map((room: any) => ({
    ...room,
    Hotel: getObject(room, "Hotel"),
  }));
};
