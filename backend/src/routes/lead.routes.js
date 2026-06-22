import { Router } from "express";
import {
  getLeads,
  createLead,
  updateLeadStage,
  getLeadSources,
  getPerformance,
  addLeadActivity,
  getLeadActivities
} from "../controllers/lead.controller.js";

const router = Router();

router.route("/").get(getLeads).post(createLead);
router.route("/sources").get(getLeadSources);
router.route("/performance").get(getPerformance);
router.route("/:id").put(updateLeadStage);
router.route("/:id/activities").get(getLeadActivities).post(addLeadActivity);

export default router;
