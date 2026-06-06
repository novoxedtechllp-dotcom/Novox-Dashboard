import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/me")
  .get(getMyProfile)
  .put(upload.single("avatar"), updateMyProfile);

export default router;
