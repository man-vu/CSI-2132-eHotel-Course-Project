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
exports.getFilteredRooms = exports.deleteRoom = exports.updateRoom = exports.getAggregatedRoomCapacity = exports.getAvailableRoomsByArea = exports.getRoomById = exports.getAllRooms = exports.createRoom = void 0;
const prisma_1 = __importDefault(require("./prisma"));
// Create a new room
const createRoom = (hotelID, price, capacity, amenities, viewType, isExtendable, damageDescription) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.room.create({
        data: {
            HotelID: hotelID,
            Price: price,
            Capacity: capacity,
            Amenities: amenities,
            ViewType: viewType,
            IsExtendable: isExtendable,
            DamageDescription: damageDescription,
        },
    });
});
exports.createRoom = createRoom;
// Get all rooms
const getAllRooms = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.room.findMany();
});
exports.getAllRooms = getAllRooms;
// Get a room by ID
const getRoomById = (roomID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.room.findUnique({
        where: { RoomID: roomID },
    });
});
exports.getRoomById = getRoomById;
// Fetch available rooms per area
const getAvailableRoomsByArea = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$queryRaw `SELECT * FROM AvailableRoomsByArea`;
});
exports.getAvailableRoomsByArea = getAvailableRoomsByArea;
// Fetch aggregated room capacity per hotel
const getAggregatedRoomCapacity = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$queryRaw `SELECT * FROM AggregatedRoomCapacity`;
});
exports.getAggregatedRoomCapacity = getAggregatedRoomCapacity;
// Update a room
const updateRoom = (roomID, price, capacity, amenities, viewType, isExtendable, damageDescription) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.room.update({
        where: { RoomID: roomID },
        data: {
            Price: price,
            Capacity: capacity,
            Amenities: amenities,
            ViewType: viewType,
            IsExtendable: isExtendable,
            DamageDescription: damageDescription,
        },
    });
});
exports.updateRoom = updateRoom;
// Delete a room
const deleteRoom = (roomID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.room.delete({
        where: { RoomID: roomID },
    });
});
exports.deleteRoom = deleteRoom;
const getFilteredRooms = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.room.findMany({
        where: {
            Capacity: filters.capacity || undefined,
            Price: {
                gte: filters.minPrice || undefined,
                lte: filters.maxPrice || undefined,
            },
            Hotel: {
                Address: filters.area ? { contains: filters.area, mode: "insensitive" } : undefined,
                ChainID: filters.hotelChain ? parseInt(filters.hotelChain) : undefined,
                StarRating: filters.starRating ? parseInt(filters.starRating) : undefined,
                NumberOfRooms: filters.numberOfRooms
                    ? { gte: parseInt(filters.numberOfRooms) }
                    : undefined,
            },
            AND: filters.startDate && filters.endDate
                ? {
                    NOT: {
                        Booking: {
                            some: {
                                OR: [
                                    {
                                        StartDate: { lte: filters.endDate },
                                        EndDate: { gte: filters.startDate },
                                    },
                                ],
                            },
                        },
                    },
                }
                : undefined,
        },
        include: {
            Hotel: true, // Fetch hotel details alongside rooms
        },
    });
});
exports.getFilteredRooms = getFilteredRooms;
