import { Router } from "express";
import {
  markAttendance,
  bulkAttendance,
  getAttendanceHistory,
  getAttendanceReport
} from "../controllers/attendance.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES, EMPLOYEE_ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

const writeAuth = authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] });

router.route("/")
  .post(writeAuth, markAttendance)
  .get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getAttendanceHistory);

router.route("/bulk")
  .post(writeAuth, bulkAttendance);

router.route("/reports")
  .get(authorize({ roles: [ROLES.ADMIN], employeeRoles: [EMPLOYEE_ROLES.HR] }), getAttendanceReport);

export default router;
