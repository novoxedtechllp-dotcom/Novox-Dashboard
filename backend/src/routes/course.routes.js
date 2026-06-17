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
  getAdminDailyPlan,
  batchAssignStudentsToCourse,
  patchModuleStatus,
  reorderModules,
  reorderSubmodules,
  reorderTasks,
  reorderSubtasks,
  addCourseSubtask,
  updateCourseSubtask,
  deleteCourseSubtask,
  submitSubmoduleReview,
  getSubmoduleReviews
} from "../controllers/course.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES, EMPLOYEE_ROLES } from "../constants/roles.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

// Read
router.route("/daily-plan/reviews").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getSubmoduleReviews);
router.route("/daily-plan").get(authorize({ roles: [ROLES.ADMIN] }), getAdminDailyPlan);
router.route("/").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getCourses);
router.route("/:courseId").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.STUDENT] }), getCourseById);
router.route("/:courseId/students").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getCourseStudents);
router.route("/:courseId/employees").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getCourseEmployees);

// Write (Admin only)
const writeAuth = authorize({ 
  roles: [ROLES.ADMIN],
  employeeRoles: [
    EMPLOYEE_ROLES.HR,
    EMPLOYEE_ROLES.DEVELOPMENT,
    EMPLOYEE_ROLES.DESIGN,
    EMPLOYEE_ROLES.SALES,
    EMPLOYEE_ROLES.MARKETING
  ]
});

router.route("/").post(writeAuth, createCourse);
router.route("/:courseId").put(writeAuth, updateCourse).delete(writeAuth, deleteCourse);

router.route("/:courseId/publish").patch(writeAuth, publishCourse);
router.route("/:courseId/archive").patch(writeAuth, archiveCourse);

// ── Modules ──────────────────────────────────────────────────
router.route("/:courseId/modules").post(writeAuth, addCourseModule);
router.route("/:courseId/modules/reorder").patch(writeAuth, reorderModules);
router.route("/:courseId/modules/:moduleId").put(writeAuth, updateCourseModule).delete(writeAuth, deleteCourseModule);
router.route("/:courseId/modules/:moduleId/status").patch(writeAuth, patchModuleStatus);
// router.route("/:courseId/modules/:moduleId/reviews").post(authorize({ roles: [ROLES.STUDENT] }), submitModuleReview);

// ── Submodules ────────────────────────────────────────────────
router.route("/:courseId/modules/:moduleId/submodules").post(writeAuth, addCourseSubmodule);
router.route("/:courseId/modules/:moduleId/submodules/reorder").patch(writeAuth, reorderSubmodules);
router.route("/:courseId/modules/:moduleId/submodules/:submoduleId").put(writeAuth, updateCourseSubmodule).delete(writeAuth, deleteCourseSubmodule);
router.route("/:courseId/modules/:moduleId/submodules/:submoduleId/reviews").post(authorize({ roles: [ROLES.STUDENT] }), submitSubmoduleReview);

// ── Tasks ─────────────────────────────────────────────────────
router.route("/:courseId/modules/:moduleId/submodules/:submoduleId/tasks").post(writeAuth, addCourseTask);
router.route("/:courseId/modules/:moduleId/submodules/:submoduleId/tasks/reorder").patch(writeAuth, reorderTasks);
router.route("/:courseId/modules/:moduleId/submodules/:submoduleId/tasks/:taskId").put(writeAuth, updateCourseTask).delete(writeAuth, deleteCourseTask);

// ── Subtasks ──────────────────────────────────────────────────
router.route("/:courseId/modules/:moduleId/submodules/:submoduleId/tasks/:taskId/subtasks").post(writeAuth, addCourseSubtask);
router.route("/:courseId/modules/:moduleId/submodules/:submoduleId/tasks/:taskId/subtasks/reorder").patch(writeAuth, reorderSubtasks);
router.route("/:courseId/modules/:moduleId/submodules/:submoduleId/tasks/:taskId/subtasks/:subtaskId").put(writeAuth, updateCourseSubtask).delete(writeAuth, deleteCourseSubtask);

router.route("/:courseId/schedule-plan").post(writeAuth, autoSchedulePlan);
router.route("/:courseId/schedule-plan/preview").post(writeAuth, previewAutoSchedule);
router.route("/:courseId/reschedule").post(writeAuth, reschedulePlan);

router.route("/:courseId/schedules").post(writeAuth, addCourseSchedule);
router.route("/:courseId/schedules/:scheduleId").delete(writeAuth, deleteCourseSchedule);

router.route("/:courseId/students/batch-assign").post(writeAuth, batchAssignStudentsToCourse);

router.route("/:courseId/instructors").post(writeAuth, assignInstructorToCourse);
router.route("/:courseId/instructors/:instructorId").delete(writeAuth, removeInstructorFromCourse);

export default router;
