import express, { Request, Response } from "express";
import { createBooking, getBookings, createRenting } from "../services/bookingService";
import { verifyToken, requireEmployee, requireCustomer } from "../middleware/authMiddleware";

// Extend Request type to include user property
interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

const router = express.Router();

// Protect routes
router.use(verifyToken);

// Create a booking
router.post("/", requireCustomer, async (req: Request, res: Response) => {
  const { customerId, roomId, hotelId, startDate, endDate } = req.body;

  if (!customerId || !roomId || !hotelId || !startDate || !endDate) {
    res.status(400).json({ error: "All fields are required." });
  }

  try {
    const booking = await createBooking(
      customerId,
      roomId,
      hotelId,
      startDate,
      endDate
    );
    res.status(201).json({ ok: true, message: "Booking successful", booking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).send("Server error");
  }
});

// Get all bookings for a customer
router.get("/", async (req: Request, res: Response) => {
  const { customerId } = req.query;

  if (!customerId) {
    res.status(400).json({ error: "Customer ID is required." });
    return;
  }

  try {
    const bookings = await getBookings({ customerID: Number(customerId) });
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).send("Server error");
  }
});

// Get all bookings for employees
router.get("/manage", requireEmployee, async (_req: Request, res: Response) => {
  try {
    const bookings = await getBookings({activeOnly: true});
     res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
     res.status(500).send("Server error");
  }
});

// Check-in a booking
router.post("/:bookingId/check-in", requireEmployee, async (req: AuthRequest, res: Response) => {
  const { bookingId } = req.params;

  try {
    const bookings = await getBookings({ bookingID: Number(bookingId) });
    if (!bookings || bookings.length === 0) {
      res.status(404).json({ error: "No bookings found" });
      return;
    }

    const booking = bookings[0] as {
      CustomerID: number;
      RoomID: number;
      HotelID: number;
      StartDate: string;
      EndDate: string;
      BookingID: number;
    };
    if (!booking) {
       res.status(404).json({ error: "Booking not found" });
       return
    }

    if (!req.user?.userId) {
      res.status(400).json({ error: "User ID is required." });
      return;
    }

    const renting = await createRenting(
      booking.CustomerID,
      booking.RoomID,
      booking.HotelID,
      req.user.userId, // Assuming req.user contains the authenticated employee's ID
      Math.ceil((new Date(booking.EndDate).getTime() - new Date(booking.StartDate).getTime()) / (1000 * 60 * 60 * 24)), // Duration in days
      booking.BookingID,
      booking.StartDate
    );

    res.status(201).json({ message: "Check-in successful", renting });
  } catch (err) {
    console.error("Error checking in:", err);
    res.status(500).send("Server error");
  }
});

export default router;
