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
const express_1 = __importDefault(require("express"));
const employeeService_1 = require("../services/employeeService");
const router = express_1.default.Router();
// Create an employee
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, hotelID, address, ssn, role, email, password } = req.body;
    try {
        const employee = yield (0, employeeService_1.createEmployee)(fullName, email, password, hotelID, address, ssn, role);
        res.status(201).json(employee);
    }
    catch (err) {
        console.error("Error creating employee:", err);
        res.status(500).send("Server error");
    }
}));
// Get all employees
router.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield (0, employeeService_1.getAllEmployees)();
        res.json(employees);
    }
    catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).send("Server error");
    }
}));
// Get an employee by ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield (0, employeeService_1.getEmployeeById)(parseInt(req.params.id));
        if (!employee)
            res.status(404).json({ message: "Employee not found" });
        res.json(employee);
    }
    catch (err) {
        console.error("Error fetching employee:", err);
        res.status(500).send("Server error");
    }
}));
// Update an employee
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, address, role } = req.body;
    try {
        const updatedEmployee = yield (0, employeeService_1.updateEmployee)(parseInt(req.params.id), fullName, address, role);
        res.json(updatedEmployee);
    }
    catch (err) {
        console.error("Error updating employee:", err);
        res.status(500).send("Server error");
    }
}));
// Delete an employee
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, employeeService_1.deleteEmployee)(parseInt(req.params.id));
        res.json({ message: "Employee deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting employee:", err);
        res.status(500).send("Server error");
    }
}));
exports.default = router;
