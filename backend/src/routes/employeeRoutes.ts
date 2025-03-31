import express, { Request, Response } from "express";

import { body, validationResult } from "express-validator";
import {
  createEmployee,
  getEmployees,
  updateEmployee, 
  deleteEmployee,
} from "../services/employeeService";

const router = express.Router();

// Create an employee
router.post( "/",
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("hotelID").isInt().withMessage("Hotel ID must be an integer"),
    body("address").notEmpty().withMessage("Address is required"),
    body("ssn").notEmpty().withMessage("SSN is required"),
    body("role").notEmpty().withMessage("Role is required"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }

    const { fullName, hotelID, address, ssn, role, email, password } = req.body;

    try {
      const employee = await createEmployee(fullName, email, password, hotelID, address, ssn, role);
      res.status(201).json(employee);
    } catch (err) {
      console.error("Error creating employee:", err);
      res.status(500).send("Server error");
    }
  }
);

// Get all employees
router.get("/", async (_, res: Response) => {
  try {
    const employees = await getEmployees();
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).send("Server error");
  }
});

// Get an employee by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const employee = await getEmployees({employeeID: parseInt(req.params.id)});
    if (!employee) res.status(404).json({ message: "Employee not found" });

    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).send("Server error");
  }
});

// Update an employee
router.put(
  "/:id",
  [
    body("fullName").optional().notEmpty().withMessage("Full name is required"),
    body("hotelID").optional().isInt().withMessage("Hotel ID must be an integer"),
    body("address").optional().notEmpty().withMessage("Address is required"),
    body("ssn").optional().notEmpty().withMessage("SSN is required"),
    body("role").optional().notEmpty().withMessage("Role is required"),
    body("email").optional().isEmail().withMessage("Email must be valid"),
    body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { fullName, hotelID, address, ssn, role, email, password } = req.body;

    try {
      const employee: any = await getEmployees({employeeID: parseInt(req.params.id)});
      if (!employee) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }

      const updatedFields = {
        fullName: fullName ?? employee.FullName,
        hotelID: hotelID ?? employee.HotelID,
        address: address ?? employee.Address,
        ssn: ssn ?? employee.SSN,
        role: role ?? employee.Role,
        email: email ?? employee.Email,
        password: password ?? employee.Password,
      };

      const updatedEmployee = await updateEmployee(
        parseInt(req.params.id),
        updatedFields.fullName,
        updatedFields.email,
        updatedFields.password,
        updatedFields.hotelID,
        updatedFields.address,
        updatedFields.ssn,
        updatedFields.role
      );
      res.json(updatedEmployee);
    } catch (err) {
      console.error("Error updating employee:", err);
      res.status(500).send("Server error");
    }
  }
);

// Delete an employee
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteEmployee(parseInt(req.params.id));
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).send("Server error");
  }
});

export default router;
