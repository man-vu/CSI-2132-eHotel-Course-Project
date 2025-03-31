import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { getObject, modelSchema } from "../utils/helpers";

// Create a new customer
export const createCustomer = async (
  fullName: string,
  email: string,
  password: string,
  address: string,
  idType: string,
  idNumber: string
) => {
  try {
    // Check if the email already exists
    const existingCustomer = await prisma.$queryRaw<{ exists: number }[]>`
      SELECT 1 as exists FROM ContactInfo
      WHERE ContactValue = ${email} AND EntityType = 'Customer' AND ContactType = 'Email';
    `;

    if (existingCustomer.length > 0) {
      throw new Error("Email already exists.");
    }

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Find the next available CustomerID
    const nextCustomerIDResult = await prisma.$queryRaw<{ nextID: number }[]>`
      SELECT COALESCE(MAX(CustomerID), 0) + 1 as "nextID" FROM Customer;
    `;
    const nextCustomerID = nextCustomerIDResult[0]?.nextID;

    if (!nextCustomerID) {
      throw new Error("Failed to determine the next CustomerID.");
    }

    // Use a transaction to ensure atomicity
    const customerID = await prisma.$transaction(async (prisma) => {
      // Insert into Customer table
      const customer: any = await prisma.$queryRaw`
      INSERT INTO Customer (CustomerID, FullName, IDType, IDNumber, Password, RegistrationDate)
      VALUES (${nextCustomerID}, ${fullName}, ${idType}, ${idNumber}, ${hashedPassword}, ${new Date()})
      RETURNING CustomerID as "CustomerID";
      `;

      const customerID = customer[0]?.CustomerID;

      if (!customerID) {
      throw new Error("Failed to create customer.");
      }

      // Insert into AddressInfo
      await prisma.$executeRaw`
      INSERT INTO AddressInfo (EntityID, EntityType, Address, AddressType)
      VALUES (${customerID}, 'Customer', ${address}, 'Home');
      `;

      // Insert into ContactInfo
      await prisma.$executeRaw`
      INSERT INTO ContactInfo (EntityID, EntityType, ContactType, ContactValue)
      VALUES (${customerID}, 'Customer', 'Email', ${email});
      `;

      return customerID;
    });

    return customerID;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error("Failed to create customer. Please try again.");
  }
};

export const getCustomers = async (filters?: { customerID?: number; email?: string }) => {
  // Build WHERE conditions dynamically
  let whereConditions: string[] = [];

  if (filters?.customerID) {
    whereConditions.push(`c.CustomerID = ${filters.customerID}`);
  }
  if (filters?.email) {
    whereConditions.push(`ci.ContactValue = '${filters.email}'`);
  }

  // If no conditions, fetch all customers
  const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // Construct query dynamically using modelSchema
  const query = `
    SELECT 
      ${modelSchema.Customer.map((field) => 
        field === "RegistrationDate" 
          ? `CAST(c.${field} AS TEXT) as "Customer.${field}"` 
          : `c.${field} as "Customer.${field}"`
      ).join(", ")},
      ci.ContactValue as "Customer.Email",
      ai.Address as "Customer.Address"
    FROM Customer c
    LEFT JOIN ContactInfo ci
      ON ci.EntityID = c.CustomerID AND ci.EntityType = 'Customer' AND ci.ContactType = 'Email'
    LEFT JOIN AddressInfo ai
      ON ai.EntityID = c.CustomerID AND ai.EntityType = 'Customer'
    ${whereClause};
  `;

  const customers: any[] = await prisma.$queryRawUnsafe(query);

  if (!customers || customers.length === 0) {
    return filters?.customerID ? null : [];
  }

  return customers.map((customer) => getObject(customer, "Customer"));
};


export const updateCustomer = async (
  customerID: number,
  fullName?: string,
  address?: string,
  idType?: string,
  idNumber?: string,
  email?: string,
  password?: string,
  registrationDate?: string
) => {
  await prisma.$transaction(async (prisma) => {
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update Customer table
    await prisma.$executeRaw`
      UPDATE Customer
      SET 
        FullName = ${fullName},
        IDType = ${idType},
        IDNumber = ${idNumber},
        Password = ${hashedPassword},
        RegistrationDate = ${registrationDate ? new Date(registrationDate) : undefined}
      WHERE CustomerID = ${customerID};
    `;

    // Update or insert into AddressInfo
    if (address) {
      await prisma.$executeRaw`
        INSERT INTO AddressInfo (EntityID, EntityType, Address, AddressType)
        VALUES (${customerID}, 'Customer', ${address}, 'Home')
        ON CONFLICT (EntityID, EntityType, AddressType)
        DO UPDATE SET Address = ${address};
      `;
    }

    // Update or insert into ContactInfo
    if (email) {
      await prisma.$executeRaw`
        INSERT INTO ContactInfo (EntityID, EntityType, ContactType, ContactValue)
        VALUES (${customerID}, 'Customer', 'Email', ${email})
        ON CONFLICT (EntityID, EntityType, ContactType)
        DO UPDATE SET ContactValue = ${email};
      `;
    }
  });
};


// Delete a customer
export const deleteCustomer = async (customerID: number) => {
  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (prisma) => {
    // Delete associated AddressInfo and ContactInfo entries first
    await prisma.$executeRaw`
      DELETE FROM AddressInfo WHERE EntityID = ${customerID} AND EntityType = 'Customer';
    `;
    await prisma.$executeRaw`
      DELETE FROM ContactInfo WHERE EntityID = ${customerID} AND EntityType = 'Customer';
    `;

    // Delete the customer from the Customer table
    await prisma.$executeRaw`
      DELETE FROM Customer WHERE CustomerID = ${customerID};
    `;
  });
};
