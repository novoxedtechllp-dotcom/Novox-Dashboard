import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getPayroll, processPayroll, getEmployeePayslips } from "../controllers/payroll.controller.js";

const router = Router();

router.use(verifyJWT);

// Employee routes
router.get("/employee/:employeeId", getEmployeePayslips);

// Admin/HR routes
router.get("/", getPayroll);
router.post("/process", processPayroll);

export default router;
