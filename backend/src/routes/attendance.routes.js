import { Router } from "express";
import {
  markAttendance,
  bulkAttendance,
  getAttendanceHistory,
  getAttendanceReport,
  checkInEmployee,
  checkOutEmployee,
  getTodayAttendance
} from "../controllers/attendance.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES, EMPLOYEE_ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

const writeAuth = authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] });

// Employee Secure Check-In/Out Routes
router.route("/check-in")
  .post(authorize({ roles: [ROLES.EMPLOYEE] }), checkInEmployee);

router.route("/check-out")
  .post(authorize({ roles: [ROLES.EMPLOYEE] }), checkOutEmployee);

// Admin Route to get today's detailed attendance list
router.route("/today")
  .get(authorize({ roles: [ROLES.ADMIN] }), getTodayAttendance);

router.route("/")
  .post(writeAuth, markAttendance)
  .get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getAttendanceHistory);

router.route("/bulk")
  .post(writeAuth, bulkAttendance);

router.route("/reports")
  .get(authorize({ roles: [ROLES.ADMIN], employeeRoles: [EMPLOYEE_ROLES.HR] }), getAttendanceReport);

export default router;
