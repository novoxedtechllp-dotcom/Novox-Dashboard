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

const router = Router();

// Course CRUD
router.route("/").post(createCourse).get(getCourses);
router.route("/:id").get(getCourseById).put(updateCourse).delete(deleteCourse);

// Course Modules (Curriculum Breakdown)
router.route("/:id/modules").post(addCourseModule);
router.route("/:id/modules/:moduleId").put(updateCourseModule).delete(deleteCourseModule);

// Course Schedules
router.route("/:id/schedules").post(addCourseSchedule);
router.route("/:id/schedules/:scheduleId").delete(deleteCourseSchedule);

// Course Instructors
router.route("/:id/instructors").post(assignInstructorToCourse);
router.route("/:id/instructors/:instructorId").delete(removeInstructorFromCourse);

export default router;
