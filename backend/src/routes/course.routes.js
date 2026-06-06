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
  addCourseSubmodule,
  updateCourseSubmodule,
  deleteCourseSubmodule,
  addCourseTask,
  updateCourseTask,
  deleteCourseTask,
  autoSchedulePlan,
  previewAutoSchedule,
  reschedulePlan,
  addCourseSchedule,
  deleteCourseSchedule,
  assignInstructorToCourse,
  removeInstructorFromCourse,
  publishCourse,
  archiveCourse,
  getCourseStudents,
  getCourseEmployees,
  getAdminDailyPlan
} from "../controllers/course.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES, EMPLOYEE_ROLES } from "../constants/roles.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

// Read
router.route("/daily-plan").get(authorize({ roles: [ROLES.ADMIN] }), getAdminDailyPlan);
router.route("/").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getCourses);
router.route("/:courseId").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getCourseById);
router.route("/:courseId/students").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getCourseStudents);
router.route("/:courseId/employees").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getCourseEmployees);

// Write (Admin and specific Employees)
const writeAuth = authorize({ 
  roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  employeeRoles: [
    EMPLOYEE_ROLES.HR,
    EMPLOYEE_ROLES.DEVELOPMENT,
    EMPLOYEE_ROLES.DESIGN,
    EMPLOYEE_ROLES.SALES,
    EMPLOYEE_ROLES.MARKETING
  ]
});

router.route("/").post(writeAuth, upload.single("thumbnail"), createCourse);
router.route("/:courseId").put(writeAuth, upload.single("thumbnail"), updateCourse).delete(writeAuth, deleteCourse);

router.route("/:courseId/publish").patch(writeAuth, publishCourse);
router.route("/:courseId/archive").patch(writeAuth, archiveCourse);

router.route("/:courseId/modules").post(writeAuth, addCourseModule);
router.route("/:courseId/modules/:moduleId").put(writeAuth, updateCourseModule).delete(writeAuth, deleteCourseModule);

router.route("/:courseId/modules/:moduleId/submodules").post(writeAuth, addCourseSubmodule);
router.route("/:courseId/modules/:moduleId/submodules/:submoduleId").put(writeAuth, updateCourseSubmodule).delete(writeAuth, deleteCourseSubmodule);

router.route("/:courseId/modules/:moduleId/submodules/:submoduleId/tasks").post(writeAuth, addCourseTask);
router.route("/:courseId/modules/:moduleId/submodules/:submoduleId/tasks/:taskId").put(writeAuth, updateCourseTask).delete(writeAuth, deleteCourseTask);

router.route("/:courseId/schedule-plan").post(writeAuth, autoSchedulePlan);
router.route("/:courseId/schedule-plan/preview").post(writeAuth, previewAutoSchedule);
router.route("/:courseId/reschedule").post(writeAuth, reschedulePlan);

router.route("/:courseId/schedules").post(writeAuth, addCourseSchedule);
router.route("/:courseId/schedules/:scheduleId").delete(writeAuth, deleteCourseSchedule);

router.route("/:courseId/instructors").post(writeAuth, assignInstructorToCourse);
router.route("/:courseId/instructors/:instructorId").delete(writeAuth, removeInstructorFromCourse);

export default router;
