import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Extend Request type to include user property
interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

// Middleware to verify JWT token
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies.token;

  if (!token) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Middleware to allow only Customers
export const requireCustomer = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "customer") {
    res.status(403).json({ error: "Forbidden: Customers only" });
    return;
  }
  next();
};

// Middleware to allow only Employees
export const requireEmployee = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "employee") {
    res.status(403).json({ error: "Forbidden: Employees only" });
    return;
  }
  next();
};
