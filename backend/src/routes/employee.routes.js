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

const router = Router();

// Employee Profile Routes
router.route("/").post(createEmployee).get(getEmployees);
router.route("/:id").get(getEmployeeById).put(updateEmployee).delete(deleteEmployee);

// Employee Documents Routes
router.route("/:id/documents").post(addEmployeeDocument);
router.route("/:id/documents/:docId").delete(deleteEmployeeDocument);

// Employee Courses Routes
router.route("/:id/courses").post(assignCourse);
router.route("/:id/courses/:courseId").delete(removeCourse);

// Employee Report Route
router.route("/:id/report").get(getEmployeeReport);

export default router;
