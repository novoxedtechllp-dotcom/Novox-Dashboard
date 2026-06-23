import { Router } from "express";
import {
  createFeePlan,
  getFeePlans,
  recordPayment,
  getPayments,
  getStudentBalances,
  getStudentFeeDetails,
  deletePayment,
  updatePayment,
  getFeeSummary,
  updateFeePlan,
  updateDueDateOverride
} from "../controllers/fee.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

const adminEmployeeAuth = authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] });
const allRolesAuth = authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] });

// Fee Plans
router.route("/plans")
  .get(adminEmployeeAuth, getFeePlans)
  .post(adminEmployeeAuth, createFeePlan);

router.route("/plans/:planId")
  .put(adminEmployeeAuth, updateFeePlan);

router.route("/plans/:planId/due-date")
  .put(adminEmployeeAuth, updateDueDateOverride);

// Payments
router.route("/payments")
  .get(adminEmployeeAuth, getPayments)
  .post(adminEmployeeAuth, recordPayment);

router.route("/payments/:paymentId")
  .put(adminEmployeeAuth, updatePayment)
  .delete(adminEmployeeAuth, deletePayment);

// Student Balances (carry-forward calculations)
router.route("/balances").get(adminEmployeeAuth, getStudentBalances);

// Fee Summary (dashboard stats)
router.route("/summary").get(adminEmployeeAuth, getFeeSummary);

// Student-specific fee details (student can view their own)
router.route("/students/:studentId").get(allRolesAuth, getStudentFeeDetails);

export default router;
