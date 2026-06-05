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
  publishCourse,
  archiveCourse,
  getCourseStudents,
  getCourseEmployees
} from "../controllers/course.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

// Read
router.route("/").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getCourses);
router.route("/:courseId").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getCourseById);
router.route("/:courseId/students").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getCourseStudents);
router.route("/:courseId/employees").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getCourseEmployees);

// Write (Admin only)
const adminAuth = authorize({ roles: [ROLES.ADMIN] });

router.route("/").post(adminAuth, createCourse);
router.route("/:courseId").put(adminAuth, updateCourse).delete(adminAuth, deleteCourse);

router.route("/:courseId/publish").patch(adminAuth, publishCourse);
router.route("/:courseId/archive").patch(adminAuth, archiveCourse);

router.route("/:courseId/modules").post(adminAuth, addCourseModule);
router.route("/:courseId/modules/:moduleId").put(adminAuth, updateCourseModule).delete(adminAuth, deleteCourseModule);

router.route("/:courseId/schedules").post(adminAuth, addCourseSchedule);
router.route("/:courseId/schedules/:scheduleId").delete(adminAuth, deleteCourseSchedule);

router.route("/:courseId/instructors").post(adminAuth, assignInstructorToCourse);
router.route("/:courseId/instructors/:instructorId").delete(adminAuth, removeInstructorFromCourse);

export default router;
