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
const roomService_1 = require("../services/roomService");
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {};
        if (req.query.startDate)
            filters.startDate = new Date(req.query.startDate);
        if (req.query.endDate)
            filters.endDate = new Date(req.query.endDate);
        if (req.query.capacity)
            filters.capacity = req.query.capacity;
        if (req.query.area)
            filters.area = req.query.area;
        if (req.query.hotelChain)
            filters.hotelChain = req.query.hotelChain;
        if (req.query.category)
            filters.starRating = parseInt(req.query.category);
        if (req.query.totalRooms)
            filters.numberOfRooms = parseInt(req.query.totalRooms);
        if (req.query.minPrice)
            filters.minPrice = parseFloat(req.query.minPrice);
        if (req.query.maxPrice)
            filters.maxPrice = parseFloat(req.query.maxPrice);
        const rooms = yield (0, roomService_1.getFilteredRooms)(filters);
        res.json(rooms);
    }
    catch (err) {
        console.error("Error fetching rooms with filters:", err);
        res.status(500).send("Server error");
    }
}));
// Get a specific room by ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomID = parseInt(req.params.id);
        const room = yield (0, roomService_1.getRoomById)(roomID);
        if (!room) {
            res.status(404).json({ message: "Room not found" });
        }
        res.json(room);
    }
    catch (err) {
        console.error("Error fetching room:", err);
        res.status(500).send("Server error");
    }
}));
// Create a new room
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelID, price, capacity, amenities, viewType, isExtendable, damageDescription } = req.body;
    if (!hotelID || !price || !capacity || !isExtendable) {
        res.status(400).json({ error: "Required fields are missing" });
    }
    try {
        const room = yield (0, roomService_1.createRoom)(hotelID, price, capacity, amenities, viewType, isExtendable, damageDescription);
        res.status(201).json({ message: "Room created successfully", room });
    }
    catch (err) {
        console.error("Error creating room:", err);
        res.status(500).send("Server error");
    }
}));
// Update a room
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomID = parseInt(req.params.id);
    const { price, capacity, amenities, viewType, isExtendable, damageDescription } = req.body;
    try {
        const updatedRoom = yield (0, roomService_1.updateRoom)(roomID, price, capacity, amenities, viewType, isExtendable, damageDescription);
        res.json({ message: "Room updated successfully", updatedRoom });
    }
    catch (err) {
        console.error("Error updating room:", err);
        res.status(500).send("Server error");
    }
}));
// Delete a room
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, roomService_1.deleteRoom)(parseInt(req.params.id));
        res.json({ message: "Room deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting room:", err);
        res.status(500).send("Server error");
    }
}));
// Get available rooms per area (from view)
router.get("/views/available-rooms", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, roomService_1.getAvailableRoomsByArea)();
        res.json(data);
    }
    catch (err) {
        console.error("Error fetching available rooms by area:", err);
        res.status(500).send("Server error");
    }
}));
// Get aggregated room capacity per hotel (from view)
router.get("/views/aggregated-room-capacity", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, roomService_1.getAggregatedRoomCapacity)();
        res.json(data);
    }
    catch (err) {
        console.error("Error fetching aggregated room capacity:", err);
        res.status(500).send("Server error");
    }
}));
exports.default = router;
