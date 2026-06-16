import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createLeave,
  getLeaves,
  updateLeaveStatus
} from "../controllers/leave.controller.js";

const router = Router();

// Protect all routes
router.use(verifyJWT);

router.route("/").post(createLeave).get(getLeaves);
router.route("/:id/status").put(updateLeaveStatus);

export default router;
