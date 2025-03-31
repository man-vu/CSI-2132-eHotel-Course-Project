import prisma from "./prisma";
import { getObject, modelSchema } from "../utils/helpers";
import bcrypt from "bcryptjs";

// Create a new employee
export const createEmployee = async (
  fullName: string,
  email: string,
  password: string,
  hotelID: number,
  address: string,
  ssn: string,
  role: string
) => {
  try {
    // Check if the email already exists
    const existingEmployee = await prisma.$queryRaw<{ exists: number }[]>`
      SELECT 1 as exists FROM Employee
      WHERE Email = ${email};
    `;

    if (existingEmployee.length > 0) {
      throw new Error("Email already exists.");
    }

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Find the next available EmployeeID
    const nextEmployeeIDResult = await prisma.$queryRaw<{ nextID: number }[]>`
      SELECT COALESCE(MAX(EmployeeID), 0) + 1 as "nextID" FROM Employee;
    `;
    const nextEmployeeID = nextEmployeeIDResult[0]?.nextID;

    if (!nextEmployeeID) {
      throw new Error("Failed to determine the next EmployeeID.");
    }

    // Insert into Employee table
    const employee: any = await prisma.$queryRaw`
      INSERT INTO Employee (EmployeeID, FullName, Email, Password, HotelID, Address, SSN, Role)
      VALUES (${nextEmployeeID}, ${fullName}, ${email}, ${hashedPassword}, ${hotelID}, ${address}, ${ssn}, ${role})
      RETURNING EmployeeID as "EmployeeID";
    `;

    const employeeID = employee[0]?.EmployeeID;

    if (!employeeID) {
      throw new Error("Failed to create employee.");
    }

    return employeeID;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw new Error("Failed to create employee. Please try again.");
  }
};

export const getEmployees = async (filters?: { employeeID?: number; email?: string }) => {
  // Build WHERE conditions dynamically
  let whereConditions: string[] = [];

  if (filters?.employeeID) {
    whereConditions.push(`e.EmployeeID = ${filters.employeeID}`);
  }
  if (filters?.email) {
    whereConditions.push(`ci.ContactValue = '${filters.email}'`);
  }

  // If no conditions, fetch all employees
  const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // Construct query dynamically using modelSchema
  const query = `
    SELECT 
      ${modelSchema.Employee.map((field) => 
        field === "HireDate" 
          ? `CAST(e.${field} AS TEXT) as "Employee.${field}"` 
          : `e.${field} as "Employee.${field}"`
      ).join(", ")},
      ci.ContactValue as "Employee.Email",
      ai.Address as "Employee.Address"
    FROM Employee e
    LEFT JOIN ContactInfo ci
      ON ci.EntityID = e.EmployeeID AND ci.EntityType = 'Employee' AND ci.ContactType = 'Email'
    LEFT JOIN AddressInfo ai
      ON ai.EntityID = e.EmployeeID AND ai.EntityType = 'Employee'
    ${whereClause};
  `;

  const employees: any[] = await prisma.$queryRawUnsafe(query);

  if (!employees || employees.length === 0) {
    return filters?.employeeID ? null : [];
  }

  return employees.map((employee) => getObject(employee, "Employee"));
};


// Update an employee
export const updateEmployee = async (
  employeeID: number,
  fullName?: string,
  email?: string,
  password?: string,
  hotelID?: number,
  address?: string,
  ssn?: string,
  role?: string
) => {
  let hashedPassword;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Update Employee table
  await prisma.$executeRaw`
    UPDATE Employee
    SET 
      FullName = COALESCE(${fullName}, FullName),
      Password = COALESCE(${hashedPassword}, Password),
      HotelID = COALESCE(${hotelID}, HotelID),
      SSN = COALESCE(${ssn}, SSN),
      Role = COALESCE(${role}, Role)
    WHERE EmployeeID = ${employeeID};
  `;

  // Update or insert into AddressInfo
  if (address) {
    await prisma.$executeRaw`
      INSERT INTO AddressInfo (EntityID, EntityType, Address, AddressType)
      VALUES (${employeeID}, 'Employee', ${address}, 'Home')
      ON CONFLICT (EntityID, EntityType, AddressType)
      DO UPDATE SET Address = ${address};
    `;
  }

  // Update or insert into ContactInfo
  if (email) {
    await prisma.$executeRaw`
      INSERT INTO ContactInfo (EntityID, EntityType, ContactType, ContactValue)
      VALUES (${employeeID}, 'Employee', 'Email', ${email})
      ON CONFLICT (EntityID, EntityType, ContactType)
      DO UPDATE SET ContactValue = ${email};
    `;
  }
};

// Delete an employee
export const deleteEmployee = async (employeeID: number) => {
  try {
    // Delete associated AddressInfo and ContactInfo entries first
    await prisma.$executeRaw`
      DELETE FROM AddressInfo WHERE EntityID = ${employeeID} AND EntityType = 'Employee';
    `;
    await prisma.$executeRaw`
      DELETE FROM ContactInfo WHERE EntityID = ${employeeID} AND EntityType = 'Employee';
    `;

    // Delete the employee from the Employee table
    return await prisma.$executeRaw`
      DELETE FROM Employee WHERE EmployeeID = ${employeeID};
    `;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw new Error("Failed to delete employee. Please try again.");
  }
};
