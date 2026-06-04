import { Router } from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addCourseModule,
  updateCourseModule,
  deleteCourseModule,
  addCourseSchedule,
  deleteCourseSchedule,
  assignInstructorToCourse,
  removeInstructorFromCourse,
} from "../controllers/course.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

// Read
router.route("/").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getCourses);
router.route("/:id").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getCourseById);

// Write (Admin only)
const adminAuth = authorize({ roles: [ROLES.ADMIN] });

router.route("/").post(adminAuth, createCourse);
router.route("/:id").put(adminAuth, updateCourse).delete(adminAuth, deleteCourse);

router.route("/:id/modules").post(adminAuth, addCourseModule);
router.route("/:id/modules/:moduleId").put(adminAuth, updateCourseModule).delete(adminAuth, deleteCourseModule);

router.route("/:id/schedules").post(adminAuth, addCourseSchedule);
router.route("/:id/schedules/:scheduleId").delete(adminAuth, deleteCourseSchedule);

router.route("/:id/instructors").post(adminAuth, assignInstructorToCourse);
router.route("/:id/instructors/:instructorId").delete(adminAuth, removeInstructorFromCourse);

export default router;
