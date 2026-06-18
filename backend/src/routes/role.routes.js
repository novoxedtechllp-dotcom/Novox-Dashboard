import { Router } from "express";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from "../controllers/role.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES, EMPLOYEE_ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

const writeAuth = authorize({ roles: [ROLES.ADMIN], employeeRoles: [EMPLOYEE_ROLES.HR] });

// Roles & Permissions management
router.route("/").get(authorize({ roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }), getRoles);
router.route("/").post(writeAuth, createRole);
router.route("/:roleId").put(writeAuth, updateRole);
router.route("/:roleId").delete(writeAuth, deleteRole);

export default router;
