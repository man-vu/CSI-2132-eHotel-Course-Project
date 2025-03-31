import prisma from "./prisma";
import { getObject, modelSchema } from "../utils/helpers";

export const getRentings = async (filters?: { rentingID?: number; customerID?: number; hotelID?: number }) => {
  // Build WHERE conditions dynamically
  let whereConditions: string[] = [];

  if (filters?.rentingID) {
    whereConditions.push(`r.RentingID = ${filters.rentingID}`);
  }
  if (filters?.customerID) {
    whereConditions.push(`r.CustomerID = ${filters.customerID}`);
  }
  if (filters?.hotelID) {
    whereConditions.push(`r.HotelID = ${filters.hotelID}`);
  }

  // If no conditions, fetch all rentings
  const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // Construct query dynamically using modelSchema
  const query = `
    SELECT 
      ${modelSchema.Renting.map((field) => `r.${field} as "Renting.${field}"`).join(", ")},
      ${modelSchema.Customer.map((field) => `c.${field} as "Customer.${field}"`).join(", ")},
      ${modelSchema.Room.map((field) => `ro.${field} as "Room.${field}"`).join(", ")},
      ${modelSchema.Hotel.map((field) => `h.${field} as "Hotel.${field}"`).join(", ")},
      ci.ContactValue as "ContactValue",
  
      COALESCE(SUM(t.Amount), 0) AS "Renting.TotalPaid",
      CASE WHEN COALESCE(SUM(t.Amount), 0) >= ro.Price THEN true ELSE false END AS "Renting.isPaidInFull",
      ro.Price - COALESCE(SUM(t.Amount), 0) AS "Renting.RemainingAmount"
    FROM Renting r
    LEFT JOIN Customer c ON r.CustomerID = c.CustomerID
    LEFT JOIN Room ro ON r.RoomID = ro.RoomID AND r.HotelID = ro.HotelID
    LEFT JOIN Hotel h ON r.HotelID = h.HotelID
    LEFT JOIN Transaction t ON r.RentingID = t.RentingID
    LEFT JOIN ContactInfo ci ON c.CustomerID = ci.EntityID
    ${whereClause}
    AND ci.entitytype = 'Customer' AND ci.contacttype = 'Email'
    GROUP BY r.RentingID, c.CustomerID, ro.RoomID, ro.HotelID, h.HotelID, ci.ContactValue
    ORDER BY r.RentingID;
  `;

  const rentings: any[] = await prisma.$queryRawUnsafe(query);

  if (!rentings || rentings.length === 0) {
    return filters?.rentingID ? null : [];
  }

  return rentings.map((renting) => {
    const rentingObject = getObject(renting, "Renting");
    const customerObject = getObject(renting, "Customer");
    const roomObject = getObject(renting, "Room");
    const hotelObject = getObject(renting, "Hotel");

    return {
      ...rentingObject,
      Customer: { ...customerObject, Email: renting.ContactValue },
      Room: roomObject,
      Hotel: hotelObject,
      TotalPaid: rentingObject.TotalPaid ? Math.max(Number(rentingObject.TotalPaid), 0) : 0,
      isPaidInFull: rentingObject.isPaidInFull,
      RemainingAmount: rentingObject.RemainingAmount ? Math.max(Number(rentingObject.RemainingAmount), 0) : 0
    };
  });
};



export const createRenting = async (
  customerID: number,
  roomID: number,
  hotelID: number,
  handledBy: number,
  duration: number,
  rentDate: string
) => {
  try {
    const query = `
      INSERT INTO Renting (CustomerID, RoomID, HotelID, RentDate, Duration, HandledBy, IsArchived)
      VALUES (${customerID}, ${roomID}, ${hotelID}, '${rentDate}'::DATE, ${duration}, ${handledBy}, false)
      RETURNING *;
  `;  
    const result = await prisma.$queryRawUnsafe(query);
    return result;
  } catch (error) {
    console.error("Error creating renting:", error);
    throw new Error("Failed to create renting. Please try again.");
  }
};

export const checkOutRenting = async (rentingID: number) => {
  const result = await prisma.$queryRaw`
    UPDATE Renting
    SET IsArchived = true
    WHERE RentingID = ${rentingID}
    RETURNING *;
  `;
  
  return result;
};

export const createTransaction = async (
  customerID: string,
  rentingID: number,
  amount: number,
  paymentMethod: string
) => {
  const rentingQuery = `
    SELECT 
      r.RentingID, 
      ro.Price - COALESCE(SUM(t.Amount), 0) AS "RemainingAmount"
    FROM Renting r
    LEFT JOIN Room ro ON r.RoomID = ro.RoomID AND r.HotelID = ro.HotelID
    LEFT JOIN Transaction t ON r.RentingID = t.RentingID
    WHERE r.RentingID = ${rentingID}
    GROUP BY r.RentingID, ro.Price;
  `;
  const renting: any[] = await prisma.$queryRawUnsafe(rentingQuery);

  if (!renting || renting.length === 0) {
    throw new Error(`Renting with ID ${rentingID} does not exist.`);
  }

  const remainingAmount = parseInt(renting[0].RemainingAmount, 10);

  if (amount > remainingAmount) {
    throw new Error(`Payment exceeds the remaining amount of ${remainingAmount}.`);
  }

  const transactionQuery = `
    INSERT INTO Transaction (CustomerID, RentingID, Amount, PaymentMethod, PaymentDate)
    VALUES (${customerID}, ${rentingID}, ${amount}, '${paymentMethod}', NOW())
    RETURNING *;
  `;
  const result = await prisma.$queryRawUnsafe(transactionQuery);
  return result;
};
