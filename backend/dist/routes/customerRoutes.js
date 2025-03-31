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
const customerService_1 = require("../services/customerService");
const router = express_1.default.Router();
// Create a new customer
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, address, idType, email, password } = req.body;
    try {
        const customer = yield (0, customerService_1.createCustomer)(fullName, email, password, address, idType);
        res.status(201).json(customer);
    }
    catch (err) {
        console.error("Error creating customer:", err);
        res.status(500).send("Server error");
    }
}));
// Get all customers
router.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customers = yield (0, customerService_1.getAllCustomers)();
        res.json(customers);
    }
    catch (err) {
        console.error("Error fetching customers:", err);
        res.status(500).send("Server error");
    }
}));
// Get a customer by ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield (0, customerService_1.getCustomerById)(parseInt(req.params.id));
        if (!customer)
            res.status(404).json({ message: "Customer not found" });
        res.json(customer);
    }
    catch (err) {
        console.error("Error fetching customer:", err);
        res.status(500).send("Server error");
    }
}));
// Update a customer
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, address, idType } = req.body;
    try {
        const updatedCustomer = yield (0, customerService_1.updateCustomer)(parseInt(req.params.id), fullName, address, idType);
        res.json(updatedCustomer);
    }
    catch (err) {
        console.error("Error updating customer:", err);
        res.status(500).send("Server error");
    }
}));
// Delete a customer
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, customerService_1.deleteCustomer)(parseInt(req.params.id));
        res.json({ message: "Customer deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting customer:", err);
        res.status(500).send("Server error");
    }
}));
exports.default = router;
