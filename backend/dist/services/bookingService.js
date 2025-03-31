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
exports.createBooking = exports.getBookingById = exports.getAllBookings = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const getAllBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.booking.findMany();
});
exports.getAllBookings = getAllBookings;
const getBookingById = (bookingID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.booking.findUnique({
        where: { BookingID: bookingID },
    });
});
exports.getBookingById = getBookingById;
const createBooking = (customerID, roomID, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.booking.create({
        data: {
            CustomerID: customerID,
            RoomID: roomID,
            BookingDate: new Date(),
            StartDate: startDate,
            EndDate: endDate,
            IsArchived: false,
        },
    });
});
exports.createBooking = createBooking;
