import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  getAvailableRoomsByArea,
  getAggregatedRoomCapacity,
  updateRoom,
  deleteRoom,
  getFilteredRooms
} from "../services/roomService";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const filters: any = {};

    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
    if (req.query.capacity) filters.capacity = req.query.capacity as string;
    if (req.query.area) filters.area = req.query.area as string;
    if (req.query.hotelChain) filters.hotelChain = req.query.hotelChain as string;
    if (req.query.category) filters.starRating = parseInt(req.query.category as string);
    if (req.query.totalRooms) filters.numberOfRooms = parseInt(req.query.totalRooms as string);
    if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);

    const rooms = await getFilteredRooms(filters);
    res.json(rooms);
  } catch (err: any) {
    console.error("Error fetching rooms with filters:", err);
    res.status(500).send("Server error");
  }
});

// Get a specific room by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const roomID = parseInt(req.params.id);
    const room = await getRoomById(roomID);

    if (!room) {
       res.status(404).json({ message: "Room not found" });
       return
    }

    res.json(room);
  } catch (err) {
    console.error("Error fetching room:", err);
    res.status(500).send("Server error");
  }
});

// Create a new room
router.post(
  "/",
  [
    body("hotelID").isInt({ gt: 0 }).withMessage("Hotel ID must be a positive integer"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
    body("capacity").notEmpty().withMessage("Capacity must be provided"),
    body("isExtendable").optional().isBoolean().withMessage("isExtendable must be a boolean"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { hotelID, price, capacity, amenities, viewType, isExtendable, damageDescription } = req.body;

    try {
      const room = await createRoom(hotelID, price, capacity, amenities, viewType, isExtendable, damageDescription);
      res.status(201).json({ message: "Room created successfully", room });
    } catch (err) {
      console.error("Error creating room:", err);
      res.status(500).send("Server error");
    }
  }
);

// Update a room
router.put(
  "/:id",
  [
    param("id").isInt().withMessage("Room ID must be an integer"),
    body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
    body("capacity").notEmpty().withMessage("Capacity must be provided"),
    body("isExtendable").optional().isBoolean().withMessage("isExtendable must be a boolean"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }

    const roomID = parseInt(req.params.id);
    const { price, capacity, amenities, viewType, isExtendable, damageDescription } = req.body;

    try {
      const updatedRoom = await updateRoom(roomID, price, capacity, amenities, viewType, isExtendable, damageDescription);
      res.json({ message: "Room updated successfully", updatedRoom });
    } catch (err) {
      console.error("Error updating room:", err);
      res.status(500).send("Server error");
    }
  }
);

// Delete a room
router.delete(
  "/:id",
  [param("id").isInt().withMessage("Room ID must be an integer")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }

    try {
      await deleteRoom(parseInt(req.params.id));
      res.json({ message: "Room deleted successfully" });
    } catch (err) {
      console.log("Error deleting room:", err);
      res.status(500).send("Server error");
    }
  }
);

// Get available rooms per area (from view)
router.get("/views/available-rooms-per-area", async (req: Request, res: Response) => {
  try {
    const data = await getAvailableRoomsByArea();
    const formattedData = data.map((item: any) => ({
      Area: item.area,
      TotalAvailableRooms: Number(item.totalavailablerooms),
    }));
    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching available rooms by area:", err);
    res.status(500).send("Server error");
  }
});

// Get aggregated room capacity per hotel with hotel information (from view)
router.get("/views/aggregated-room-capacity", async (req: Request, res: Response) => {
  try {
    const data = await getAggregatedRoomCapacity();
    const formattedData = data.map((item: any) => ({
      HotelID: item.hotelid,
      HotelName: item.hotelname,
      Address: item.address,
      StarRating: item.starrating,
      TotalCapacity: Number(item.totalcapacity),
    }));
    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching aggregated room capacity:", err);
    res.status(500).send("Server error");
  }
});

export default router;
