"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authService_1 = require("../services/authService");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: true }));
// Register Customer
router.post("/register/customer", [
    (0, express_validator_1.body)("name").notEmpty(),
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)("password").isLength({ min: 6 }),
    (0, express_validator_1.body)("idType").notEmpty(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { name, email, password, address, idType } = req.body;
        const customer = yield (0, authService_1.registerCustomer)(name, email, password, address, idType);
        res.status(201).json({ message: "Customer registered successfully", customer });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Register Employee
router.post("/register/employee", [
    (0, express_validator_1.body)("name").notEmpty(),
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)("password").isLength({ min: 6 }),
    (0, express_validator_1.body)("ssn").notEmpty(),
    (0, express_validator_1.body)("role").notEmpty(),
    (0, express_validator_1.body)("hotelID").isInt(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        res.status(400).json({ errors: errors.array() });
    try {
        const { name, email, password, address, ssn, role, hotelID } = req.body;
        const employee = yield (0, authService_1.registerEmployee)(name, email, password, address, ssn, role, hotelID);
        res.status(201).json({ message: "Employee registered successfully", employee });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Login User & Store JWT in HttpOnly Cookie
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role } = req.body;
        const token = yield (0, authService_1.loginUser)(email, password, role);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({ message: "Login successful" });
    }
    catch (err) {
        res.status(401).json({ error: "Invalid credentials" });
    }
}));
// Check Login Status
router.get("/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        res.json({ userId: decoded.userId, role: decoded.role });
    }
    catch (_a) {
        res.status(401).json({ error: "Invalid token" });
    }
});
// Logout (Clear Cookie)
router.post("/logout", (_req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});
exports.default = router;
