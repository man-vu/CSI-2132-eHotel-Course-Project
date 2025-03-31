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
exports.deleteCustomer = exports.updateCustomer = exports.getCustomerById = exports.getAllCustomers = exports.createCustomer = void 0;
const prisma_1 = __importDefault(require("./prisma"));
// Create a new customer
const createCustomer = (fullName, email, password, address, idType) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.customer.create({
        data: {
            FullName: fullName,
            Email: email,
            Password: password,
            Address: address,
            IDType: idType,
            RegistrationDate: new Date(),
        },
    });
});
exports.createCustomer = createCustomer;
// Get all customers
const getAllCustomers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.customer.findMany();
});
exports.getAllCustomers = getAllCustomers;
// Get a customer by ID
const getCustomerById = (customerID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.customer.findUnique({
        where: { CustomerID: customerID },
    });
});
exports.getCustomerById = getCustomerById;
// Update a customer
const updateCustomer = (customerID, fullName, address, idType) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.customer.update({
        where: { CustomerID: customerID },
        data: {
            FullName: fullName,
            Address: address,
            IDType: idType,
        },
    });
});
exports.updateCustomer = updateCustomer;
// Delete a customer
const deleteCustomer = (customerID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.customer.delete({
        where: { CustomerID: customerID },
    });
});
exports.deleteCustomer = deleteCustomer;
