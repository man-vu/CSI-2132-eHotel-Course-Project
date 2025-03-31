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
exports.createRenting = exports.getRentingById = exports.getAllRentings = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const getAllRentings = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.renting.findMany();
});
exports.getAllRentings = getAllRentings;
const getRentingById = (rentingID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.renting.findUnique({
        where: { RentingID: rentingID },
    });
});
exports.getRentingById = getRentingById;
const createRenting = (customerID, roomID, handledBy, duration) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.renting.create({
        data: {
            CustomerID: customerID,
            RoomID: roomID,
            RentDate: new Date(),
            Duration: duration,
            HandledBy: handledBy,
            IsArchived: false,
        },
    });
});
exports.createRenting = createRenting;
