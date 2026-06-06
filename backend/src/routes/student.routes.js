import { Router } from "express";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  assignCourse,
  getStudentProgress,
  getStudentReports,
  addStudentDocument,
  getStudentDocuments,
  deleteStudentDocument,
  getStudentTasks,
  updateStudentTask,
  getStudentDailyPlan
} from "../controllers/student.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES, EMPLOYEE_ROLES } from "../constants/roles.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

// ==========================================
// GLOBAL REPORTS (Needs to be above /:studentId routes)
// ==========================================
router.route("/reports").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getStudentReports);

// ==========================================
// CORE STUDENT CRUD
// ==========================================
// Read
router.route("/").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getStudents);

router.route("/:studentId").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getStudentById);
router.route("/:studentId/daily-plan").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getStudentDailyPlan);

// Write
router.route("/").post(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), upload.single("avatar"), createStudent);
router.route("/:studentId").put(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), upload.single("avatar"), updateStudent);
router.route("/:studentId").delete(authorize({ roles: [ROLES.ADMIN] }), deleteStudent);

// ==========================================
// SUB-RESOURCES (Courses, Progress, Documents)
// ==========================================
const writeAuth = authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] });
const readAuth = authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] });

router.route("/:studentId/courses").post(writeAuth, assignCourse);
router.route("/:studentId/progress").get(readAuth, getStudentProgress);

router.route("/:studentId/tasks").get(readAuth, getStudentTasks);
router.route("/:studentId/tasks/:taskId").put(readAuth, updateStudentTask);

router.route("/:studentId/documents")
  .get(readAuth, getStudentDocuments)
  .post(writeAuth, addStudentDocument);

router.route("/:studentId/documents/:documentId").delete(writeAuth, deleteStudentDocument);

export default router;
