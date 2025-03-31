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
const hotelService_1 = require("../services/hotelService");
const router = express_1.default.Router();
// Get all hotels
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotels = yield (0, hotelService_1.getAllHotels)();
        res.json(hotels);
    }
    catch (err) {
        console.error("Error fetching hotels:", err);
        res.status(500).send("Server error");
    }
}));
// Get a specific hotel by ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotelID = parseInt(req.params.id);
        const hotel = yield (0, hotelService_1.getHotelById)(hotelID);
        if (!hotel) {
            res.status(404).json({ message: "Hotel not found" });
        }
        res.json(hotel);
    }
    catch (err) {
        console.error("Error fetching hotel:", err);
        res.status(500).send("Server error");
    }
}));
// Get rooms for a specific hotel
router.get("/:id/rooms", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotelID = parseInt(req.params.id);
        const rooms = yield (0, hotelService_1.getRoomsByHotelId)(hotelID);
        res.json(rooms);
    }
    catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).send("Server error");
    }
}));
// Create a hotel
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield (0, hotelService_1.createHotel)(req.body.chainID, req.body.name, req.body.address, req.body.starRating, req.body.email, req.body.phone, req.body.numberOfRooms);
        res.status(201).json(hotel);
    }
    catch (err) {
        console.error("Error creating hotel:", err);
        res.status(500).send("Server error");
    }
}));
// Update hotel
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedHotel = yield (0, hotelService_1.updateHotel)(parseInt(req.params.id), req.body.name, req.body.address, req.body.starRating, req.body.email, req.body.phone, req.body.numberOfRooms);
        res.json(updatedHotel);
    }
    catch (err) {
        console.error("Error updating hotel:", err);
        res.status(500).send("Server error");
    }
}));
// Delete hotel
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, hotelService_1.deleteHotel)(parseInt(req.params.id));
        res.json({ message: "Hotel deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting hotel:", err);
        res.status(500).send("Server error");
    }
}));
exports.default = router;
