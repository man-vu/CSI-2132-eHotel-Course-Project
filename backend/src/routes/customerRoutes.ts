import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService";

const router = express.Router();

// Create a new customer
router.post(
  "/",
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("idType").notEmpty().withMessage("ID type is required"),
    body("idNumber").notEmpty().withMessage("ID number is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }

    const { fullName, address, idType, idNumber, email, password } = req.body;

    try {
      const customer = await createCustomer(fullName, email, password, address, idType, idNumber);
      res.status(201).json(customer);
    } catch (err) {
      console.error("Error creating customer:", err);
      res.status(500).send("Server error");
    }
  }
);

// Get all customers
router.get("/", async (_, res: Response) => {
  try {
    const customers = await getCustomers();
    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).send("Server error");
  }
});

// Get a customer by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const customer = await getCustomers({customerID: parseInt(req.params.id)});
    if (!customer) res.status(404).json({ message: "Customer not found" });

    res.json(customer);
  } catch (err) {
    console.error("Error fetching customer:", err);
    res.status(500).send("Server error");
  }
});

// Update a customer
router.put(
  "/:id",
  [
    body("fullName").optional().notEmpty().withMessage("Full name is required"),
    body("address").optional().notEmpty().withMessage("Address is required"),
    body("idType").optional().notEmpty().withMessage("ID type is required"),
    body("idNumber").optional().notEmpty().withMessage("ID number is required"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("registrationDate").optional().isString().withMessage("Valid registration date is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { fullName, address, idType, idNumber, email, password, registrationDate } = req.body;

    try {
      const customer: any = await getCustomers({customerID: parseInt(req.params.id)});
      if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }

      const updatedFields = {
        fullName: fullName ?? customer.FullName,
        address: address ?? customer.Address,
        idType: idType ?? customer.IDType,
        idNumber: idNumber ?? customer.IDNumber,
        email: email ?? customer.Email,
        password: password ?? customer.Password,
        registrationDate: registrationDate ? new Date(registrationDate).toISOString() : customer.RegistrationDate.toISOString(),
      };

      const updatedCustomer = await updateCustomer(parseInt(req.params.id), updatedFields.fullName, updatedFields.address, updatedFields.idType, updatedFields.idNumber, updatedFields.email, updatedFields.password, updatedFields.registrationDate);
      res.json(updatedCustomer);
    } catch (err) {
      console.error("Error updating customer:", err);
      res.status(500).send("Server error");
    }
  }
);

// Delete a customer
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteCustomer(parseInt(req.params.id));
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Error deleting customer:", err);
    res.status(500).send("Server error");
  }
});

export default router;
