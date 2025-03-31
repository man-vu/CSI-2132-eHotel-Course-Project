"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEmployee = exports.requireCustomer = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(403).json({ error: "Unauthorized" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};
exports.verifyToken = verifyToken;
// Middleware to allow only Customers
const requireCustomer = (req, res, next) => {
    if (!req.user || req.user.role !== "customer") {
        res.status(403).json({ error: "Forbidden: Customers only" });
        return;
    }
    next();
};
exports.requireCustomer = requireCustomer;
// Middleware to allow only Employees
const requireEmployee = (req, res, next) => {
    if (!req.user || req.user.role !== "employee") {
        res.status(403).json({ error: "Forbidden: Employees only" });
        return;
    }
    next();
};
exports.requireEmployee = requireEmployee;
