import prisma from "./prisma";
import { getObject, modelSchema } from "../utils/helpers";

// Create a new hotel
export const createHotel = async (
  chainID: number,
  name: string,
  address: string,
  starRating: number,
  email: string,
  phone: string
) => {
  const maxHotelIDResult: any = await prisma.$queryRaw`
    SELECT MAX(HotelID) AS "maxHotelID" FROM Hotel
  `;

  const newHotelID = ((maxHotelIDResult[0]?.maxHotelID) || 0) + 1;

  return await prisma.$queryRaw`
    INSERT INTO hotel (hotelid, chainid, name, address, starrating, email, phone, numberofrooms)
    VALUES (${newHotelID}, ${chainID}, ${name}, ${address}, ${starRating}, ${email}, ${phone}, 0)
  `;
};

// Get hotels (all or by specific ID) with address, email, and phone
export const getHotels = async (hotelID?: number) => {
  const hotelFields = modelSchema["Hotel"].join(", ");
  const whereClause = hotelID ? `WHERE h.HotelID = ${hotelID}` : "";

  return await prisma.$queryRawUnsafe(`
    SELECT 
      ${hotelFields.split(", ").map(field => `h.${field} AS "${field}"`).join(", ")},
      ai.Address as "Address",
      MAX(CASE WHEN ci.ContactType = 'Email' THEN ci.ContactValue END) AS "Email",
      MAX(CASE WHEN ci.ContactType = 'Phone' THEN ci.ContactValue END) AS "Phone"
    FROM Hotel h
    LEFT JOIN AddressInfo ai
      ON ai.EntityID = h.HotelID AND ai.EntityType = 'Hotel'
    LEFT JOIN ContactInfo ci
      ON ci.EntityID = h.HotelID AND ci.EntityType = 'Hotel'
    ${whereClause}
    GROUP BY h.HotelID, ai.Address;
  `);
};


// Fetch rooms for a specific hotel
export const getRoomsByHotelId = async (hotelID: number) => {
  const roomFields = modelSchema["Room"].join(", ");
  return await prisma.$queryRawUnsafe(`
    SELECT ${roomFields.split(", ").map(field => `${field} AS "${field}"`).join(", ")} 
    FROM Room 
    WHERE HotelID = ${hotelID};
  `);
};

// Update a hotel
export const updateHotel = async (
  hotelID: number,
  name?: string,
  address?: string,
  starRating?: number,
  email?: string,
  phone?: string,
  numberOfRooms?: number
) => {
  return await prisma.$transaction(async (prisma) => {
    // Update Hotel table
    await prisma.$executeRaw`
      UPDATE Hotel
      SET 
        Name = ${name},
        StarRating = ${starRating},
        NumberOfRooms = ${numberOfRooms}
      WHERE HotelID = ${hotelID};
    `;

    // Update or insert into AddressInfo
    if (address) {
      await prisma.$executeRaw`
        INSERT INTO AddressInfo (EntityID, EntityType, Address, AddressType)
        VALUES (${hotelID}, 'Hotel', ${address}, 'Main')
        ON CONFLICT (EntityID, EntityType, AddressType)
        DO UPDATE SET Address = ${address};
      `;
    }

    // Update or insert into ContactInfo for Email
    if (email) {
      await prisma.$executeRaw`
        INSERT INTO ContactInfo (EntityID, EntityType, ContactType, ContactValue)
        VALUES (${hotelID}, 'Hotel', 'Email', ${email})
        ON CONFLICT (EntityID, EntityType, ContactType)
        DO UPDATE SET ContactValue = ${email};
      `;
    }

    // Update or insert into ContactInfo for Phone
    if (phone) {
      await prisma.$executeRaw`
        INSERT INTO ContactInfo (EntityID, EntityType, ContactType, ContactValue)
        VALUES (${hotelID}, 'Hotel', 'Phone', ${phone})
        ON CONFLICT (EntityID, EntityType, ContactType)
        DO UPDATE SET ContactValue = ${phone};
      `;
    }

    return { HotelID: hotelID, Name: name, Address: address, StarRating: starRating, Email: email, Phone: phone, NumberOfRooms: numberOfRooms };
  });
};

// Delete a hotel atomically
export const deleteHotel = async (hotelID: number) => {
  return await prisma.$transaction(async (prisma) => {
    // Delete associated AddressInfo and ContactInfo entries first
    await prisma.$executeRaw`
      DELETE FROM AddressInfo WHERE EntityID = ${hotelID} AND EntityType = 'Hotel';
    `;
    await prisma.$executeRaw`
      DELETE FROM ContactInfo WHERE EntityID = ${hotelID} AND EntityType = 'Hotel';
    `;

    // Delete the hotel from the Hotel table
    await prisma.$executeRaw`
      DELETE FROM Hotel WHERE HotelID = ${hotelID};
    `;

    return { HotelID: hotelID };
  });
};
