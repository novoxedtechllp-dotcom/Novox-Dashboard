import { Router } from "express";
import {
  getGalleryImages,
  uploadGalleryImage,
} from "../controllers/gallery.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public route to fetch all gallery images
router.route("/").get(getGalleryImages);

// Protect all upload operations (Admin only)
router.use(verifyJWT);
router.use(authorize({ roles: [ROLES.ADMIN] }));

router.route("/upload").post(upload.single("image"), uploadGalleryImage);

export default router;

