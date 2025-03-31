import express, { Request, Response } from "express";
import {   createHotel, updateHotel, deleteHotel, getHotels, getRoomsByHotelId } from "../services/hotelService";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Get all hotels
router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await getHotels();
    res.json(hotels);
  } catch (err) {
    console.error("Error fetching hotels:", err);
    res.status(500).send("Server error");
  }
});

// Get a specific hotel by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const hotelID = parseInt(req.params.id);
    const hotel = await getHotels(hotelID);

    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
    }

    res.json(hotel);
  } catch (err) {
    console.error("Error fetching hotel:", err);
    res.status(500).send("Server error");
  }
});

// Get rooms for a specific hotel
router.get("/:id/rooms", async (req: Request, res: Response) => {
  try {
    const hotelID = parseInt(req.params.id);
    const rooms = await getRoomsByHotelId(hotelID);
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).send("Server error");
  }
});

// Create a hotel
router.post(
  "/",
  [
    body("chainID").isInt().withMessage("Chain ID must be an integer"),
    body("name").isString().withMessage("Name must be a string"),
    body("address").isString().withMessage("Address must be a string"),
    body("starRating").isInt({ min: 1, max: 5 }).withMessage("Star rating must be an integer between 1 and 5"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("phone").isString().withMessage("Phone must be a string")
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }

    try {
      const hotel = await createHotel(
        req.body.chainID,
        req.body.name,
        req.body.address,
        req.body.starRating,
        req.body.email,
        req.body.phone
      );
      res.status(201).json(hotel);
    } catch (err) {
      console.error("Error creating hotel:", err);
      res.status(500).send("Server error");
    }
  }
);

// Update hotel
router.put(
  "/:id",
  [
    body("name").optional().isString().withMessage("Name must be a string"),
    body("address").optional().isString().withMessage("Address must be a string"),
    body("starRating").optional().isInt({ min: 1, max: 5 }).withMessage("Star rating must be an integer between 1 and 5"),
    body("email").optional().isEmail().withMessage("Email must be valid"),
    body("phone").optional().isString().withMessage("Phone must be a string"),
    body("numberOfRooms").optional().isInt().withMessage("Number of rooms must be an integer")
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const updatedHotel = await updateHotel(
        parseInt(req.params.id),
        req.body.name,
        req.body.address,
        req.body.starRating,
        req.body.email,
        req.body.phone,
        req.body.numberOfRooms
      );
      res.json(updatedHotel);
    } catch (err) {
      console.error("Error updating hotel:", err);
      res.status(500).send("Server error");
    }
  }
);

// Delete hotel
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteHotel(parseInt(req.params.id));
    res.json({ message: "Hotel deleted successfully" });
  } catch (err) {
    console.error("Error deleting hotel:", err);
    if (err instanceof Error && err.message.includes("Cannot delete hotel with active bookings")) {
      res.status(400).send({ message: "Cannot delete hotel with active bookings" });
    } else if (err instanceof Error && err.message.includes("violates foreign key constraint \"employee_hotelid_fkey\"")) {
      res.status(400).send({ message: "Cannot delete hotel as it is associated with employees" });
    } else {
      res.status(500).send("Server error");
    }
  }
});

export default router;
