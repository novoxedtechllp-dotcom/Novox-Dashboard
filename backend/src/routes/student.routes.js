import { Router } from "express";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

// Read
router.route("/").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getStudents);
router.route("/:id").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getStudentById);

// Write
router.route("/").post(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), createStudent);
router.route("/:id").put(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), updateStudent);
router.route("/:id").delete(authorize({ roles: [ROLES.ADMIN] }), deleteStudent);

export default router;
