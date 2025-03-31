import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "./prisma";
import { getObject, modelSchema } from "../utils/helpers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Generate JWT Token
export const generateToken = (userId: number, role: string) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
};

// Register Customer
export const registerCustomer = async (name: string, email: string, password: string, address: string, idType: string, idNumber: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.$queryRaw`
    INSERT INTO Customer (FullName, Password, Address, IDType, IDNumber, RegistrationDate)
    VALUES (${name}, ${hashedPassword}, ${address}, ${idType}, ${idNumber}, ${new Date()})
    RETURNING *;
  `;
};

// Register Employee
export const registerEmployee = async (name: string, email: string, password: string, address: string, ssn: string, role: string, hotelID: number) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.$queryRaw`
    INSERT INTO Employee (FullName, Password, Address, SSN, Role, HotelID)
    VALUES (${name}, ${hashedPassword}, ${address}, ${ssn}, ${role}, ${hotelID})
    RETURNING *;
  `;
};

// Login User
export const loginUser = async (email: string, password: string, role: "customer" | "employee") => {
  // Try Customer first
  let user: { [key: string]: any }[] = await prisma.$queryRawUnsafe(`
    SELECT 
      ${modelSchema.Customer.map((field) => `c.${field} AS "${field}"`).join(", ")},
      ${modelSchema.ContactInfo.map((field) => `ci.${field} AS "ContactInfo.${field}"`).join(", ")}
    FROM Customer c
    JOIN ContactInfo ci ON ci.EntityID = c.CustomerID AND ci.EntityType = 'Customer'
    WHERE ci.ContactType = 'Email' AND ci.ContactValue = '${email}';
  `);

  if (user[0]?.Password && await bcrypt.compare(password, user[0].Password)) {
    return generateToken(user[0].CustomerID, "customer");
  }

  // If not customer, try Employee
  user = await prisma.$queryRawUnsafe(`
    SELECT 
      ${modelSchema.Employee.map((field) => `e.${field} AS "${field}"`).join(", ")},
      ${modelSchema.ContactInfo.map((field) => `ci.${field} AS "ContactInfo.${field}"`).join(", ")}
    FROM Employee e
    JOIN ContactInfo ci ON ci.EntityID = e.EmployeeID AND ci.EntityType = 'Employee'
    WHERE ci.ContactType = 'Email' AND ci.ContactValue = '${email}';
  `);

  if (user[0]?.Password && await bcrypt.compare(password, user[0].Password)) {
    return generateToken(user[0].EmployeeID, "employee");
  }

  // If neither match
  throw new Error("Invalid email or password");
};


