import prisma from "./prisma";
import { getObject, modelSchema } from "../utils/helpers";

export const getHotelChains = async (filters?: { chainID?: number; name?: string; email?: string }) => {
  // Build WHERE conditions dynamically
  let whereConditions: string[] = [];

  if (filters?.chainID) {
    whereConditions.push(`hc.ChainID = ${filters.chainID}`);
  }
  if (filters?.name) {
    whereConditions.push(`hc.Name LIKE '%${filters.name}%'`);
  }
  if (filters?.email) {
    whereConditions.push(`hc.Email = '${filters.email}'`);
  }

  // If no conditions, fetch all hotel chains
  const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // Construct query dynamically using modelSchema
  const query = `
    SELECT 
      ${modelSchema.HotelChain.map((field) => `hc.${field} as "HotelChain.${field}"`).join(", ")}
    FROM HotelChain hc
    ${whereClause};
  `;

  const hotelChains: any[] = await prisma.$queryRawUnsafe(query);

  if (!hotelChains || hotelChains.length === 0) {
    return filters?.chainID ? null : [];
  }

  return hotelChains.map((chain) => getObject(chain, "HotelChain"));
};
