import prisma from "./prisma";
import { getObject, modelSchema } from "../utils/helpers";

export const getBookings = async (filter?: { bookingID?: number; customerID?: number; hotelID?: number; activeOnly?: boolean }) => {
  // Determine the WHERE condition based on the provided filter
  let whereConditions: string[] = [];
  
  if (filter?.bookingID) {
    whereConditions.push(`b.BookingID = ${filter.bookingID}`);
  }
  if (filter?.customerID) {
    whereConditions.push(`b.CustomerID = ${filter.customerID}`);
  }
  if (filter?.hotelID) {
    whereConditions.push(`b.HotelID = ${filter.hotelID}`);
  }
  if (filter?.activeOnly) {
    whereConditions.push(`b.IsArchived = false`);
  }

  // If no conditions are provided, fetch all bookings
  const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // Construct the dynamic SELECT query using modelSchema
  const query = `
    SELECT 
      ${modelSchema.Booking.map((field) => `b.${field} as "Booking.${field}"`).join(", ")},
      ${modelSchema.Customer.map((field) => `c.${field} as "Customer.${field}"`).join(", ")},
      ${modelSchema.Room.map((field) => `r.${field} as "Room.${field}"`).join(", ")},
      ${modelSchema.Hotel.map((field) => `h.${field} as "Hotel.${field}"`).join(", ")},
      COALESCE(ci.ContactValue, '') as "ContactValue"
    FROM Booking b
    
    LEFT JOIN Hotel h    ON b.HotelID = h.HotelID
    LEFT JOIN Room r     ON b.RoomID = r.RoomID AND b.HotelID = r.HotelID
    LEFT JOIN Customer c ON b.CustomerID = c.CustomerID
    LEFT JOIN ContactInfo ci ON c.CustomerID = ci.EntityID AND ci.EntityType = 'Customer'
    ${whereClause}
  `;

  const bookings: any[] = await prisma.$queryRawUnsafe(query);

  if (!bookings || bookings.length === 0) {
    return filter?.bookingID ? null : [];
  }

  return bookings.map((booking) => {
    const bookingObject = getObject(booking, "Booking");
    const customerObject = getObject(booking, "Customer");
    const roomObject = getObject(booking, "Room");
    const hotelObject = getObject(booking, "Hotel");

    return {
      BookingID: bookingObject.BookingID,
      CustomerID: customerObject?.CustomerID,
      RoomID: roomObject?.RoomID,
      HotelID: hotelObject?.HotelID,
      StartDate: bookingObject.StartDate,
      EndDate: bookingObject.EndDate,
      Booking: bookingObject,
      Customer: { ...customerObject, Email: booking.ContactValue },
      Room: roomObject,
      Hotel: hotelObject,
    };
  });
};

export const createBooking = async (
  customerID: number,
  roomID: number,
  hotelID: number,
  startDate: string,
  endDate: string
) => {
  const customer = await prisma.$queryRaw<any[]>`
    SELECT * FROM Customer WHERE CustomerID = ${customerID}
  `;

  if (customer.length === 0) {
    throw new Error(`Customer with ID ${customerID} does not exist.`);
  }

  return await prisma.$queryRaw`
    INSERT INTO Booking (CustomerID, RoomID, HotelID, BookingDate, StartDate, EndDate, IsArchived)
    VALUES (${customerID}, ${roomID}, ${hotelID}, ${new Date()}, ${startDate}::DATE, ${endDate}::DATE, false)
  `;
};

export const createRenting = async (
  customerID: number,
  roomID: number,
  hotelID: number,
  handledBy: number,
  duration: number,
  bookingID: number,
  startDate: string
) => {
  const customer = await prisma.$queryRaw<any[]>`
    SELECT * FROM Customer WHERE CustomerID = ${customerID}
  `;

  if (!customer.length) {
    throw new Error(`Customer with ID ${customerID} does not exist.`);
  }

  const startDateString = new Date(startDate).toLocaleDateString("en-CA", { timeZone: "UTC" })


  const renting = await prisma.$queryRaw<any[]>`
    INSERT INTO Renting (CustomerID, RoomID, HotelID, RentDate, Duration, HandledBy, IsArchived)
    VALUES (${customerID}, ${roomID}, ${hotelID}, ${startDateString}::DATE, ${duration}, ${handledBy}, false)
    RETURNING *
  `;

  const updateResult = await prisma.$executeRaw`
    UPDATE Booking SET IsArchived = true WHERE BookingID = ${bookingID}
  `;

  if (updateResult === 0) {
    throw new Error(`Failed to archive Booking with ID ${bookingID}.`);
  }

  return renting;
};