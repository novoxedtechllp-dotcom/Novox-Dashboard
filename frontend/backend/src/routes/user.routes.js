import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();
router.use(verifyJWT);

// Only ADMIN can manage users
router.use(authorize({ roles: [ROLES.ADMIN] }));

router.route("/").post(createUser).get(getUsers);
router
  .route("/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
