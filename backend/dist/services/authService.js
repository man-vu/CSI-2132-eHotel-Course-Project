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
exports.loginUser = exports.registerEmployee = exports.registerCustomer = exports.generateToken = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("./prisma"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Generate JWT Token
const generateToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
};
exports.generateToken = generateToken;
// Register Customer
const registerCustomer = (name, email, password, address, idType) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    return yield prisma_1.default.customer.create({
        data: {
            FullName: name,
            Email: email,
            Password: hashedPassword,
            Address: address,
            IDType: idType,
            RegistrationDate: new Date(),
        },
    });
});
exports.registerCustomer = registerCustomer;
// Register Employee
const registerEmployee = (name, email, password, address, ssn, role, hotelID) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    return yield prisma_1.default.employee.create({
        data: {
            FullName: name,
            Email: email,
            Password: hashedPassword,
            Address: address,
            SSN: ssn,
            Role: role,
            HotelID: hotelID,
        },
    });
});
exports.registerEmployee = registerEmployee;
// Login User
const loginUser = (email, password, role) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    if (role === "customer") {
        user = yield prisma_1.default.customer.findUnique({ where: { Email: email } });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.Password))) {
            throw new Error("Invalid email or password");
        }
        return (0, exports.generateToken)(user.CustomerID, role);
    }
    else {
        user = yield prisma_1.default.employee.findUnique({ where: { Email: email } });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.Password))) {
            throw new Error("Invalid email or password");
        }
        return (0, exports.generateToken)(user.EmployeeID, role);
    }
});
exports.loginUser = loginUser;
