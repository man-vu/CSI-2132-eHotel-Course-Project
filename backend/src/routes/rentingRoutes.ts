import express, { Request, Response } from "express";
import { getRentings, createRenting, checkOutRenting, createTransaction } from "../services/rentingService";
import { verifyToken, requireEmployee } from "../middleware/authMiddleware";

// Extend Request type to include user property
interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

const router = express.Router();

// Protect routes
router.use(verifyToken);

// Get all rentings
router.get("/", requireEmployee, async (req: Request, res: Response) => {
  try {
    const rentings = await getRentings();
    res.json(rentings);
  } catch (err) {
    console.error("Error fetching rentings:", err);
    res.status(500).send("Server error");
  }
});

// Get a specific renting by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const rentingID = parseInt(req.params.id);
    const renting = await getRentings({rentingID: rentingID});

    if (!renting) {
      res.status(404).json({ message: "Renting not found" });
    }

    res.json(renting);
  } catch (err) {
    console.error("Error fetching renting:", err);
    res.status(500).send("Server error");
  }
});

// Create a new renting
router.post("/", requireEmployee, async (req: AuthRequest, res: Response) => {
  const { customerId, roomId, hotelId, startDate, endDate } = req.body;

  if (!customerId || !roomId || !hotelId || !startDate || !endDate) {
    res.status(400).json({ error: "All fields are required." });
return
  }

  try {
    const duration = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)); // Duration in days

    if (!req.user?.userId) {
      res.status(400).json({ error: "User ID is required." });
return
    }

    const renting = await createRenting(customerId, roomId, hotelId, req.user.userId, duration, startDate);
    res.status(201).json({ ok: true, message: "Renting created successfully", renting });
  } catch (err) {
    console.error("Error creating renting:", err);
    res.status(500).send("Server error");
  }
});

// Check-out a renting
router.post("/:rentingId/check-out", requireEmployee, async (req: AuthRequest, res: Response) => {
  const { rentingId } = req.params;

  try {
    const renting = await checkOutRenting(Number(rentingId));
    res.status(200).json({ message: "Check-out successful", renting });
    return
  } catch (err) {
    console.error("Error checking out:", err);
    res.status(500).send("Server error");
    return
  }
});

// Process payment for a renting
router.post("/:rentingId/payment", requireEmployee, async (req: AuthRequest, res: Response) => {
  const { rentingId } = req.params;
  const { amount, paymentMethod, customerId } = req.body;

  if (!amount || !paymentMethod) {
    res.status(400).json({ error: "Amount and payment method are required." });
    return
  }

  try {
    const transaction = await createTransaction(customerId, Number(rentingId), amount, paymentMethod);
    res.status(201).json({ ok: true, message: "Payment successful", transaction });
    return
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).send("Server error");
    return
  }
});

export default router;
