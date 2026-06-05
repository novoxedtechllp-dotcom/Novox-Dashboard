import { Router } from "express";
import {
  submitReport,
  getReports,
  getReportById,
  approveReport,
  rejectReport
} from "../controllers/work-report.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES, EMPLOYEE_ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

// Employees and Admins can submit and view reports
const readWriteAuth = authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] });

router.route("/")
  .post(readWriteAuth, submitReport)
  .get(readWriteAuth, getReports);

router.route("/:reportId")
  .get(readWriteAuth, getReportById);

// Only Admins and HR can approve/reject reports
const adminHrAuth = authorize({ roles: [ROLES.ADMIN], employeeRoles: [EMPLOYEE_ROLES.HR] });

router.route("/:reportId/approve").patch(adminHrAuth, approveReport);
router.route("/:reportId/reject").patch(adminHrAuth, rejectReport);

export default router;
