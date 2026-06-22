import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

// Admin only routes for company settings
router.route("/")
  .get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getSettings) // Employees might need to view settings to know their limits
  .put(authorize({ roles: [ROLES.ADMIN] }), updateSettings); // Only admins can update

export default router;
