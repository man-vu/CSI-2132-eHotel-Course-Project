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
exports.deleteHotel = exports.updateHotel = exports.getRoomsByHotelId = exports.getHotelById = exports.getAllHotels = exports.createHotel = void 0;
const prisma_1 = __importDefault(require("./prisma"));
// Create a new hotel
const createHotel = (chainID, name, address, starRating, email, phone, numberOfRooms) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.hotel.create({
        data: {
            ChainID: chainID,
            Name: name,
            Address: address,
            StarRating: starRating,
            Email: email,
            Phone: phone,
            NumberOfRooms: numberOfRooms,
        },
    });
});
exports.createHotel = createHotel;
// Get all hotels
const getAllHotels = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.hotel.findMany();
});
exports.getAllHotels = getAllHotels;
// Get a hotel by ID
const getHotelById = (hotelID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.hotel.findUnique({
        where: { HotelID: hotelID },
    });
});
exports.getHotelById = getHotelById;
// Fetch rooms for a specific hotel
const getRoomsByHotelId = (hotelID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.room.findMany({
        where: { HotelID: hotelID },
    });
});
exports.getRoomsByHotelId = getRoomsByHotelId;
// Update a hotel
const updateHotel = (hotelID, name, address, starRating, email, phone, numberOfRooms) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.hotel.update({
        where: { HotelID: hotelID },
        data: {
            Name: name,
            Address: address,
            StarRating: starRating,
            Email: email,
            Phone: phone,
            NumberOfRooms: numberOfRooms,
        },
    });
});
exports.updateHotel = updateHotel;
// Delete a hotel
const deleteHotel = (hotelID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.hotel.delete({
        where: { HotelID: hotelID },
    });
});
exports.deleteHotel = deleteHotel;
