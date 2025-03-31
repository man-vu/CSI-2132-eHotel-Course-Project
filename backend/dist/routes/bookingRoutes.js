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
const bookingService_1 = require("../services/bookingService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Protect routes
router.use(authMiddleware_1.verifyToken);
// Create a booking
router.post("/", authMiddleware_1.requireCustomer, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerId, roomId, startDate, endDate } = req.body;
    if (!customerId || !roomId || !startDate || !endDate) {
        res.status(400).json({ error: "All fields are required." });
    }
    try {
        const booking = yield (0, bookingService_1.createBooking)(customerId, roomId, new Date(startDate), new Date(endDate));
        res.status(201).json({ message: "Booking successful", booking });
    }
    catch (err) {
        console.error("Error creating booking:", err);
        res.status(500).send("Server error");
    }
}));
// Get all bookings
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield (0, bookingService_1.getAllBookings)();
        res.json(bookings);
    }
    catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).send("Server error");
    }
}));
exports.default = router;
