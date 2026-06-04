import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  addEmployeeDocument,
  deleteEmployeeDocument,
  assignCourse,
  removeCourse,
  getEmployeeReport
} from "../controllers/employee.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES, EMPLOYEE_ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

// Employees and Admins can read
router.route("/").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getEmployees);
router.route("/:id").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getEmployeeById);
router.route("/:id/report").get(authorize({ roles: [ROLES.ADMIN], employeeRoles: [EMPLOYEE_ROLES.HR] }), getEmployeeReport);

// Only Admin / HR can create, update, delete
const writeAuth = authorize({ roles: [ROLES.ADMIN], employeeRoles: [EMPLOYEE_ROLES.HR] });

router.route("/").post(writeAuth, createEmployee);
router.route("/:id").put(writeAuth, updateEmployee).delete(writeAuth, deleteEmployee);

router.route("/:id/documents").post(writeAuth, addEmployeeDocument);
router.route("/:id/documents/:docId").delete(writeAuth, deleteEmployeeDocument);

router.route("/:id/courses").post(writeAuth, assignCourse);
router.route("/:id/courses/:courseId").delete(writeAuth, removeCourse);

export default router;
