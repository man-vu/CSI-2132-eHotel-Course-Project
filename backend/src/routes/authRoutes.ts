import express, { Request, Response } from "express";
import { registerCustomer, registerEmployee, loginUser, generateToken } from "../services/authService";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import prisma from "../services/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const router = express.Router();
router.use(cookieParser());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Register Customer
router.post("/register/customer", [
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("idType").notEmpty(),
  body("idNumber").notEmpty()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
     return;
  }

  try {
    const { name, email, password, address, idType, idNumber } = req.body;
    const customer = await registerCustomer(name, email, password, address, idType, idNumber);
    const token = generateToken((customer as any).EmployeeID, "employee");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

     res.status(201).json({ message: "Customer registered successfully", customer });
  } catch (err: any) {
     res.status(500).json({ error: err.message });
  }
});

// Register Employee
router.post("/register/employee", [
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("idNumber").notEmpty(),
  body("role").notEmpty(),
  body("hotelID").isInt(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
    return
  }

  try {
    const { name, email, password, address, idNumber, role, hotelID } = req.body;
    const employee = await registerEmployee(name, email, password, address, idNumber, role, hotelID);
    const token = generateToken((employee as any).EmployeeID, "employee");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

     res.status(201).json({ message: "Employee registered successfully", employee });
  } catch (err: any) {
     res.status(500).json({ error: err.message });
  }
});

// Login User & Store JWT in HttpOnly Cookie
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const token = await loginUser(email, password, role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Check Login Status
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

    let user: { FullName: string }[] | null;
    if (decoded.role === "customer") {
      user = await prisma.$queryRaw<{ FullName: string }[]>`SELECT fullname as "FullName" FROM Customer WHERE CustomerID = ${decoded.userId}`;
    } else {
      user = await prisma.$queryRaw<{ FullName: string }[]>`SELECT fullname as "FullName" FROM Employee WHERE EmployeeID = ${decoded.userId}`;
    }

    if (!user || user.length === 0) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json({ userId: decoded.userId, role: decoded.role, fullName: user[0].FullName });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout (Clear Cookie)
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;
