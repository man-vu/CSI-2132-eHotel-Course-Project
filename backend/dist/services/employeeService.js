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
exports.deleteEmployee = exports.updateEmployee = exports.getEmployeeById = exports.getAllEmployees = exports.createEmployee = void 0;
const prisma_1 = __importDefault(require("./prisma"));
// Create a new employee
const createEmployee = (fullName, email, password, hotelID, address, ssn, role) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.employee.create({
        data: {
            FullName: fullName,
            Email: email,
            Password: password,
            HotelID: hotelID,
            Address: address,
            SSN: ssn,
            Role: role,
        },
    });
});
exports.createEmployee = createEmployee;
// Get all employees
const getAllEmployees = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.employee.findMany();
});
exports.getAllEmployees = getAllEmployees;
// Get an employee by ID
const getEmployeeById = (employeeID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.employee.findUnique({
        where: { EmployeeID: employeeID },
    });
});
exports.getEmployeeById = getEmployeeById;
// Update an employee
const updateEmployee = (employeeID, fullName, address, role) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.employee.update({
        where: { EmployeeID: employeeID },
        data: {
            FullName: fullName,
            Address: address,
            Role: role,
        },
    });
});
exports.updateEmployee = updateEmployee;
// Delete an employee
const deleteEmployee = (employeeID) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.employee.delete({
        where: { EmployeeID: employeeID },
    });
});
exports.deleteEmployee = deleteEmployee;
