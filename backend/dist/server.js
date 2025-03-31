"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const hotelRoutes_1 = __importDefault(require("./routes/hotelRoutes"));
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const hotelChainRoutes_1 = __importDefault(require("./routes/hotelChainRoutes"));
const rentingRoutes_1 = __importDefault(require("./routes/rentingRoutes"));
// Load environment variables
dotenv.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 5000;
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/booking", bookingRoutes_1.default);
app.use("/api/customers", customerRoutes_1.default);
app.use("/api/employees", employeeRoutes_1.default);
app.use("/api/hotels", hotelRoutes_1.default);
app.use("/api/rooms", roomRoutes_1.default);
app.use("/api/hotel-chains", hotelChainRoutes_1.default);
app.use("/api/rentings", rentingRoutes_1.default);
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
