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
const rentingService_1 = require("../services/rentingService");
const router = express_1.default.Router();
// Get all rentings
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rentings = yield (0, rentingService_1.getAllRentings)();
        res.json(rentings);
    }
    catch (err) {
        console.error("Error fetching rentings:", err);
        res.status(500).send("Server error");
    }
}));
// Get a specific renting by ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rentingID = parseInt(req.params.id);
        const renting = yield (0, rentingService_1.getRentingById)(rentingID);
        if (!renting) {
            res.status(404).json({ message: "Renting not found" });
        }
        res.json(renting);
    }
    catch (err) {
        console.error("Error fetching renting:", err);
        res.status(500).send("Server error");
    }
}));
// Create a new renting
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerID, roomID, handledBy, duration } = req.body;
    if (!customerID || !roomID || !handledBy || !duration) {
        res.status(400).json({ error: "All fields are required." });
    }
    try {
        const renting = yield (0, rentingService_1.createRenting)(customerID, roomID, handledBy, duration);
        res.status(201).json({ message: "Renting created successfully", renting });
    }
    catch (err) {
        console.error("Error creating renting:", err);
        res.status(500).send("Server error");
    }
}));
exports.default = router;
