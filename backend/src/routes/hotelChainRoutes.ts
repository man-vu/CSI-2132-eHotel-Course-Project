import express, { Request, Response } from "express";
import { getHotelChains } from "../services/hotelChainService";

const router = express.Router();

// Get all hotel chains
router.get("/", async (req: Request, res: Response) => {
  try {
    const hotelChains = await getHotelChains();
    res.json(hotelChains);
  } catch (err) {
    console.error("Error fetching hotel chains:", err);
    res.status(500).send("Server error");
  }
});

// Get a specific hotel chain by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const chainID = parseInt(req.params.id);
    const hotelChain = await getHotelChains({ chainID: chainID});

    if (!hotelChain) {
        res.status(404).json({ message: "Hotel chain not found" });
    }

    res.json(hotelChain);
  } catch (err) {
    console.error("Error fetching hotel chain:", err);
    res.status(500).send("Server error");
  }
});

export default router;
