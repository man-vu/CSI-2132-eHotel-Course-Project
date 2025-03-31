import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import customerRoutes from "./routes/customerRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import hotelRoutes from "./routes/hotelRoutes";
import roomRoutes from "./routes/roomRoutes";
import hotelChainRoutes from "./routes/hotelChainRoutes";
import rentingRoutes from "./routes/rentingRoutes"; 


// Load environment variables
dotenv.config();

const app = express();


app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true, 
}));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/hotel-chains", hotelChainRoutes);
app.use("/api/rentings", rentingRoutes); 


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
